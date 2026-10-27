import type { Database } from "~/types/supabase";

export const useLinks = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const {
    data: links,
    error: linksError,
    refresh: refreshLinks,
    pending: linksPending,
  } = useAsyncData(`links-${user.value?.id ?? 'guest'}`, async () => {
    if (user?.value?.id) {
      const { data, error } = await client
        .from("links")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("user_id", user?.value?.id);

      if (error) {
        throw createError({ statusCode: 500, statusMessage: 'Could not load links. Try again.' });
      }
      return data;
    }

    return [];
  });

  return { links, linksError, linksPending, refreshLinks };
};
