<template>
  <form @submit.prevent="handleLinkForm">
    <p
        v-if="formError"
        class="text-red-500 mb-4 px-4 py-2.5 border border-red-500 rounded-md w-full text-sm font-semibold"
      >
        {{ formError }}
    </p>

    <div class="flex md:flex-row flex-col justify-between gap-4 items-center">
      <InputField
        id="url"
        label="Long URL"
        type="text"
        class="w-full md:w-6/12 lg:w-7/12"
        v-model="form.longUrl"
        placeholder="https://yourverylonglink.com/..."
      />
      <InputField
        id="shortKey"
        label="Short Key"
        type="text"
        class="w-full md:w-3/12 lg:w-3/12 xl:w-4/12"
        v-model="form.shortKey"
        placeholder="ABC..."
      />
      <CustomButton
        type="submit"
        :is-loading="isLoading"
        class="rounded-full w-full md:w-3/12 lg:w-2/12 xl:w-1/12 md:self-end"
      >
        Short It
      </CustomButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import CustomButton from "~/components/CustomButton.vue";
import { nanoid } from "nanoid";

const form = reactive({
  longUrl: "",
  shortKey: "",
});

const emit = defineEmits(["createdShortLink"]);
const formError = ref("");
const isLoading = ref(false);

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const handleLinkForm = async () => {
  if (isLoading.value) return;
  formError.value = "";
  const longUrl = form.longUrl.trim();
  const shortKey = form.shortKey.trim();

  if (!longUrl || !shortKey) {
    formError.value = "Please fill in both fields.";
    return;
  }

  if (!isValidHttpUrl(longUrl)) {
    formError.value = "Enter a valid URL starting with http:// or https://";
    return;
  }

  if (!/^[A-Za-z0-9_-]+$/.test(shortKey)) {
    formError.value = "Use only letters, numbers, hyphens and underscores in the short key.";
    return;
  }

  // Keep these names aligned with RESERVED in server/middleware/short-link.ts.
  if (["try", "dashboard", "auth", "api", "login", "register", "_nuxt", "favicon.ico"].includes(shortKey.toLowerCase())) {
    formError.value = "This short key is reserved. Choose another one.";
    return;
  }

  isLoading.value = true;
  try {
    await $fetch('/api/links', {
      method: 'POST',
      body: { longUrl, shortKey },
    });

    createShortKey();
    form.longUrl = "";

    emit("createdShortLink", 1);
  } catch (error: unknown) {
    const fetchError = error as { data?: { statusMessage?: string } };
    formError.value = fetchError.data?.statusMessage ?? 'Could not shorten link. Try again.';
  } finally {
    isLoading.value = false;
  }
};

const createShortKey = (len: number = 6): void => {
  form.shortKey = nanoid(len);
};

onMounted(() => createShortKey());
</script>

<style></style>
