import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationsService } from "@/services/reservations.service";

// Hook to fetch active facilities
export const useActiveFacilities = () => {
  return useQuery({
    queryKey: ["active-facilities"],
    queryFn: () => ReservationsService.getActiveFacilities(),
  });
};

// Hook to fetch available slots
export const useAvailableSlots = (facilityId, date) => {
  return useQuery({
    queryKey: ["available-slots", facilityId, date],
    queryFn: () => ReservationsService.getAvailableSlots(facilityId, date),
    enabled: !!facilityId && !!date, // Only run if both are present
  });
};

// Hook to fetch user reservations
export const useUserReservations = (userId) => {
  return useQuery({
    queryKey: ["user-reservations", userId],
    queryFn: () => ReservationsService.getUserReservations(userId),
    enabled: !!userId,
  });
};

// Mutation to create a reservation
export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ReservationsService.createReservation(data),
    onSuccess: (_, variables) => {
      // Invalidate slots to refresh availability if user stays on same date
      queryClient.invalidateQueries(["available-slots"]);
      queryClient.invalidateQueries(["user-reservations", variables.user_id]);
    },
  });
};

// Mutation to cancel a reservation
export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId) =>
      ReservationsService.cancelReservation(reservationId),
    onSuccess: () => {
      // Invalidate both reservations and slots (since a slot opens up)
      queryClient.invalidateQueries(["user-reservations"]);
      queryClient.invalidateQueries(["available-slots"]);
    },
  });
};
