import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default defineEventHandler(async (event) => {
  // limit 1 demo per browser
  const demoUsed = getCookie(event, 'demo_used');

  if (demoUsed) {
    throw createError({
      statusCode: 403,
      statusMessage: "Demo limit reached. Create an account to shorten more links.",
    });
  }

  const body = await readBody<{ longUrl?: unknown }>(event);
  const longUrl = typeof body?.longUrl === 'string' ? body.longUrl.trim() : '';

  if (!longUrl || !isValidHttpUrl(longUrl)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter a valid URL starting with http:// or https://',
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server misconfigured' });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const key = nanoid(6);
  const { error } = await admin.from('links').insert({
    long_url: longUrl,
    key,
    user_id: null,
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Could not shorten link' });
  }

  const config = useRuntimeConfig();
  const appUrl = String(config.public.appUrl || '').replace(/\/$/, '');

  setCookie(event, 'demo_used', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return { key, shortUrl: `${appUrl}/${key}` };
});
