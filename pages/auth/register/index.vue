<template>
  <section class="h-[calc(100vh-65px)] grid place-content-center">
    <div class="container">
      <Card class="flex flex-col items-center">
        <div
          class="flex justify-center size-20 items-center rounded-full border shadow-xl border-white/20 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-8 text-white/50"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>
        <FormsRegisterForm />
      </Card>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({
  title: "Sign Up - ShortenIt | Create an Account for URL Shortening",
  meta: [
    {
      name: "description",
      content:
        "Sign up for ShortenIt and start shortening URLs with ease. Create an account to manage your links, track clicks, and enjoy additional features.",
    },
  ],
});
</script>
