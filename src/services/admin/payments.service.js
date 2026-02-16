import { supabase } from "@/lib/supabase";

export const AdminPaymentsService = {
    async getAll({ page = 1, pageSize = 10, status = "all" }) {
        let query = supabase
            .from("payments")
            .select(`
                *,
                profiles:user_id (first_name, last_name, email),
                reservations:reservation_id (
                    *,
                    facilities:facility_id (
                        name,
                        description,
                        image_urls,
                        type_id
                    )
                )
            `, { count: "exact" });

        // Apply Status Filter
        if (status !== "all") {
            query = query.eq("status", status);
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
            .from("payments")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};
