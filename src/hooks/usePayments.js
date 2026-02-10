import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaymentsService } from "@/services/payments.service";

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => PaymentsService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["user-reservations"]); // Invalidate to update status if backend trigger fires
    },
  });
};
