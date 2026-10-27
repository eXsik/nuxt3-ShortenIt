import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';

// Execute the real Nitro handlers with isolated globals and no network/database access.
async function loadHandler(path, globals, imports) {
  const source = stripTypeScriptTypes(await readFile(new URL(path, import.meta.url), 'utf8'));
  const context = createContext({ URL, console, defineEventHandler: fn => fn,
    createError: details => Object.assign(new Error(details.statusMessage), details), ...globals });
  const module = new SourceTextModule(source, {
    context,
    initializeImportMeta: meta => { meta.dev = true; },
  });
  await module.link(specifier => {
    const values = imports[specifier];
    if (!values) throw new Error(`Unexpected import: ${specifier}`);
    return new SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace.default;
}

async function demo({ body = { longUrl: 'https://example.com' }, cookie, dbError, configured = true } = {}) {
  const rows = [], cookies = [];
  const handler = await loadHandler('../server/api/demo/shorten.post.ts', {
    process: { env: configured ? { SUPABASE_URL: 'https://database.test', SUPABASE_SERVICE_ROLE_KEY: 'test-key' } : {} },
    readBody: async () => body,
    getCookie: (_, name) => { assert.equal(name, 'demo_used'); return cookie; },
    setCookie: (_, ...args) => cookies.push(args),
    useRuntimeConfig: () => ({ public: { appUrl: 'https://short.test/' } }),
  }, {
    '@supabase/supabase-js': { createClient: () => ({ from: table => {
      assert.equal(table, 'links');
      return { insert: async row => { rows.push(row); return { error: dbError }; } };
    } }) },
    nanoid: { nanoid: () => 'abc123' },
  });
  return { handler, rows, cookies };
}

test('demo saves a trimmed anonymous link and sets the limit after success', async () => {
  const { handler, rows, cookies } = await demo({ body: { longUrl: ' https://example.com ' } });
  const result = await handler({});
  assert.equal(result.shortUrl, 'https://short.test/abc123');
  assert.equal(result.key, 'abc123');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].long_url, 'https://example.com');
  assert.equal(rows[0].user_id, null);
  assert.equal(rows[0].key, result.key);
  assert.equal(cookies[0][0], 'demo_used');
  assert.equal(cookies[0][1], '1');
  assert.equal(cookies[0][2].httpOnly, true);
  assert.equal(cookies[0][2].sameSite, 'lax');
});

test('demo rejects missing, malformed and unsafe URLs without writing', async () => {
  for (const body of [null, {}, { longUrl: 123 }, { longUrl: '' }, { longUrl: 'bad' }, { longUrl: 'javascript:alert(1)' }, { longUrl: 'ftp://example.com' }]) {
    const { handler, rows, cookies } = await demo({ body });
    await assert.rejects(handler({}), { statusCode: 400 });
    assert.equal(rows.length, 0);
    assert.equal(cookies.length, 0);
  }
});

test('existing demo cookie blocks a second write', async () => {
  const { handler, rows, cookies } = await demo({ cookie: '1' });
  await assert.rejects(handler({}), { statusCode: 403 });
  assert.equal(rows.length, 0);
  assert.equal(cookies.length, 0);
});

test('database failures do not consume the demo or expose database details', async () => {
  const { handler, cookies } = await demo({ dbError: { message: 'private database details' } });
  await assert.rejects(handler({}), { statusCode: 500, message: 'Could not shorten link' });
  assert.equal(cookies.length, 0);
});

test('missing server configuration fails before a write', async () => {
  const { handler, rows } = await demo({ configured: false });
  await assert.rejects(handler({}), { statusCode: 500 });
  assert.equal(rows.length, 0);
});

async function redirect(pathname, link = { id: 'link-1', long_url: 'https://example.com' }) {
  let lookups = 0;
  const handler = await loadHandler('../server/middleware/short-link.ts', {
    getRequestURL: () => new URL(pathname, 'https://short.test'),
    getHeader: () => undefined,
    getRequestIP: () => undefined,
    sendRedirect: (_, location, status) => ({ location, status }),
  }, {
    'geoip-lite': { default: { lookup: () => null } },
    '#supabase/server': { serverSupabaseClient: async () => {
      lookups++;
      return { from: () => ({ select: () => ({ eq: (column, key) => {
        assert.equal(column, 'key'); assert.equal(key, 'abc123');
        return { single: async () => ({ data: link, error: null }) };
      } }) }) };
    } },
  });
  return { handler, get lookups() { return lookups; } };
}

test('page and API paths bypass short-link lookup, including /try', async () => {
  for (const path of ['/', '/try', '/try/', '/dashboard', '/auth/login', '/api/demo/shorten', '/favicon.ico']) {
    const instance = await redirect(path);
    assert.equal(await instance.handler({}), undefined);
    assert.equal(instance.lookups, 0);
  }
});

test('known short link redirects to its destination with HTTP 302', async () => {
  const { handler } = await redirect('/abc123');
  const result = await handler({});
  assert.equal(result.location, 'https://example.com');
  assert.equal(result.status, 302);
});

test('unknown short link returns HTTP 404', async () => {
  const { handler } = await redirect('/abc123', null);
  await assert.rejects(handler({}), { statusCode: 404 });
});

test('tracking finishes before redirect and tracking failures do not break links', async () => {
  for (const failure of ['none', 'database', 'network']) {
    const order = [], rows = [];
    const handler = await loadHandler('../server/middleware/short-link.ts', {
      console: { error: () => {} },
      getRequestURL: () => new URL('https://short.test/abc123'),
      getHeader: (_, name) => name === 'x-forwarded-for' ? '203.0.113.1, 10.0.0.1' : 'test-agent',
      getRequestIP: () => undefined,
      sendRedirect: (_, location, status) => { order.push('redirect'); return { location, status }; },
    }, {
      'geoip-lite': { default: { lookup: () => ({ country: 'PL', city: 'Warsaw' }) } },
      '#supabase/server': { serverSupabaseClient: async () => ({ from: table => {
        if (table === 'links') return { select: () => ({ eq: () => ({ single: async () => ({ data: { id: 1, long_url: 'https://example.com' }, error: null }) }) }) };
        assert.equal(table, 'clicks');
        return { insert: async row => {
          await Promise.resolve();
          rows.push(row); order.push('tracking');
          if (failure === 'network') throw new Error('Network failure');
          return { error: failure === 'database' ? { message: 'Denied' } : null };
        } };
      } }) },
    });
    const result = await handler({});
    assert.equal(result.status, 302);
    assert.equal(result.location, 'https://example.com');
    assert.deepEqual(order, ['tracking', 'redirect']);
    assert.equal(rows[0].ip, '203.0.113.1');
    assert.equal(rows[0].country, 'PL');
    assert.equal(rows[0].user_agent, 'test-agent');
  }
});
