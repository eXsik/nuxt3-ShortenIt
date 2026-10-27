<template>
  <p>Link not found</p>
</template>

<script setup lang="ts">
// Fallback
throw createError({
  statusCode: 404,
  statusMessage: "Link not found",
});
</script>