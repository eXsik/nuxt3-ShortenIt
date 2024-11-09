<template>
  <div>
    <Header />
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style>
body {
  @apply bg-black text-white/70 relative;
}

body::before {
  width: 100%;
  height: 100%;
  content: "";
  position: fixed;
  z-index: -1;
  background: radial-gradient(
    75.61% 75.61% at 50% 24.39%,
    rgba(43, 5, 131, 0.35) 0%,
    rgba(60, 9, 180, 0) 100%
  );
}
</style>
