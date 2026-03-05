
import { useQuery } from "@tanstack/react-query";
import { AdminSubscriptionsService } from "@/services/admin/subscriptions.service";

export const useAdminSubscriptions = (page = 1, limit = 10, search = "", status = "") => {
    return useQuery({
        queryKey: ["admin-subscriptions", page, limit, search, status],
        queryFn: () =>
            AdminSubscriptionsService.getAllSubscriptions({
                page,
                limit,
                search,
                status,
            }),
        keepPreviousData: true,
    });
};

export const useSubscriptionPayments = (subscriptionId) => {
    return useQuery({
        queryKey: ["admin-subscription-payments", subscriptionId],
        queryFn: () => AdminSubscriptionsService.getSubscriptionPayments(subscriptionId),
        enabled: !!subscriptionId,
    });
};
