import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/admin/dashboard.service";

/**
 * Hook to retrieve global application metrics
 */
export const useGlobalMetrics = () => {
    return useQuery({
        queryKey: ["admin-global-metrics"],
        queryFn: () => DashboardService.getGlobalMetrics(),
        refetchOnWindowFocus: true, // Auto-refresh metrics if user re-enters the window
    });
};
