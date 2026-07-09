import { supabase } from "@/lib/supabase";

export const PublicMembershipService = {
  async getPaginatedActiveProducts({ page = 1, pageSize = 6 }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Obtener total de membresías activas para la paginación
    const { count, error: countError } = await supabase
      .from("membership_products")
      .select("*", { count: "exact", head: true })
      .eq("active", true);

    if (countError) throw countError;

    // Obtener datos detallados
    const { data, error } = await supabase
      .from("membership_products")
      .select(`
        *,
        membership_plans (*)
      `)
      .eq("active", true)
      .eq("membership_plans.is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, count };
  }
};
