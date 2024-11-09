<template>
  <header
    class="sticky top-0 left-0 right-0 border-b border-white/20 backdrop-blur bg-black/10 z-50"
  >
    <nav
      class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between gap-3 h-16"
    >
      <NuxtLink :to="{ name: 'index' }" class="text-2xl font-bold text-white">
        Shorten<span class="text-indigo-600">It</span>
      </NuxtLink>

      <ul class="flex md:gap-8 gap-2 items-center">
        <li class="font-medium text-sm">
          <NuxtLink to="/"> Home </NuxtLink>
        </li>
        <li class="font-medium text-sm">
          <NuxtLink :to="{ name: 'dashboard' }"> Dashboard </NuxtLink>
        </li>
        <li>
          <NuxtLink :to="{ name: 'auth' }">
            <CustomButton variant="primary" type="button">Sign In</CustomButton>
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
