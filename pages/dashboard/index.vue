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
      <Card class="flex justify-between" v-for="i in 10" :key="i">
        <LinkItem
          :link="{
            shortKey: 'test123',
            longUrl: 'https://google.com',
            id: '1',
          }"
        />
      </Card>
    </section>
  </main>
</template>

<script setup lang="ts">
import LinkForm from "~/components/forms/LinkForm.vue";
</script>
