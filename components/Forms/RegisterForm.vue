<template>
  <p
    v-if="errors"
    role="alert"
    class="text-red-500 mb-4 px-4 py-2.5 border-red-500 border rounded-md w-full text-sm font-semibold"
  >
    {{ errors }}
  </p>
  <p v-if="successMessage" role="status" class="mb-4 text-sm text-indigo-200">{{ successMessage }}</p>
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
    <CustomButton type="submit" :is-loading="isLoading" class="w-full mt-4">Register</CustomButton>
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
const successMessage = ref("");
const isLoading = ref(false);
const router = useRouter();

const supabaseAuth = useSupabaseClient();

const handleFormRegister = async () => {
  if (isLoading.value) return;
  errors.value = "";
  successMessage.value = "";
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

  isLoading.value = true;
  try {
    const { data, error } = await supabaseAuth.auth.signUp({
      email: form.value.email.trim(),
      password: form.value.password,
    });

    if (error) {
      errors.value = error.message;
      return;
    }
    if (data.session) {
      errors.value = "";
      await router.push({
        name: "dashboard",
      });
    } else {
      successMessage.value = "Check your email to confirm your account, then sign in.";
    }
  } catch (error) {
    errors.value = "Could not create an account. Try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>
