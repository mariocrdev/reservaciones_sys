import { useQuery } from "@tanstack/react-query";
import { PublicMembershipService } from "@/services/public/membership.service";

export const usePublicMembership = (page = 1, pageSize = 6) => {
  return useQuery({
    queryKey: ["public-membership", page, pageSize],
    queryFn: () => PublicMembershipService.getPaginatedActiveProducts({ page, pageSize }),
  });
};
