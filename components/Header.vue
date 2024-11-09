<template>
  <header
    class="fixed top-0 left-0 right-0 border-b border-white/20 backdrop-blur bg-black/10"
  >
    <nav
      class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between gap-3 h-16"
    >
      <NuxtLink :to="{ name: 'index' }" class="text-2xl font-bold text-white">
        Shorten<span class="text-indigo-600">It</span>
      </NuxtLink>

      <ul class="flex gap-4 items-center">
        <li><NuxtLink>Price</NuxtLink></li>
        <li><NuxtLink>Price</NuxtLink></li>
        <li>
          <NuxtLink to="/auth">
            <CustomButton variant="primary" type="button">SignIn</CustomButton>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import CustomButton from "./CustomButton.vue";
</script>

<style></style>
