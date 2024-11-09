<template>
  <button
    :class="[
      'custom-button',
      variantClass,
      sizeClass,
      { 'opacity-50 cursor-not-allowed': isLoading || disabled },
      customClass,
    ]"
    :disabled="isLoading || disabled"
    @click="handleClick"
    :type="type"
  >
    <span v-if="!isLoading"><slot /></span>
    <span v-else>Loading...</span>
  </button>
</template>

<script setup lang="ts">
interface CustomButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  customClass?: string;
  onClick?: (event: MouseEvent) => void;
}

const props = defineProps<CustomButtonProps>();
const emit = defineEmits<{ (e: "click", event: MouseEvent): void }>();

const variantClass = computed(() => {
  switch (props.variant) {
    case "secondary":
      return "bg-transparent hover:bg-indigo-900/10 border border-indigo-600 hover:border-indigo-700";
    case "danger":
      return "bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600";
    default:
      return "bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700";
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case "small":
      return "px-4 py-1.5 text-xs";
    case "large":
      return "px-8 py-2.5 text-base";
    case "medium":
    default:
      return "px-5 py-2 text-sm";
  }
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.isLoading) {
    emit("click", event);
  }
};
</script>

<style scoped>
.custom-button {
  @apply font-semibold rounded-md border-2 focus:outline-none ring-0 focus:ring-0 outline-none transition-all duration-300;
}
</style>
