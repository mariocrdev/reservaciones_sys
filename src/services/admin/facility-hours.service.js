import { supabase } from "@/lib/supabase";

export const FacilityHoursService = {
  async getByFacilityId(facilityId) {
    const { data, error } = await supabase
      .from("facility_hours")
      .select("*")
      .eq("facility_id", facilityId)
      .order("day_of_week", { ascending: true })
      .order("open_time", { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(hourData) {
    const { data, error } = await supabase
      .from("facility_hours")
      .insert([hourData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from("facility_hours")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },
};
