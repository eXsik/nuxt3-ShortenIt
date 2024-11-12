<template>
  <main class="h-[calc(100vh-65px)] md:pt-20">
    <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-bold text-white">Dashboard</h2>
    </section>
    <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      <Card>
        <LinkForm />
      </Card>
    </section>
    <section
      class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 flex flex-col gap-4"
    >
      <Card class="flex justify-between" v-for="link in data" :key="link.id">
        <LinkItem
          :link="{
            shortKey: link.key,
            longUrl: link?.long_url || '',
            id: link.id,
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
});

const { data, error } = useLinks();

console.log("data", { data });
</script>
