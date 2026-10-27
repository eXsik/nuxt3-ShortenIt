<template>
  <main v-if="data" class="px-4 pt-12 pb-16 sm:px-6 lg:px-8">
    <div class="container max-w-5xl mx-auto">
      <h1 class="text-3xl sm:text-5xl text-indigo-400 font-bold break-all">{{ data.key }}</h1>
      <p class="mt-5">Created at: {{ formatDate(data.created_at) }}</p>
      <div class="mt-5 gap-5 grid sm:grid-cols-[minmax(0,1fr)_auto]">
        <Card class="min-w-0">
          <div
            class="text-base sm:text-2xl text-white/70 break-all"
          >
            {{ data.long_url }}
          </div>
        </Card>
        <Card>
          <h2 class="text-5xl font-bold">{{ data.total_clicks }}</h2>
          <p>Total Clicks</p>
        </Card>
      </div>
    </div>

    <div class="container max-w-5xl mx-auto mt-10 flex flex-col gap-4">
      <h2 class="text-2xl">Clicks log</h2>
      <p v-if="!data.clicks.length" class="text-white/60">No clicks yet. Share your short link to see activity here.</p>
      <Card v-for="click in data.clicks" :key="click.id">
        <div
          v-if="click && typeof click === 'object'"
          class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
        >
          <div>
            <p>
              {{ formatDate(click.created_at) }}
            </p>
          </div>
          <div>
            <p>
              {{ click?.country || 'Unknown country' }}
            </p>
            <p>
              {{ click?.city }}
            </p>
          </div>
        </div>
      </Card>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Database } from "~/types/supabase";

definePageMeta({
  middleware: "auth",
});

const { id } = useRoute().params;
const { formatDate } = useDateFormatter();
const user = useSupabaseUser();
const routeId = Array.isArray(id) ? id[0] : String(id);

const { data, error } = await useAsyncData(`dashboard-link-${routeId}`, async () => {
  const client = useSupabaseClient<Database>();

  if(!user.value?.id) return null;

  const { data: response, error } = await client
    .from("links")
    .select("key, long_url, created_at, total_clicks, clicks(id, created_at, country, city)")
    .eq("key", routeId)
    .eq('user_id', user.value.id)
    .single();

  if (error || !response) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Link not found'
    })
  }

  return response;
});

if (error.value) throw createError(error.value);
</script>
