import { supabase } from "@/lib/supabase";

export const PublicFacilitiesService = {
  async getPaginatedActive({ page = 1, pageSize = 8 }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("facilities")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, count };
  }
};
