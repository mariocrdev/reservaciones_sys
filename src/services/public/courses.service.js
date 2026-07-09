import { supabase } from "@/lib/supabase";

export const PublicCoursesService = {
  async getPaginatedActive({ page = 1, pageSize = 6 }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Obtener total de cursos activos primero para la paginación
    const { count, error: countError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (countError) throw countError;

    // Obtener datos detallados
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        course_slots (
          *,
          facilities (name),
          instructor:instructor_id (first_name, last_name, phone, email, profile_image_url),
          course_schedule (
            day_of_week,
            start_time,
            end_time
          )
        )
      `)
      .eq("is_active", true)
      .eq("course_slots.is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, count };
  }
};
