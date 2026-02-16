import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPaymentsService } from "@/services/admin/payments.service";

export const useAdminPayments = ({ page, pageSize, status }) => {
    return useQuery({
        queryKey: ["admin-payments", page, pageSize, status],
        queryFn: () => AdminPaymentsService.getAll({ page, pageSize, status }),
        keepPreviousData: true,
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
