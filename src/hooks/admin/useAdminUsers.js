import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/admin/user.service";

export const useAdminUsers = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["admin-users", page, limit],
    queryFn: () => UserService.getAllUsers({ page, limit }),
    keepPreviousData: true, // Keep data while fetching next page for smooth UX
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => UserService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      // Also invalidate specific profile queries if helpful, though standard lists are most important
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
