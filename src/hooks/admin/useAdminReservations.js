import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminReservationsService } from "@/services/admin/reservations.service";

export const useAdminReservations = ({ page, pageSize, filter, status }) => {
    return useQuery({
        queryKey: ["admin-reservations", page, pageSize, filter, status],
        queryFn: () => AdminReservationsService.getAll({ page, pageSize, filter, status }),
        keepPreviousData: true,
    });
};

export const useUpdateReservationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => AdminReservationsService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-reservations"]);
        },
    });
};
