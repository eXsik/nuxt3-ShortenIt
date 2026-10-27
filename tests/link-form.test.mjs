import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';
import { parse } from '@vue/compiler-sfc';

async function formHarness(fetchError) {
  const { descriptor } = parse(await readFile(new URL('../components/Forms/LinkForm.vue', import.meta.url), 'utf8'));
  const rows = [], events = [];
  const context = createContext({ URL, console,
    reactive: value => value, ref: value => ({ value }),
    defineEmits: () => (...args) => events.push(args), onMounted: () => {},
    $fetch: async (url, options) => {
      assert.equal(url, '/api/links');
      assert.equal(options.method, 'POST');
      if (fetchError) throw fetchError;
      rows.push(options.body);
      return { key: options.body.shortKey };
    },
  });
  const module = new SourceTextModule(stripTypeScriptTypes(descriptor.scriptSetup.content) + '\nexport { form, formError, isLoading, handleLinkForm };', { context });
  await module.link(specifier => {
    const values = specifier === 'nanoid' ? { nanoid: () => 'New_key-1' } : { default: {} };
    return new SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return { ...module.namespace, rows, events };
}

test('reserved page names are rejected before writing, including mixed case', async () => {
  const h = await formHarness();
  h.form.longUrl = 'https://example.com';
  for (const key of ['try', 'dashboard', 'auth', 'api', 'login', 'register', '_nuxt', 'TRY', 'Dashboard']) {
    h.form.shortKey = key;
    await h.handleLinkForm();
    assert.match(h.formError.value, /reserved/);
  }
  assert.equal(h.rows.length, 0);
  assert.equal(h.events.length, 0);
});

test('keys containing URL delimiters, encoding or whitespace are rejected', async () => {
  const h = await formHarness();
  h.form.longUrl = 'https://example.com';
  for (const key of ['a/b', 'a?b', 'a#b', 'a.b', 'a%2Fb', 'a b', 'a\\b', 'żółć', '.', '..']) {
    h.form.shortKey = key;
    await h.handleLinkForm();
    assert.match(h.formError.value, /only letters/);
  }
  assert.equal(h.rows.length, 0);
});

test('safe keys are sent trimmed to the API without a client-supplied owner', async () => {
  const h = await formHarness();
  h.form.longUrl = ' https://example.com/path ';
  h.form.shortKey = ' My_link-123 ';
  await h.handleLinkForm();
  assert.equal(h.formError.value, '');
  assert.equal(h.rows.length, 1);
  assert.equal(h.rows[0].shortKey, 'My_link-123');
  assert.equal(h.rows[0].longUrl, 'https://example.com/path');
  assert.equal(h.rows[0].user_id, undefined);
  assert.equal(h.events[0][0], 'createdShortLink');
  assert.equal(h.form.shortKey, 'New_key-1');
  assert.equal(h.isLoading.value, false);
});

test('API errors keep the entered values and display the server message', async () => {
  const h = await formHarness({ data: { statusMessage: 'This short key is already taken. Choose another one.' } });
  h.form.longUrl = 'https://example.com';
  h.form.shortKey = 'taken';
  await h.handleLinkForm();
  assert.match(h.formError.value, /already taken/);
  assert.equal(h.form.shortKey, 'taken');
  assert.equal(h.form.longUrl, 'https://example.com');
  assert.equal(h.events.length, 0);
  assert.equal(h.isLoading.value, false);
});
