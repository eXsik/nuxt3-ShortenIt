import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

const RESERVED = new Set([
  'try', 'dashboard', 'auth', 'api', 'login', 'register', '_nuxt', 'favicon.ico',
]);

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const { data: { user }, error: authError } = await client.auth.getUser();

  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to shorten links.' });
  }

  const body = await readBody<{ longUrl?: unknown; shortKey?: unknown }>(event);
  const longUrl = typeof body?.longUrl === 'string' ? body.longUrl.trim() : '';
  const shortKey = typeof body?.shortKey === 'string' ? body.shortKey.trim() : '';

  if (!longUrl || !shortKey) {
    throw createError({ statusCode: 400, statusMessage: 'Please fill in both fields.' });
  }

  let url: URL;
  try {
    url = new URL(longUrl);
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid URL starting with http:// or https://' });
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid URL starting with http:// or https://' });
  }

  if (!/^[A-Za-z0-9_-]+$/.test(shortKey)) {
    throw createError({ statusCode: 400, statusMessage: 'Use only letters, numbers, hyphens and underscores in the short key.' });
  }
  if (RESERVED.has(shortKey.toLowerCase())) {
    throw createError({ statusCode: 400, statusMessage: 'This short key is reserved. Choose another one.' });
  }

  // Ownership comes from the verified session, never the request body.
  const { error } = await client.from('links').insert({
    long_url: longUrl,
    key: shortKey,
    user_id: user.id,
  });

  if (error?.code === '23505') {
    throw createError({ statusCode: 409, statusMessage: 'This short key is already taken. Choose another one.' });
  }
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Could not shorten link. Try again.' });
  }

  return { key: shortKey };
});
