import { supabase } from "@/lib/supabase";

export const PaymentsService = {
  // Create a new payment record
  async createPayment({
    user_id,
    reservation_id,
    amount,
    payment_method,
    proof_url = null,
  }) {
    const { data, error } = await supabase
      .from("payments")
      .insert([
        {
          user_id,
          reservation_id,
          amount,
          payment_method,
          proof_url,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get payments by database user ID (not auth ID necessarily, but usually same)
  async getUserPayments(userId) {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
