import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FacilitiesService } from "@/services/admin/facilities.service";

// --- Facilities Hooks ---
export const useAdminFacilities = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["admin-facilities", page, limit],
    queryFn: () => FacilitiesService.getAllFacilities({ page, limit }),
    keepPreviousData: true,
  });
};

export const useAdminFacilityTypes = () => {
  return useQuery({
    queryKey: ["admin-facility-types"],
    queryFn: () => FacilitiesService.getAllTypes(),
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => FacilitiesService.createFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-facilities"] });
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => FacilitiesService.updateFacility(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-facilities"] });
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => FacilitiesService.deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-facilities"] });
    },
  });
};

// --- Types Hooks ---
export const useCreateType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => FacilitiesService.createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-facility-types"] });
    },
  });
};

export const useUpdateType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => FacilitiesService.updateType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-facility-types"] });
    },
  });
};

export const useDeleteType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => FacilitiesService.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-facility-types"] });
    },
  });
};

// --- Image Upload Hook ---
export const useUploadFacilityImages = () => {
  return useMutation({
    mutationFn: (files) => FacilitiesService.uploadImages(files),
  });
};

export const useDeleteFacilityImage = () => {
  return useMutation({
    mutationFn: (url) => FacilitiesService.deleteImage(url),
  });
};
