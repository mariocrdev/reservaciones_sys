import { supabase } from "@/lib/supabase";

export const EnrolmentsService = {
    async getUserEnrolments(userId) {
        // Busca inscripciones donde el enrolled_by es el usuario (incluye tanto sus inscripciones como las de sus dependientes)
        const { data, error } = await supabase
            .from("enrolments")
            .select(`
        *,
        course_slots (
          *,
          courses (name, image_url, category),
          facilities (name),
          profiles:instructor_id (first_name, last_name),
          course_schedule (
            day_of_week,
            start_time,
            end_time
          )
        ),
        profiles:profile_id (first_name, last_name),
        family_members:child_id (first_name, last_name),
        payments (*)
      `)
            .eq("enrolled_by", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    },

    async createEnrolment(enrolmentData) {
        const { data, error } = await supabase
            .from("enrolments")
            .insert([enrolmentData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getEnrolmentById(id) {
        const { data, error } = await supabase
            .from("enrolments")
            .select(`
        *,
        course_slots (
          *,
          courses (name),
          facilities (name)
        ),
        profiles:profile_id (first_name, last_name),
        family_members:child_id (first_name, last_name)
      `)
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    },

    async cancelEnrolment(id) {
        const { data, error } = await supabase
            .from("enrolments")
            .update({ status: 'cancelled', updated_at: new Date() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getAllEnrolments(page = 1, pageSize = 10) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from("enrolments")
            .select(`
        *,
        course_slots (
          *,
          courses (name, image_url, category),
          facilities (name),
          profiles:instructor_id (first_name, last_name),
          course_schedule (
            day_of_week,
            start_time,
            end_time
          )
        ),
        profiles:profile_id (first_name, last_name, email),
        family_members:child_id (first_name, last_name),
        enroller:enrolled_by (first_name, last_name, email),
        payments (*)
      `, { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { data, count };
    }
};
