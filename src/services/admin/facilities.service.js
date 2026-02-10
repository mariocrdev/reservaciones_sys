import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const FacilitiesService = {
  // --- Facilities ---
  async getAllFacilities({ page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("facilities")
      .select(
        `
        *,
        type_facilities (
          id,
          name
        )
      `,
        { count: "exact" },
      )
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { facilities: data, count };
  },

  async getFacilityById(id) {
    const { data, error } = await supabase
      .from("facilities")
      .select(
        `
        *,
        type_facilities (
          id,
          name
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createFacility(facilityData) {
    const { data, error } = await supabase
      .from("facilities")
      .insert([facilityData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFacility(id, facilityData) {
    const { data, error } = await supabase
      .from("facilities")
      .update(facilityData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFacility(id) {
    // First fetch the facility to get the image urls
    const { data: facility, error: fetchError } = await supabase
      .from("facilities")
      .select("image_urls")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    if (facility?.image_urls && facility.image_urls.length > 0) {
      // Delete all images associated
      for (const url of facility.image_urls) {
        await this.deleteImage(url);
      }
    }

    const { error } = await supabase.from("facilities").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  // --- Type Facilities ---
  async getAllTypes() {
    const { data, error } = await supabase
      .from("type_facilities")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async createType(typeData) {
    const { data, error } = await supabase
      .from("type_facilities")
      .insert([typeData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateType(id, typeData) {
    const { data, error } = await supabase
      .from("type_facilities")
      .update(typeData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteType(id) {
    const { error } = await supabase
      .from("type_facilities")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },

  // --- Image Upload ---
  async uploadImage(file, folder = "facilities") {
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("public_assets")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("public_assets")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadImages(files) {
    const uploadPromises = Array.from(files).map((file) =>
      this.uploadImage(file),
    );
    return Promise.all(uploadPromises);
  },

  async deleteImage(url) {
    const path = url.split("public_assets/")[1];
    if (!path) return;
    const { error } = await supabase.storage
      .from("public_assets")
      .remove([path]);
    if (error) throw error;
    return true;
  },
};
