import { supabase } from "@/lib/supabase";

export const AdminPaymentsService = {
    async getAll({ page = 1, pageSize = 10, status = "all", searchQuery = "" }) {
        // If there's a search query, we must use an inner join for the profile search to work correctly
        const profileSelect = searchQuery ? 'profiles!inner(first_name, last_name, email)' : 'profiles:user_id(first_name, last_name, email)';

        let query = supabase
            .from("payments")
            .select(`
                *,
                ${profileSelect}
            `, { count: "exact" });

        if (searchQuery) {
            query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`, { foreignTable: 'profiles' });
        }

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

    async getSummary(timeRange = "all") {
        let query = supabase
            .from("payments")
            .select("status, amount");

        if (timeRange && timeRange !== "all") {
            const months = parseInt(timeRange, 10);
            if (!isNaN(months)) {
                const date = new Date();
                date.setMonth(date.getMonth() - months);
                query = query.gte("created_at", date.toISOString());
            }
        }

        const { data, error } = await query;

        if (error) throw error;

        // Initialize summary object
        const summary = {
            paid: { count: 0, amount: 0 },
            pending: { count: 0, amount: 0 },
            failed: { count: 0, amount: 0 },
            refunded: { count: 0, amount: 0 },
            total: { count: 0, amount: 0 }
        };

        // Aggregate data
        data.forEach(payment => {
            const status = payment.status;
            const amount = parseFloat(payment.amount) || 0;

            if (summary[status]) {
                summary[status].count += 1;
                summary[status].amount += amount;
            } else {
                // Fallback for unexpected statuses
                summary[status] = { count: 1, amount: amount };
            }

            // Global total
            summary.total.count += 1;
            summary.total.amount += amount;
        });

        return summary;
    },

    async getPaymentConceptDetails(payment) {
        if (!payment || !payment.payment_type) return null;

        if (payment.payment_type === 'reservation' && payment.reservation_id) {
            const { data, error } = await supabase
                .from('reservations')
                .select(`
                    *,
                    facilities:facility_id (name, description, image_urls, type_id)
                `)
                .eq('id', payment.reservation_id)
                .single();
            if (error) throw error;
            return data;
        }

        if (payment.payment_type === 'subscription' && payment.subscription_id) {
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    membership_plans:plan_id (name, duration),
                    family_members:family_member_id (first_name, last_name)
                `)
                .eq('id', payment.subscription_id)
                .single();
            if (error) throw error;
            // Provide plan details from the payments table in case subscription doesn't have it directly loaded
            if (data && payment.plan_id && !data.membership_plans) {
                const { data: planData } = await supabase
                    .from('membership_plans')
                    .select('name, duration')
                    .eq('id', payment.plan_id)
                    .single();
                data.membership_plans = planData;
            }
            return data;
        }

        if (payment.payment_type === 'enrolment' && payment.enrolment_id) {
            const { data, error } = await supabase
                .from('enrolments')
                .select(`
                    *,
                    course_slots:course_slot_id (
                        *,
                        courses:course_id (name, category),
                        facilities:facility_id (name)
                    ),
                    profiles:profile_id (first_name, last_name),
                    family_members:child_id (first_name, last_name)
                `)
                .eq('id', payment.enrolment_id)
                .single();
            if (error) throw error;
            return data;
        }

        return null;
    }
};
