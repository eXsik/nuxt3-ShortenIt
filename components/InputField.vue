<template>
  <div class="flex flex-col mb-0">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-gray-400 mb-2"
      >{{ label }}</label
    >
    <input
      :type="type"
      :id="id"
      :value="modelValue"
      class="px-4 py-2 border border-white/20 rounded-md shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
interface InputProps {
  modelValue: string | number;
  label?: string;
  id: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
}

defineProps<InputProps>();
defineModel("modelValue");
</script>
