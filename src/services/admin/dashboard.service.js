import { supabase } from "@/lib/supabase";
import { AdminPaymentsService } from "./payments.service";

export const DashboardService = {
    /**
     * Fetches the global counts and metrics for the admin dashboard
     */
    async getGlobalMetrics() {
        try {
            // Execute all count queries in parallel
            const [
                profilesCount,
                facilitiesCount,
                coursesCount,
                reservationsCount,
                subscriptionsCount,
                enrolmentsCount,
                paymentsSummary
            ] = await Promise.all([
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("facilities").select("*", { count: "exact", head: true }).eq('is_active', true),
                supabase.from("courses").select("*", { count: "exact", head: true }).eq('is_active', true),
                supabase.from("reservations").select("*", { count: "exact", head: true }).in('status', ['confirmed', 'pending']),
                supabase.from("subscriptions").select("*", { count: "exact", head: true }).in('status', ['active', 'pending', 'past_due']),
                supabase.from("enrolments").select("*", { count: "exact", head: true }).in('status', ['confirmed', 'pending']),
                AdminPaymentsService.getSummary("1") // Get last month's financial summary
            ]);

            // Check for gross errors
            if (profilesCount.error) throw profilesCount.error;

            return {
                users: profilesCount.count || 0,
                facilities: facilitiesCount.count || 0,
                courses: coursesCount.count || 0,
                reservations: reservationsCount.count || 0,
                subscriptions: subscriptionsCount.count || 0,
                enrolments: enrolmentsCount.count || 0,
                finances: paymentsSummary // Returns the aggregated status & amoounts from payments
            };
        } catch (error) {
            console.error("Error fetching global dashboard metrics:", error);
            throw error;
        }
    }
};
