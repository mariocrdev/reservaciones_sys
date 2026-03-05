import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPaymentsService } from "@/services/admin/payments.service";

export const useAdminPayments = ({ page, pageSize, status, searchQuery }) => {
    return useQuery({
        queryKey: ["admin-payments", page, pageSize, status, searchQuery],
        queryFn: () => AdminPaymentsService.getAll({ page, pageSize, status, searchQuery }),
        keepPreviousData: true,
    });
};

export const useAdminPaymentsSummary = (timeRange = "all") => {
    return useQuery({
        queryKey: ["admin-payments-summary", timeRange],
        queryFn: () => AdminPaymentsService.getSummary(timeRange),
    });
};

export const useUpdatePaymentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => AdminPaymentsService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-payments"]);
            queryClient.invalidateQueries(["admin-reservations"]); // Also invalidate reservations as they depend on payments
        },
    });
};

export const usePaymentConceptDetails = (payment) => {
    return useQuery({
        queryKey: ["payment-concept", payment?.id, payment?.payment_type],
        queryFn: () => AdminPaymentsService.getPaymentConceptDetails(payment),
        enabled: !!payment && !!payment.payment_type,
    });
};
