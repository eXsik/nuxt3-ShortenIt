<template>
  <form action="" class="flex flex-col gap-2">
    <InputField
      type="email"
      label="Email"
      placeholder="john.doe@example.com"
      id="email"
      v-model="email"
    />
    <InputField
      type="password"
      label="Password"
      placeholder="Enter password"
      id="password"
      v-model="password"
    />
    <CustomButton type="submit" class="w-full mt-4"> Login </CustomButton>
    <hr class="border border-white/10 my-6" />

    <CustomButton type="button" class="w-full" variant="secondary">
      Continue with Github
    </CustomButton>
  </form>
</template>

<script setup lang="ts">
import CustomButton from "~/components/CustomButton.vue";

const email = ref<string>("");
const password = ref<string>("");
</script>
