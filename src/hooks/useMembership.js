import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MembershipService } from "@/services/membership.service";
import { toast } from "sonner";

export const usePlans = () => {
  return useQuery({
    queryKey: ["membership-plans"],
    queryFn: MembershipService.getAllPlans,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MembershipService.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries(["membership-plans"]);
    },
    onError: (error) => {
      console.error("Error creating plan:", error);
      toast.error("Error al crear el plan");
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => MembershipService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["membership-plans"]);
    },
    onError: (error) => {
      console.error("Error updating plan:", error);
      toast.error("Error al actualizar el plan");
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MembershipService.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries(["membership-plans"]);
      toast.success("Plan eliminado correctamente");
    },
    onError: (error) => {
      console.error("Error deleting plan:", error);
      toast.error("Error al eliminar el plan");
    },
  });
};

export const useUploadPlanImage = () => {
  return useMutation({
    mutationFn: MembershipService.uploadImage,
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    },
  });
};
