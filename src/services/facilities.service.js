import { supabase } from "@/lib/supabase";

export const FacilitiesService = {
  getAll() {
    return supabase.from("facilities").select("*");
  },

  getById(id) {
    return supabase.from("facilities").select("*").eq("id", id).single();
  },

  create(data) {
    return supabase.from("facilities").insert([data]).select().single();
  },

  update(id, data) {
    return supabase.from("facilities").update(data).eq("id", id).select().single();
  },

  remove(id) {
    return supabase.from("facilities").delete().eq("id", id);
  }
};
