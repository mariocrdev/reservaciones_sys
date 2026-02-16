import { supabase } from "@/lib/supabase";

export const AdminReservationsService = {
    async getAll({ page = 1, pageSize = 10, filter = "all", status = "all" }) {
        let query = supabase
            .from("reservations")
            .select(`
        *,
        profiles:user_id (first_name, last_name, email),
        facilities:facility_id (name),
        payments:payments(id, status, amount, currency, payment_method, proof_url, created_at)
      `, { count: "exact" });

        // Apply Filters
        if (filter !== "all") {
            const now = new Date();
            let startDate;

            if (filter === "today") {
                startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            } else if (filter === "week") {
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                startDate = weekAgo.toISOString();
            } else if (filter === "month") {
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                startDate = monthAgo.toISOString();
            }

            if (startDate) {
                query = query.gte("created_at", startDate);
            }
        }

        // Apply Status Filter
        if (status !== "all") {
            const now = new Date().toISOString();
            if (status === "cancelled") {
                // Cancelled OR (Pending AND Expired)
                query = query.or(`status.eq.cancelled,and(status.eq.pending,expires_at.lt.${now})`);
            } else if (status === "pending") {
                // Pending AND (Not Expired OR No Expiration)
                query = query.eq("status", "pending").or(`expires_at.gt.${now},expires_at.is.null`);
            } else {
                query = query.eq("status", status);
            }
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { data, count };
    },

    async updateStatus(id, status) {
        const { data, error } = await supabase
            .from("reservations")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};
