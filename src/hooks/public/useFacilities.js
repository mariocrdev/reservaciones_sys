import { useQuery } from "@tanstack/react-query";
import { PublicFacilitiesService } from "@/services/public/facilities.service";

export const usePublicFacilities = (page = 1, pageSize = 8) => {
  return useQuery({
    queryKey: ["public-facilities", page, pageSize],
    queryFn: () => PublicFacilitiesService.getPaginatedActive({ page, pageSize }),
  });
};
