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
          <NuxtLink
            :to="{ name: 'index' }"
            class="border-b-2 border-transparent pb-2 hover:border-b-indigo-600 transition-colors"
            :class="{ 'border-b-indigo-500': isActive('/') }"
          >
            Home
          </NuxtLink>
        </li>
        <li v-if="user" class="font-medium text-xs sm:text-sm">
          <NuxtLink
            :to="{ name: 'dashboard' }"
            class="border-b-2 border-transparent pb-2 hover:border-b-indigo-600 transition-colors"
            :class="{ 'border-b-indigo-500': isActive('/dashboard') }"
          >
            Dashboard
          </NuxtLink>
        </li>
        <li v-if="!user">
          <NuxtLink :to="{ name: 'auth-login' }">
            <CustomButton variant="primary" type="button">Sign In</CustomButton>
          </NuxtLink>
        </li>

        <li v-else>
          <NuxtLink :to="{ name: 'index' }">
            <CustomButton
              variant="primary"
              type="button"
              class="!px-1.5 text-xs md:text-sm md:px-5"
              @click="handleLogout"
              >Log out</CustomButton
            >
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import CustomButton from "./CustomButton.vue";

const user = useSupabaseUser();
const client = useSupabaseClient();

const { isActive, isActiveOrParent } = useActiveLink();

const handleLogout = async () => {
  await client.auth.signOut();

  useRouter().push({
    name: "index",
  });
};
</script>

<style></style>
