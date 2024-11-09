<template>
  <main class="md:pt-28">
    <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-bold text-white">Dashboard</h2>
    </section>
    <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      <Card>
        <LinkForm />
      </Card>
    </section>
    <section class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      <Card class="flex justify-between">
        <LinkItem />
      </Card>
    </section>
  </main>
</template>

<script setup lang="ts">
import CustomButton from "~/components/CustomButton.vue";
import LinkForm from "~/components/forms/LinkForm.vue";
</script>
