import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FacilitiesService } from "@/services/facilities.service";

export const useFacilities = () => {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const { data, error } = await FacilitiesService.getAll();
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FacilitiesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
};
