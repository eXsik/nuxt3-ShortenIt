import geoip from 'geoip-lite';
import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';

const RESERVED = new Set([
  "try",
  "dashboard",
  "auth",
  "api",
  "login",
  "register",
  "_nuxt",
  "favicon.ico",
]);

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length !== 1) return;

  const key = segments[0];
  if (RESERVED.has(key) || key.includes('.')) return;

  const client = await serverSupabaseClient<Database>(event);

  const { data: link, error} = await client
    .from('links')
    .select('id, long_url')
    .eq('key', key)
    .single();

  if (error || !link?.long_url) {
    throw createError({ statusCode: 404, statusMessage: "Link not found" });
  }

  const forwarded = getHeader(event, "x-forwarded-for");
  const ip =
    (typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : undefined) ||
    getRequestIP(event, { xForwardedFor: true }) ||
    undefined;
  const userAgent = getHeader(event, "user-agent") || "";

  if (ip) {
    const geo = geoip.lookup(ip);

    try {
      const { error: clickError } = await client.from("clicks").insert({
        link_id: link.id,
        ip,
        country: geo?.country ?? null,
        city: geo?.city ?? null,
        user_agent: userAgent,
      });
      if (clickError) {
        console.error("Failed to record click:", clickError.message);
      }
    } catch {
      console.error("Failed to record click");
    }
  }

  return sendRedirect(event, link.long_url, 302);
});
