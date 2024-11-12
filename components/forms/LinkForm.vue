<template>
  <form @submit.prevent="handleLinkForm">
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
import type { Database } from "~/types/supabase";

const form = reactive({
  longUrl: "",
  shortKey: "",
});

const client = useSupabaseClient<Database>();

const emit = defineEmits(["createdShortLink"]);

const handleLinkForm = async () => {
  const user = useSupabaseUser();

  try {
    const { data, error } = await client.from("links").insert({
      long_url: form.longUrl,
      key: form.shortKey,
      user_id: user.value?.id,
    });

    if (error) {
      console.error("error", error);
      // errors.value = error.message;

      return;
    }

    createShortKey();
    form.longUrl = "";
    console.log("success link created");
    emit("createdShortLink", 1);
  } catch (error) {
    console.error(error);
    return;
  }
};

const createShortKey = (len: number = 6): void => {
  form.shortKey = nanoid(len);
};

onMounted(() => createShortKey());
</script>

<style></style>
