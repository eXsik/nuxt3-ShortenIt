<template>
  <main class="demo-page">
    <section class="demo-content" aria-labelledby="demo-title">
      <header class="demo-heading">
        <h1 id="demo-title">Good links.<br />Less clutter.</h1>
        <p>Turn a long URL into a link that’s ready to share.<br class="desktop-break" /> Try it once, without creating an account.</p>
      </header>

      <div class="demo-panel">
        <form @submit.prevent="shortenLink" :aria-busy="isLoading">
          <label for="demo-url">Paste your long link</label>
          <div class="demo-controls">
            <input
              id="demo-url"
              v-model="longUrl"
              type="url"
              inputmode="url"
              autocomplete="url"
              placeholder="https://example.com/your-long-link"
              required
              :disabled="isLoading"
              aria-describedby="demo-hint"
            />
            <button type="submit" :disabled="isLoading">
              {{ isLoading ? 'Shortening…' : 'Shorten link' }}
            </button>
          </div>
          <p id="demo-hint" class="demo-hint">One free link. No sign-up needed.</p>
        </form>

        <p v-if="errorMessage" class="demo-error" role="alert">
          {{ errorMessage }}
        </p>

        <div class="demo-result" aria-live="polite" aria-atomic="true">
          <template v-if="shortUrl">
            <p>Your link is ready to share</p>
            <a :href="shortUrl">{{ shortUrl }}</a>
          </template>
        </div>
      </div>

      <p class="demo-signup">
        Have more to share?
        <NuxtLink to="/auth/register">Create a free account</NuxtLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
  const longUrl = ref("");
  const shortUrl = ref("");
  const errorMessage = ref("");
  const isLoading = ref(false);

  async function shortenLink() {
    errorMessage.value = '';
    shortUrl.value = '';
    isLoading.value = true;

    try {
      const result = await $fetch<{ key: string; shortUrl: string}>(
        '/api/demo/shorten',
        {
          method: 'POST',
          body: { longUrl: longUrl.value } 
        },
      );

      shortUrl.value = result.shortUrl;
    } catch (error: unknown) {
      const fetchError = error as {
        data?: { statusMessage?: string};
      };

     errorMessage.value = fetchError.data?.statusMessage || 'Something went wrong. Try again.';
    } finally {
      isLoading.value = false;
    }
  }
</script>

<style scoped>
.demo-page {
  min-height: calc(100svh - 96px);
  padding: 80px 24px;
}
.demo-content {
  width: 100%; max-width: 1216px; margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  align-items: start;
  column-gap: 64px;
}
.demo-heading { grid-column: 1; grid-row: 1 / 3; margin: 0; }
.demo-heading h1 {
  margin: 0 0 24px;
  font-size: clamp(42px, 7vw, 68px);
  font-weight: 700;
  line-height: 1.06;
  letter-spacing: -0.045em;
  color: #fafafa;
}
.demo-heading > p { color: #b8b5c9; font-size: 18px; line-height: 1.7; }
.demo-panel {
  grid-column: 2;
  min-width: 0;
  padding: 30px;
  border: 1px solid #302a43;
  border-radius: 20px;
  background: #100d1c;
}
.demo-panel label { display: block; margin-bottom: 12px; color: #f3f1fa; font-size: 15px; font-weight: 600; }
.demo-controls { display: flex; gap: 12px; }
.demo-controls input {
  width: 100%; min-width: 0; min-height: 56px; padding: 14px 16px;
  border: 1px solid #494157; border-radius: 10px;
  background: #090711; color: #fafafa; font-size: 16px;
}
.demo-controls input::placeholder { color: #9690a7; }
.demo-controls button {
  flex-shrink: 0; min-height: 56px; padding: 14px 24px;
  border: 1px solid transparent; border-radius: 10px;
  background: #4f46e5; color: #fff; font-size: 16px; font-weight: 600;
  cursor: pointer; touch-action: manipulation;
}
.demo-controls input:focus-visible, .demo-controls button:focus-visible,
.demo-result a:focus-visible, .demo-signup a:focus-visible {
  outline: 3px solid #a5b4fc; outline-offset: 4px;
}
.demo-controls :disabled { opacity: 0.6; cursor: wait; }
.demo-hint { margin-top: 12px; color: #a39cb4; font-size: 13px; line-height: 1.5; }
.demo-error {
  margin-top: 20px; padding: 14px 16px; border: 1px solid #7e3544;
  border-radius: 10px; color: #fecdd3; background: #30141f;
  font-size: 14px; line-height: 1.6; overflow-wrap: anywhere;
}
.demo-result:empty { display: none; }
.demo-result { margin-top: 24px; padding-top: 24px; border-top: 1px solid #302a43; }
.demo-result p { margin-bottom: 8px; color: #c6c0d5; font-size: 14px; }
.demo-result a { color: #c7d2fe; font-size: 18px; text-decoration: underline; text-underline-offset: 4px; overflow-wrap: anywhere; }
.demo-signup { grid-column: 2; margin-top: 20px; text-align: center; color: #a39cb4; font-size: 14px; line-height: 1.8; }
.demo-signup a { margin-left: 4px; color: #e0e7ff; text-decoration: underline; text-underline-offset: 4px; }
@media (hover: hover) {
  .demo-controls button:hover:not(:disabled) { background: #4338ca; }
  .demo-signup a:hover, .demo-result a:hover { color: #fff; }
}
@media (max-width: 600px) {
  .demo-page { padding: 48px 20px 64px; align-items: start; }
  .demo-heading > p { font-size: 16px; }
  .desktop-break { display: none; }
  .demo-panel { padding: 22px 18px; border-radius: 16px; }
  .demo-controls { flex-direction: column; }
  .demo-controls button { width: 100%; }
}
@media (max-width: 900px) {
  .demo-content { max-width: 760px; grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .demo-heading, .demo-panel, .demo-signup { grid-column: 1; grid-row: auto; }
  .demo-signup { margin-top: 0; }
}
</style>
