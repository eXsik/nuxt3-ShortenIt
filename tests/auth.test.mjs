import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';
import { parse } from '@vue/compiler-sfc';

async function authForm(kind, response = { data: { session: { user: { id: 'owner' } } }, error: null }) {
  const filename = `../components/Forms/${kind}Form.vue`;
  const { descriptor } = parse(await readFile(new URL(filename, import.meta.url), 'utf8'));
  const requests = [], routes = [];
  const call = async body => {
    requests.push(body);
    if (response instanceof Error) throw response;
    return typeof response === 'function' ? response() : response;
  };
  const context = createContext({
    ref: value => ({ value }),
    useRouter: () => ({ push: async route => routes.push(route.name) }),
    useSupabaseClient: () => ({ auth: { signInWithPassword: call, signUp: call } }),
  });
  const handlerName = `handleForm${kind}`;
  const exports = `form, errors, isLoading, ${handlerName}${kind === 'Register' ? ', successMessage' : ''}`;
  const module = new SourceTextModule(stripTypeScriptTypes(descriptor.scriptSetup.content) + `\nexport { ${exports} };`, { context });
  await module.link(specifier => {
    assert.equal(specifier, '~/components/CustomButton.vue');
    return new SyntheticModule(['default'], function () { this.setExport('default', {}); }, { context });
  });
  await module.evaluate();
  return { ...module.namespace, submit: module.namespace[handlerName], requests, routes };
}

function fill(h) {
  h.form.value.email = ' person@example.com ';
  h.form.value.password = 'test-password';
  h.form.value.password_confirmation = 'test-password';
}

test('empty login and registration forms do not contact auth', async () => {
  for (const kind of ['Login', 'Register']) {
    const h = await authForm(kind);
    await h.submit();
    assert.equal(h.requests.length, 0);
    assert.match(h.errors.value, /fill all/);
  }
});

test('registration rejects mismatched passwords', async () => {
  const h = await authForm('Register');
  fill(h); h.form.value.password_confirmation = 'different';
  await h.submit();
  assert.equal(h.requests.length, 0);
  assert.match(h.errors.value, /passwords match/);
});

test('successful auth trims email and navigates to dashboard with a session', async () => {
  for (const kind of ['Login', 'Register']) {
    const h = await authForm(kind);
    fill(h); await h.submit();
    assert.equal(h.requests[0].email, 'person@example.com');
    assert.equal(h.routes[0], 'dashboard');
    assert.equal(h.errors.value, '');
    assert.equal(h.isLoading.value, false);
  }
});

test('registration without a session prompts email confirmation', async () => {
  const h = await authForm('Register', { data: { session: null }, error: null });
  fill(h); await h.submit();
  assert.equal(h.routes.length, 0);
  assert.match(h.successMessage.value, /Check your email/);
  assert.equal(h.isLoading.value, false);
});

test('auth errors stay on the form and release the loading state', async () => {
  for (const kind of ['Login', 'Register']) {
    const h = await authForm(kind, { data: {}, error: { message: 'Invalid credentials' } });
    fill(h); await h.submit();
    assert.equal(h.errors.value, 'Invalid credentials');
    assert.equal(h.routes.length, 0);
    assert.equal(h.isLoading.value, false);
  }
});

test('network failures display a recoverable auth error', async () => {
  for (const kind of ['Login', 'Register']) {
    const h = await authForm(kind, new Error('Network unavailable'));
    fill(h); await h.submit();
    assert.match(h.errors.value, /Try again/);
    assert.equal(h.routes.length, 0);
    assert.equal(h.isLoading.value, false);
  }
});

test('auth forms prevent duplicate requests while a submission is pending', async () => {
  for (const kind of ['Login', 'Register']) {
    let resolve;
    const pending = new Promise(done => { resolve = done; });
    const h = await authForm(kind, () => pending);
    fill(h);
    const first = h.submit();
    await h.submit();
    assert.equal(h.requests.length, 1);
    resolve({ data: { session: {} }, error: null });
    await first;
    assert.equal(h.isLoading.value, false);
  }
});

async function guard(kind, user) {
  const context = createContext({
    defineNuxtRouteMiddleware: fn => fn,
    useSupabaseClient: () => ({ auth: { getUser: async () => ({ data: { user } }) } }),
    navigateTo: path => path,
  });
  const source = stripTypeScriptTypes(await readFile(new URL(`../middleware/${kind}.ts`, import.meta.url), 'utf8'));
  const module = new SourceTextModule(source, { context });
  await module.link(() => { throw new Error('Unexpected guard import'); });
  await module.evaluate();
  return module.namespace.default();
}

test('route guards redirect guests away from dashboard and signed-in users away from auth', async () => {
  assert.equal(await guard('auth', null), '/auth/login');
  assert.equal(await guard('auth', { id: 'owner' }), undefined);
  assert.equal(await guard('guest', { id: 'owner' }), '/dashboard');
  assert.equal(await guard('guest', null), undefined);
});

async function logoutHarness(response) {
  const { descriptor } = parse(await readFile(new URL('../components/Header.vue', import.meta.url), 'utf8'));
  const routes = [];
  const context = createContext({
    ref: value => ({ value }), useSupabaseUser: () => ({ value: { id: 'owner' } }),
    useSupabaseClient: () => ({ auth: { signOut: async () => {
      if (response instanceof Error) throw response;
      return response;
    } } }),
    useActiveLink: () => ({ isActive: () => false }),
    useRouter: () => ({ push: async route => routes.push(route.name) }),
  });
  const module = new SourceTextModule(stripTypeScriptTypes(descriptor.scriptSetup.content) + '\nexport { handleLogout, logoutError, isLoggingOut };', { context });
  await module.link(() => new SyntheticModule(['default'], function () { this.setExport('default', {}); }, { context }));
  await module.evaluate();
  return { ...module.namespace, routes };
}

test('logout navigates home only after successful sign-out', async () => {
  const h = await logoutHarness({ error: null });
  await h.handleLogout();
  assert.deepEqual(h.routes, ['index']);
  assert.equal(h.logoutError.value, '');
  assert.equal(h.isLoggingOut.value, false);
});

test('failed logout stays on the page with a recoverable error', async () => {
  for (const response of [{ error: { message: 'Failed' } }, new Error('Offline')]) {
    const h = await logoutHarness(response);
    await h.handleLogout();
    assert.equal(h.routes.length, 0);
    assert.match(h.logoutError.value, /Could not sign out/);
    assert.equal(h.isLoggingOut.value, false);
  }
});
