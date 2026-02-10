import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "@/services/profile.service";

export const useProfile = (userId) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => ProfileService.getByUserId(userId),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => ProfileService.update(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", variables.userId],
      });
      queryClient.setQueryData(["profile", variables.userId], data);
    },
  });
};

export const useUploadProfileImage = () => {
  return useMutation({
    mutationFn: ({ userId, file }) =>
      ProfileService.uploadProfileImage(userId, file),
  });
};
