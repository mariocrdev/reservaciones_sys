import { supabase } from "@/lib/supabase";

export const AdminCoursesService = {
    async getAll({ page, pageSize, search }) {
        let query = supabase
            .from("courses")
            .select("*", { count: "exact" });

        if (search) {
            query = query.ilike("name", `%${search}%`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { data, count };
    },

    async getById(id) {
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(courseData) {
        const { data, error } = await supabase
            .from("courses")
            .insert([courseData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id, courseData) {
        const { data, error } = await supabase
            .from("courses")
            .update(courseData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from("courses")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    async uploadCourseImage(file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `courses/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("public_assets")
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from("public_assets")
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // Slots Management
    async getSlots(courseId) {
        const { data, error } = await supabase
            .from("course_slots")
            .select(`
        *,
        facilities (name),
        profiles:instructor_id (first_name, last_name)
      `)
            .eq("course_id", courseId)
            .order("start_date", { ascending: true });

        if (error) throw error;
        return data;
    },

    async createSlot(slotData) {
        const { data, error } = await supabase
            .from("course_slots")
            .insert([slotData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateSlot(id, slotData) {
        const { data, error } = await supabase
            .from("course_slots")
            .update(slotData)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteSlot(id) {
        const { error } = await supabase
            .from("course_slots")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    // Schedule Management
    async getSchedule(slotId) {
        const { data, error } = await supabase
            .from("course_schedule")
            .select("*")
            .eq("course_slot_id", slotId)
            .order("day_of_week", { ascending: true })
            .order("start_time", { ascending: true });

        if (error) throw error;
        return data;
    },

    async createSchedule(scheduleData) {
        const { data, error } = await supabase
            .from("course_schedule")
            .insert([scheduleData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteSchedule(id) {
        const { error } = await supabase
            .from("course_schedule")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};
