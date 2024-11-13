<template>
  <main class="h-[calc(100vh-65px)] pb-20 pt-10 md:pt-10 mb-20">
    <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-bold text-white">Dashboard</h2>
    </section>
    <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      <Card>
        <LinkForm @created-short-link="refreshLinks" />
      </Card>
    </section>
    <section
      class="container mx-auto max-w-7xl pb-12 md:pb-10 px-4 sm:px-6 lg:px-8 mt-10 flex flex-col gap-4"
    >
      <Card class="flex justify-between" v-for="link in links" :key="link.id">
        <LinkItem
          :link="{
            shortKey: link.key,
            longUrl: link?.long_url || '',
            id: link.id,
            totalClicks: link.total_clicks || 0,
          }"
        />
      </Card>
    </section>
  </main>
</template>

<script setup lang="ts">
import LinkForm from "~/components/forms/LinkForm.vue";

definePageMeta({
  middleware: "auth",
  title: "Dashboard - ShortenIt | Manage Your Shortened Links and Track Stats",
  meta: [
    {
      name: "description",
      content:
        "Access your ShortenIt dashboard to manage your shortened links, track clicks, view statistics, and optimize your URL shortening experience.",
    },
  ],
});

const { links, linksError, refreshLinks } = useLinks();
</script>
