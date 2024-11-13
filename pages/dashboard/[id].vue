<template>
  <main v-if="data" class="pt-28">
    <div class="container max-w-5xl mx-auto">
      <h1 class="text-5xl text-indigo-500 font-bold">{{ data.key }}</h1>
      <p class="mt-5">Created at: {{ formatDate(data.created_at) }}</p>
      <div class="mt-5 gap-5 flex">
        <Card>
          <div
            class="text-2xl text-white/40 truncate overflow-x-auto"
            texteditable
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
      <Card v-for="click in data.clicks" class="">
        <div
          v-if="click && typeof click === 'object'"
          class="flex justify-between items-center"
        >
          <div>
            <p class="text-lg font-bold text-indigo-500">
              {{ click?.ip }}
            </p>
            <p>
              {{ formatDate(click.created_at) }}
            </p>
          </div>
          <div>
            <p>
              {{ click?.country }}
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
import Card from "~/components/Card.vue";
import type { Database } from "~/types/supabase";

const { id } = useRoute().params;
const { formatDate } = useDateFormatter();

const { data } = useAsyncData(id.toString(), async () => {
  const client = useSupabaseClient<Database>();

  const { data: response, error } = await client
    .from("links")
    .select("*, clicks(*)")
    .eq("key", id)
    .single();

  return response;
});
</script>
