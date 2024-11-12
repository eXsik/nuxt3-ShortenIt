<template>
  {{ params }}
</template>

<script setup lang="ts">
const params = useRoute().params;
const { fetchLinkByKey } = useLinks();

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
  useExternalRedirect(data.value.long_url);
} else {
  throw createError({
    statusCode: 404,
    message: "Long URL not found",
  });
}
</script>
