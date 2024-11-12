<template>
  <p
    v-if="errors"
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
    <CustomButton type="submit" class="w-full mt-4"> Login </CustomButton>
    <NuxtLink :to="{ name: 'auth-register' }" class="text-right text-xs">
      Don't have an account? <span class="text-indigo-500">Register.</span>
    </NuxtLink>

    <hr class="border border-white/10 my-6" />

    <CustomButton
      type="button"
      class="w-full border-white flex"
      variant="secondary"
      @click="handleGithubLogin"
    >
      <p class="flex items-center justify-center w-full gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-white size-5"
        >
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
        Continue with Github
      </p>
    </CustomButton>
  </form>
</template>

<script setup lang="ts">
import CustomButton from "~/components/CustomButton.vue";

const form = ref({
  email: "",
  password: "",
});

const errors = ref<string>("");

const supabaseAuth = useSupabaseClient();

const handleGithubLogin = () => {
  supabaseAuth.auth.signInWithOAuth({
    provider: "github",
  });
};

const handleFormLogin = async () => {
  if (!form.value.email || !form.value.password) {
    errors.value = "Please fill all the fields.";
    return;
  }

  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
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
