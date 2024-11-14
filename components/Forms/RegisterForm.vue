<template>
  <p
    v-if="errors"
    class="text-red-500 mb-4 px-4 py-2.5 border-red-500 border rounded-md w-full text-sm font-semibold"
  >
    {{ errors }}
  </p>
  <form @submit.prevent="handleFormRegister" class="flex flex-col gap-2 w-full">
    <InputField
      type="email"
      label="Email"
      placeholder="john.doe@example.com"
      id="email"
      v-model="form.email"
    />
    <InputField
      type="password"
      label="Password"
      placeholder="Enter password"
      id="password"
      v-model="form.password"
    />
    <InputField
      type="password"
      label="Confirm Password"
      placeholder="Confirm password"
      id="password_confirmation"
      v-model="form.password_confirmation"
    />
    <CustomButton type="submit" class="w-full mt-4"> Register </CustomButton>
    <NuxtLink :to="{ name: 'auth-login' }" class="text-right text-xs">
      You have an account? <span class="text-indigo-500">Login.</span>
    </NuxtLink>
  </form>
</template>

<script setup lang="ts">
import CustomButton from "~/components/CustomButton.vue";

const form = ref({
  email: "",
  password: "",
  password_confirmation: "",
});

const errors = ref<string>("");

const supabaseAuth = useSupabaseClient();

const handleFormRegister = async () => {
  if (
    !form.value.email ||
    !form.value.password ||
    !form.value.password_confirmation
  ) {
    errors.value = "Please fill all the fields.";
    return;
  }

  if (form.value.password !== form.value.password_confirmation) {
    errors.value = "Please make sure your passwords match.";
    return;
  }

  try {
    const { data, error } = await supabaseAuth.auth.signUp({
      email: form.value.email,
      password: form.value.password,
    });

    if (error) {
      errors.value = error.message;
      return;
    }
    if (data) {
      errors.value = "";
      useRouter().push({
        name: "dashboard",
      });
    }
  } catch (error) {
    errors.value = "Something went wrong";
  }
};
</script>
