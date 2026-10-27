import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';

async function harness({ user = { id: 'verified-owner' }, authError = null, body = { longUrl: 'https://example.com', shortKey: 'My_link-1' }, dbError = null } = {}) {
  const rows = [];
  let bodyReads = 0;
  const client = {
    auth: { getUser: async () => ({ data: { user }, error: authError }) },
    from: table => {
      assert.equal(table, 'links');
      return { insert: async row => { rows.push(row); return { error: dbError }; } };
    },
  };
  const context = createContext({ URL, defineEventHandler: fn => fn,
    createError: data => Object.assign(new Error(data.statusMessage), data),
    readBody: async () => { bodyReads++; return body; },
  });
  const module = new SourceTextModule(stripTypeScriptTypes(await readFile(new URL('../server/api/links/index.post.ts', import.meta.url), 'utf8')), { context });
  await module.link(specifier => {
    assert.equal(specifier, '#supabase/server');
    return new SyntheticModule(['serverSupabaseClient'], function () {
      this.setExport('serverSupabaseClient', async () => client);
    }, { context });
  });
  await module.evaluate();
  return { handler: module.namespace.default, rows, get bodyReads() { return bodyReads; } };
}

test('unauthenticated or invalid sessions are rejected before reading the body', async () => {
  for (const options of [{ user: null }, { authError: { message: 'expired' } }]) {
    const h = await harness(options);
    await assert.rejects(h.handler({}), { statusCode: 401 });
    assert.equal(h.bodyReads, 0);
    assert.equal(h.rows.length, 0);
  }
});

test('direct API requests cannot bypass URL and key validation', async () => {
  const invalid = [null, {}, { longUrl: 123, shortKey: 'abc' }, { longUrl: 'https://example.com', shortKey: 123 }];
  for (const longUrl of ['', 'invalid', 'javascript:alert(1)', 'ftp://example.com']) invalid.push({ longUrl, shortKey: 'abc' });
  for (const shortKey of ['try', 'Dashboard', 'api', '_nuxt', 'a/b', 'a#b', 'a?b', 'a.b', 'a%2Fb', 'a b']) invalid.push({ longUrl: 'https://example.com', shortKey });
  for (const body of invalid) {
    const h = await harness({ body });
    await assert.rejects(h.handler({}), { statusCode: 400 });
    assert.equal(h.rows.length, 0);
  }
});

test('API assigns ownership from verified auth and ignores forged fields', async () => {
  const h = await harness({ body: { longUrl: ' https://example.com/path ', shortKey: ' My_link-1 ', user_id: 'victim', total_clicks: 999 } });
  const result = await h.handler({});
  assert.equal(result.key, 'My_link-1');
  assert.equal(h.rows.length, 1);
  assert.equal(h.rows[0].user_id, 'verified-owner');
  assert.equal(h.rows[0].long_url, 'https://example.com/path');
  assert.equal(h.rows[0].key, 'My_link-1');
  assert.equal(h.rows[0].total_clicks, undefined);
});

test('duplicate keys return a useful HTTP 409', async () => {
  const h = await harness({ dbError: { code: '23505', message: 'private details' } });
  await assert.rejects(h.handler({}), { statusCode: 409, message: 'This short key is already taken. Choose another one.' });
});

test('other database errors hide internal details', async () => {
  const h = await harness({ dbError: { code: '42501', message: 'private details' } });
  await assert.rejects(h.handler({}), { statusCode: 500, message: 'Could not shorten link. Try again.' });
});
