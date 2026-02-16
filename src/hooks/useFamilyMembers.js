import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FamilyMembersService } from "@/services/familyMembers.service";
import { toast } from "sonner";

export const useFamilyMembers = () => {
    return useQuery({
        queryKey: ["family-members"],
        queryFn: FamilyMembersService.getAllFamilyMembers,
    });
};

export const useCreateFamilyMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: FamilyMembersService.createFamilyMember,
        onSuccess: () => {
            queryClient.invalidateQueries(["family-members"]);
            toast.success("Miembro familiar agregado correctamente");
        },
        onError: (error) => {
            console.error("Error creating family member:", error);
            toast.error("Error al agregar miembro familiar");
        },
    });
};

export const useUpdateFamilyMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => FamilyMembersService.updateFamilyMember({ id, data }),
        onSuccess: () => {
            queryClient.invalidateQueries(["family-members"]);
            toast.success("Miembro familiar actualizado correctamente");
        },
        onError: (error) => {
            console.error("Error updating family member:", error);
            toast.error("Error al actualizar miembro familiar");
        },
    });
};

export const useDeleteFamilyMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: FamilyMembersService.deleteFamilyMember,
        onSuccess: () => {
            queryClient.invalidateQueries(["family-members"]);
            toast.success("Miembro familiar eliminado correctamente");
        },
        onError: (error) => {
            console.error("Error deleting family member:", error);
            toast.error("Error al eliminar miembro familiar");
        },
    });
};
