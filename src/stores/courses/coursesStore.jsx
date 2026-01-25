// stores/taskStore.js
import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config";

const useCoursesStore = create((set, get) => ({
  courses: null, // General State for courses
  course: null, // State for getCourseById
  loading: false,
  error: null,

  // CREATE - Añadir nuevo curso
  addCourse: async (courseData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from("courses").insert([
        {
          name: courseData.name,
          description: courseData.description,
          facility_id: courseData.facility_id,
          instructor_id: courseData.instructor_id,
          age_min: courseData.age_min,
          age_max: courseData.age_max,
          max_participants: courseData.max_participants,
          price: courseData.price,
          start_date: courseData.start_date,
          end_date: courseData.end_date,
          is_active: courseData.is_active,
          image_urls: courseData.image_urls,
        },
      ]).select(`
          id,
          name,
          description,
          facility_id (
          id,
          name
          ),
          instructor_id(*),
          age_min,
          age_max,
          max_participants,
          price,
          start_date,
          end_date,
          is_active,
          image_urls
        `);

      if (error) throw error;

      // Actualizar el estado
      set((state) => ({
        courses: [...state.courses, data[0]],
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error adding course:", err);
      throw err;
    }
  },

  // READ - Obtener todos los cursos
  getCourses: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          id,
          name,
          description,
          facility_id (
            id,
            name
          ),
          instructor_id (*),
          age_min,
          age_max,
          max_participants,
          price,
          start_date,
          end_date,
          is_active,
          image_urls,
          course_slots (
            *,
            course_slot_times (*)
          )
        `
        )
        .order("created_at", { ascending: false }); // 👈 ordenar por fecha de creación

      if (error) throw error;

      set({ courses: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching courses:", err);
      throw err;
    }
  },

  // READ - Obtener curso por ID
  getCourseById: async (id) => {
    if (!id) {
      throw new Error("El ID del curso es requerido");
    }
  
    set({ loading: true, error: null });
  
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          id,
          name,
          description,
          facility_id (
            id,
            name
          ),
          instructor_id (*),
          age_min,
          age_max,
          max_participants,
          price,
          start_date,
          end_date,
          is_active,
          image_urls,
          course_slots (
            *,
            course_slot_times (*)
          )
        `
        )
        .eq("id", id)
        .single();
  
      if (error) throw error;
  
      set({ course: data, loading: false });
    } catch (err) {
      console.error("Error fetching course by ID:", err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  // UPDATE - Actualizar curso
  updateCourse: async (courseData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("courses")
        .update([
          {
            name: courseData.name,
            description: courseData.description,
            facility_id: courseData.facility_id,
            instructor_id: courseData.instructor_id,
            age_min: courseData.age_min,
            age_max: courseData.age_max,
            max_participants: courseData.max_participants,
            price: courseData.price,
            start_date: courseData.start_date,
            end_date: courseData.end_date,
            is_active: courseData.is_active,
            image_urls: courseData.image_urls,
          },
        ])
        .eq("id", courseData.id).select(`
          id,
          name,
          description,
          facility_id (
          id,
          name
          ),
          instructor_id (*),
          age_min,
          age_max,
          max_participants,
          price,
          start_date,
          end_date,
          is_active,
          image_urls
        `);

      if (error) throw error;

      set((state) => ({
        courses: state.courses.map((t) =>
          t.id === courseData.id ? data[0] : t
        ),
        loading: false,
      }));
      return data[0];
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error updating course:", err);
      throw err;
    }
  },

  // DELETE - Eliminar curso
  deleteCourse: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      set((state) => ({
        courses: state.courses.filter((course) => course.id !== courseId),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error deleting course:", err);
      throw err;
    }
  },
}));

export default useCoursesStore;
