import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MembershipService } from "@/services/membership.service";
import { toast } from "sonner";

// --- HOOKS FOR PRODUCTS ---

export const useProducts = () => {
  return useQuery({
    queryKey: ["membership-products"],
    queryFn: MembershipService.getAllProducts,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MembershipService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["membership-products"]);
      toast.success("Producto creado correctamente");
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Error al crear el producto");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => MembershipService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["membership-products"]);
      toast.success("Producto actualizado correctamente");
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Error al actualizar el producto");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MembershipService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["membership-products"]);
      toast.success("Producto eliminado correctamente");
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar el producto");
    },
  });
};

// --- HOOKS FOR PLANS ---

export const usePlans = (productId) => {
  return useQuery({
    queryKey: ["membership-plans", productId],
    queryFn: () => MembershipService.getPlansByProductId(productId),
    enabled: !!productId,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: MembershipService.createPlan,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["membership-plans", variables.product_id]);
      toast.success("Plan creado correctamente");
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
    onSuccess: (_, variables) => {
      // We might need to know the productId to invalidate the exact query.
      // If we don't have it easily, we can invalidate all 'membership-plans'.
      // For precision, let's assume we invalidate all for now or pass productId if available.
      queryClient.invalidateQueries(["membership-plans"]);
      toast.success("Plan actualizado correctamente");
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

export const useUploadImage = () => {
  return useMutation({
    mutationFn: MembershipService.uploadImage,
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    },
  });
};
