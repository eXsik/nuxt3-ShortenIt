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
            class="border-b-2 border-transparent pb-2 [@media(hover:hover)]:hover:border-b-indigo-600 touch-manipulation transition-colors"
            :class="{ 'border-b-indigo-500': isActive('/') }"
          >
            Home
          </NuxtLink>
        </li>
        <li v-if="user" class="font-medium text-xs sm:text-sm">
          <NuxtLink
            :to="{ name: 'dashboard' }"
            class="border-b-2 border-transparent pb-2 [@media(hover:hover)]:hover:border-b-indigo-600 touch-manipulation transition-colors"
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
          <CustomButton
            variant="primary"
            type="button"
            class="!px-1.5 text-xs md:text-sm md:px-5 touch-manipulation"
            @click="handleLogout"
            :is-loading="isLoggingOut"
          >
            Log out
          </CustomButton>
        </li>
      </ul>
    </nav>
    <p v-if="logoutError" role="alert" class="mx-auto max-w-7xl px-4 pb-3 text-sm text-rose-300">{{ logoutError }}</p>
  </header>
</template>

<script setup lang="ts">
import CustomButton from "./CustomButton.vue";

const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();
const isLoggingOut = ref(false);
const logoutError = ref('');

const { isActive } = useActiveLink();

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;
  logoutError.value = '';
  try {
    const { error } = await client.auth.signOut();
    if (error) {
      logoutError.value = 'Could not sign out. Try again.';
      return;
    }
    await router.push({ name: 'index' });
  } catch {
    logoutError.value = 'Could not sign out. Try again.';
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<style></style>
