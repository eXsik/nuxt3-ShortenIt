import type { Database, Link } from "~/types/supabase";

export function useLinkByKey() {
  const client = useSupabaseClient<Database>();

  const fetchLinkByKey = async (key: string) => {
    const { data, error } = await client
      .from("links")
      .select("*")
      .eq("key", key)
      .single();

    if (error || !data) {
      throw createError({
        statusCode: 404,
        message: "Link not found",
      });
    }

    return data as Link;
  };

  return { useLinkByKey };
}