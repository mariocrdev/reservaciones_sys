import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const MembershipService = {
  async getAllPlans() {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getPlanById(id) {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createPlan(planData) {
    const { data, error } = await supabase
      .from("membership_plans")
      .insert([planData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePlan(id, planData) {
    const { data, error } = await supabase
      .from("membership_plans")
      .update(planData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePlan(id) {
    // First fetch the plan to get the image url
    const { data: plan, error: fetchError } = await supabase
      .from("membership_plans")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    if (plan?.image_url) {
      await this.deleteImage(plan.image_url);
    }

    const { error } = await supabase
      .from("membership_plans")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },

  async uploadImage(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `plans/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("public_assets")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("public_assets")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteImage(url) {
    if (!url) return;
    try {
      const path = url.split("public_assets/")[1];
      if (!path) return;

      const { error } = await supabase.storage
        .from("public_assets")
        .remove([path]);

      if (error) {
        console.error("Error deleting image from bucket:", error);
        // We don't throw here to allow the main operation (e.g. plan modification) to continue
      }
    } catch (error) {
      console.error("Error parsing/deleting image url:", error);
    }
  },
};
