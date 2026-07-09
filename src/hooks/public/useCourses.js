import { useQuery } from "@tanstack/react-query";
import { PublicCoursesService } from "@/services/public/courses.service";

export const usePublicCourses = (page = 1, pageSize = 6) => {
  return useQuery({
    queryKey: ["public-courses", page, pageSize],
    queryFn: () => PublicCoursesService.getPaginatedActive({ page, pageSize }),
  });
};
