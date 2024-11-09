<template>
  <form>
    <div class="flex md:flex-row flex-col justify-between gap-4 items-center">
      <InputField
        id="url"
        label="Long URL"
        type="text"
        class="w-full md:w-6/12 lg:w-7/12"
        v-model="longUrl"
        placeholder="https://yourverylonglink.com/..."
      />
      <InputField
        id="shortKey"
        label="Short Key"
        type="text"
        class="w-full md:w-3/12 lg:w-3/12 xl:w-4/12"
        v-model="shortKey"
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

const longUrl = ref("");
const shortKey = ref("");
</script>

<style></style>
