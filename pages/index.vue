<template>
  <section class="h-[calc(100vh-65px)] grid place-content-center">
    <div class="max-w-3xl mx-auto text-center px-4">
      <h1 class="text-4xl md:text-5xl font-bold leading-normal">
        Make your links tiny and easy to
        <span class="text-indigo-600">share with ShortenIt</span>
      </h1>
      <p class="my-5 text-lg">
        Transform your long, hard to read URLs into short and shareable links
        with our app.
      </p>

      <NuxtLink :to="{ name: 'dashboard' }">
        <CustomButton type="button" class="mt-10">
          Shorten your Link
        </CustomButton>
      </NuxtLink>
      <div class="mt-5">
      <NuxtLink
        to="/try"
        class="inline-flex min-h-11 items-center rounded-md px-3
              text-base text-indigo-200 underline underline-offset-4
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
      >
        Try without an account
      </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({
  title: "ShortenIt - URL Shortener for Clean and Easy Links",
  meta: [
    {
      name: "description",
      content:
        "ShortenIt is a fast and easy URL shortener that helps you create clean, short, and shareable links. Perfect for social media, emails, and more.",
    },
  ],
});
</script>
