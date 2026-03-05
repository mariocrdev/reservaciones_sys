import { supabase } from "@/lib/supabase";

export const CoursesService = {
  async getActiveCourses() {
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
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCourseById(courseId) {
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
      .eq("id", courseId)
      .eq("course_slots.is_active", true)
      .single();

    if (error) throw error;
    return data;
  }
};
