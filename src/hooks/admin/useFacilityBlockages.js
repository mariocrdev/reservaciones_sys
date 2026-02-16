import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FacilityBlockagesService } from "@/services/admin/facility-blockages.service";

export const useFacilityBlockages = (facilityId) => {
    return useQuery({
        queryKey: ["facility-blockages", facilityId],
        queryFn: () => FacilityBlockagesService.getByFacilityId(facilityId),
        enabled: !!facilityId,
    });
};

export const useCreateFacilityBlockage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => FacilityBlockagesService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["facility-blockages", variables.facility_id]);
        },
    });
};

export const useDeleteFacilityBlockage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, facilityId }) => FacilityBlockagesService.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["facility-blockages", variables.facilityId]);
        },
    });
};
