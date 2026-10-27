<template>
  <p
    v-if="errors"
    role="alert"
    class="text-red-500 mb-4 px-4 py-2.5 border-red-500 border rounded-md w-full text-sm font-semibold"
  >
    {{ errors }}
  </p>
  <form @submit.prevent="handleFormLogin" class="flex flex-col gap-2 w-full">
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
    <CustomButton type="submit" :is-loading="isLoading" class="w-full mt-4">Login</CustomButton>
    <NuxtLink :to="{ name: 'auth-register' }" class="text-right text-xs">
      Don't have an account? <span class="text-indigo-500">Register.</span>
    </NuxtLink>

  </form>
</template>

<script setup lang="ts">
import CustomButton from "~/components/CustomButton.vue";

const form = ref({
  email: "",
  password: "",
});

const errors = ref<string>("");
const isLoading = ref(false);
const router = useRouter();

const supabaseAuth = useSupabaseClient();

const handleFormLogin = async () => {
  if (isLoading.value) return;
  errors.value = "";
  if (!form.value.email || !form.value.password) {
    errors.value = "Please fill all the fields.";
    return;
  }

  isLoading.value = true;
  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
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
    }
  } catch (error) {
    errors.value = "Could not sign in. Try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>
