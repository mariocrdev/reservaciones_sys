import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminCoursesService } from "@/services/admin/courses.service";
import { toast } from "sonner";

export const useAdminCourses = ({ page, pageSize, search } = {}) => {
    return useQuery({
        queryKey: ["admin-courses", page, pageSize, search],
        queryFn: () => AdminCoursesService.getAll({ page, pageSize, search }),
        keepPreviousData: true,
    });
};

export const useAdminCourse = (id) => {
    return useQuery({
        queryKey: ["admin-course", id],
        queryFn: () => AdminCoursesService.getById(id),
        enabled: !!id
    });
}


export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => AdminCoursesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-courses"]);
            toast.success("Curso creado exitosamente");
        },
        onError: (error) => {
            toast.error(`Error al crear curso: ${error.message}`);
        },
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => AdminCoursesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-courses"]);
            toast.success("Curso actualizado exitosamente");
        },
        onError: (error) => {
            toast.error(`Error al actualizar curso: ${error.message}`);
        },
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => AdminCoursesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-courses"]);
            toast.success("Curso eliminado exitosamente");
        },
        onError: (error) => {
            toast.error(`Error al eliminar curso: ${error.message}`);
        },
    });
};

// Hooks for Slots
export const useCourseSlots = (courseId) => {
    return useQuery({
        queryKey: ["admin-course-slots", courseId],
        queryFn: () => AdminCoursesService.getSlots(courseId),
        enabled: !!courseId,
    });
};

export const useCreateCourseSlot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => AdminCoursesService.createSlot(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["admin-course-slots", variables.course_id]);
            toast.success("Horario/Cupo creado exitosamente");
        },
        onError: (error) => {
            toast.error(`Error al crear slot: ${error.message}`);
        },
    });
};

export const useUpdateCourseSlot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => AdminCoursesService.updateSlot(id, data),
        onSuccess: (_, variables) => {
            // We need course_id to invalidate the correct query. 
            // If it's not in variables (it might not be if we only pass id and update data), 
            // we might need to invalidate all 'admin-course-slots' or pass course_id in the mutation call even if not used in the service update.
            // For now, let's assume the caller passes course_id in data or we just invalidate broadly if needed, 
            // but effectively we should try to invalidate the specific list.
            if (variables.course_id) {
                queryClient.invalidateQueries(["admin-course-slots", variables.course_id]);
            } else {
                queryClient.invalidateQueries(["admin-course-slots"]);
            }

            toast.success("Horario/Cupo actualizado exitosamente");
        },
        onError: (error) => {
            toast.error(`Error al actualizar slot: ${error.message}`);
        }
    });
};

export const useDeleteCourseSlot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, courseId }) => AdminCoursesService.deleteSlot(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["admin-course-slots", variables.courseId]);
            toast.success("Horario/Cupo eliminado exitosamente");
        },
        onError: (error) => {
            toast.error(`Error al eliminar slot: ${error.message}`);
        },
    });
};
