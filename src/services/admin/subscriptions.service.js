
import { supabase } from "@/lib/supabase";

export const AdminSubscriptionsService = {
    async getAllSubscriptions({ page = 1, limit = 10, search = "", status = "" }) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("subscriptions")
            .select(
                `
        *,
        profile:profiles!user_id (
            first_name,
            last_name,
            email,
            profile_image_url
        ),
        family_member:family_members (
            id,
            first_name,
            last_name,
            date_of_birth,
            medical_notes
        ),
        plan:membership_plans!plan_id (
            name,
            price,
            currency,
            duration,
            product:membership_products!product_id (
                name,
                image_url
            )
        )
        `,
                { count: "exact" },
            )
            .range(from, to)
            .order("created_at", { ascending: false });

        if (status) {
            query = query.eq("status", status);
        }

        if (search) {
            // Search by profile email or name using inner join filter
            query = supabase
                .from("subscriptions")
                .select(
                    `
          *,
          profile:profiles!user_id!inner (
              first_name,
              last_name,
              email,
              profile_image_url
          ),
          plan:membership_plans!plan_id (
              name,
              price,
              currency,
              duration,
              product:membership_products!product_id (
                  name,
                  image_url
              )
          )
          `,
                    { count: "exact" },
                )
                .range(from, to)
                .order("created_at", { ascending: false });

            if (status) query = query.eq("status", status);

            query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`, { foreignTable: 'profiles' });
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { subscriptions: data, count };
    },

    async getSubscriptionPayments(subscriptionId) {
        const { data, error } = await supabase
            .from("payments")
            .select("*")
            .eq("subscription_id", subscriptionId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    },
};
