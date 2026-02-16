import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const MembershipService = {
  // --- PRODUCTS ---
  async getAllProducts() {
    const { data, error } = await supabase
      .from("membership_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProductById(id) {
    const { data, error } = await supabase
      .from("membership_products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createProduct(productData) {
    const { data, error } = await supabase
      .from("membership_products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from("membership_products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    // First fetch to get image url
    const { data: product, error: fetchError } = await supabase
      .from("membership_products")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    if (product?.image_url) {
      await this.deleteImage(product.image_url);
    }

    const { error } = await supabase
      .from("membership_products")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  // --- PLANS ---
  async getPlansByProductId(productId) {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("product_id", productId)
      .order("price", { ascending: true });

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
    const { error } = await supabase
      .from("membership_plans")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },

  // --- COMMON (IMAGES) ---
  async uploadImage(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `plans/${fileName}`; // Keeping 'plans' folder or change to 'products' if preferred

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
      }
    } catch (error) {
      console.error("Error parsing/deleting image url:", error);
    }
  },


  // --- SUBSCRIPTIONS ---
  async subscribe({ userId, planId, familyMemberId = null }) {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          family_member_id: familyMemberId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSubscriptions(userId) {
    // Fetch subscriptions for the user (self) and their family members
    // We can do this by filtering where user_id matches. 
    // The policy "users_view_own_reservations" is for reservations.
    // Let's check subscriptions policies.
    // "users_view_own_subscriptions" -> auth.uid() = user_id.
    // So simply selecting * from subscriptions will return all subs for this user.

    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        plan:membership_plans (
          *,
          product:membership_products (*)
        ),
        family_member:family_members (*),
        payments:payments(*)
      `)
      // We can't easily limit inner join in one go without a function, 
      // but we can order them to ensure [0] is latest.
      // However, supabase-js syntax for inner order is .order(..., {foreignTable: 'payments'})
      // Actually simpler to just fetch them and sort in JS if the volume is low, 
      // OR use the dot syntax if supported properly for referencing inner tables.
      // Let's try standard approach:
      .order("created_at", { ascending: false });

    // Note: RLS policies ensure users only see their own data.

    if (error) throw error;

    // Sort payments manually to be safe
    const processedData = data.map(sub => ({
      ...sub,
      payments: sub.payments ? sub.payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : []
    }));

    return processedData;

    if (error) throw error;
    return data;
  },

  async cancelSubscription(id, reason = null) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
