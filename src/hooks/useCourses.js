import { useState, useCallback } from "react";
import { CoursesService } from "@/services/courses.service";

export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CoursesService.getActiveCourses();
            setCourses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCourseById = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            return await CoursesService.getCourseById(id);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        courses,
        loading,
        error,
        fetchCourses,
        fetchCourseById
    };
};
