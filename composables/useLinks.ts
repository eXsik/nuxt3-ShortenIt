import type { Database } from "~/types/supabase";

export const useLinks = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const {
    data: links,
    error: linksError,
    refresh: refreshLinks,
  } = useAsyncData("links", async () => {
    if (user?.value?.id) {
      const { data, error } = await client
        .from("links")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("user_id", user?.value?.id);

      if (error) {
        console.error("Error fetching links:", error);
        return [];
      }
      return data;
    }

    return [];
  });

  return { links, linksError, refreshLinks };
};
