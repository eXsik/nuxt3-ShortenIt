<template>
  <div class="flex flex-col gap-3">
    <NuxtLink
      :to="`/dashboard/${link.shortKey}`"
      class="text-indigo-500 font-bold text-2xl hover:text-indigo-600 transition-colors"
      >/{{ link.shortKey }}</NuxtLink
    >
    <div class="text-sm text-white/45">
      <p class="overflow-wrap-anywhere inline-block">
        {{ isShortLink ? link.longUrl?.slice(0, 50) + "..." : link.longUrl }}
      </p>
      <button
        type="button"
        class="border-none bg-none text-indigo-500 sm:ml-2 mt-2 md:mt-0"
        @click="isShortLink = !isShortLink"
      >
        View more
      </button>
    </div>
  </div>
  <div class="flex items-center gap-5">
    <div class="text-xl flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
        />
      </svg>

      {{ link.totalClicks }}
    </div>

    <CustomButton
      type="button"
      class="size-10 md:size-12 grid place-content-center"
      @click="handleCopyLink"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="size-5 md:size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
        />
      </svg>
    </CustomButton>
  </div>
</template>

<script setup lang="ts">
interface LinkItemProps {
  link: {
    shortKey: string;
    longUrl: string;
    id: number;
    totalClicks: number;
  };
}

const props = defineProps<LinkItemProps>();

const config = useRuntimeConfig();
const isShortLink = ref<boolean>(true);

const handleCopyLink = () => {
  console.log("config", config.public.appUrl);
  navigator.clipboard.writeText(
    `${config.public.appUrl}/${props.link.shortKey}`
  );

  alert("Copied to clipboard");
};
</script>

<style scoped>
.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>
