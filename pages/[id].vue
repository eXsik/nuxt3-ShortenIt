<template>
  {{ params }}
</template>

<script setup lang="ts">
import geoip from "geoip-lite";
import type { Database } from "~/types/supabase";

const params = useRoute().params;
const { fetchLinkByKey } = useLinks();
const client = useSupabaseClient<Database>();

if (!params.id) {
  throw createError({
    statusCode: 404,
    message: "Not found",
  });
}

const { data } = await useAsyncData("link", async () => {
  const response = await fetchLinkByKey(params.id as string);
  return response;
});

if (data.value?.long_url) {
  const userAgent = useUserAgent();

  if (userAgent && userAgent.ip) {
    const geoLocation = geoip.lookup(userAgent.ip);

    await client.from("clicks").insert({
      link_id: data.value.id,
      ip: userAgent.ip,
      country: geoLocation?.country,
      city: geoLocation?.city,
      user_agent: userAgent.userAgent,
    });
  }

  useExternalRedirect(data.value.long_url);
} else {
  throw createError({
    statusCode: 404,
    message: "Long URL not found",
  });
}
</script>
