import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FacilityHoursService } from "@/services/admin/facility-hours.service";

export const useFacilityHours = (facilityId) => {
  return useQuery({
    queryKey: ["facility-hours", facilityId],
    queryFn: () => FacilityHoursService.getByFacilityId(facilityId),
    enabled: !!facilityId,
  });
};

export const useCreateFacilityHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => FacilityHoursService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["facility-hours", variables.facility_id]);
    },
  });
};

export const useDeleteFacilityHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, facilityId }) => FacilityHoursService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["facility-hours", variables.facilityId]);
    },
  });
};
