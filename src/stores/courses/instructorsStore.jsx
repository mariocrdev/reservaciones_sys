// stores/taskStore.js
import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config";

const useInstructorsStore = create((set, get) => ({
  instructors: [],
  loading: false,
  error: null,

  // CREATE - Añadir nuevo instructor
  addInstructor: async (instructorData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from("instructors").insert([
        {
          name: instructorData.name,
          last_name: instructorData.last_name,
          profession: instructorData.profession,
          email: instructorData.email,
          phone: instructorData.phone,
          experience: instructorData.experience,
          biography: instructorData.biography,
          image_url: instructorData.image_url,
        },
      ]).select(`
          id,
          name,
          last_name,
          profession,
          email,
          phone,
          experience,
          biography,
          image_url
        `);

      if (error) throw error;

      // Actualizar el estado
      set((state) => ({
        instructors: [...state.instructors, data[0]],
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error adding instructor:", err);
      throw err;
    }
  },

  // READ - Obtener todos los instructores
  getInstructors: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("instructors")
        .select(
          `
          id,
          name,
          last_name,
          profession,
          email,
          phone,
          experience,
          biography,
          image_url
        `
        )
        .order("created_at", { ascending: false }); // 👈 ordenar por fecha de creación

      if (error) throw error;

      set({ instructors: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching instructors:", err);
      throw err;
    }
  },

  // READ BY ID - Obtener un instructor por ID
  getInstructorById: async (instructorId) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("instructors")
        .select(
          `
          id,
          name,
          last_name,
          profession,
          email,
          phone,
          experience,
          biography,
          image_url
        `
        )
        .eq("id", instructorId)
        .single(); // 👈 solo un resultado esperado

      if (error) throw error;

      set({ selectedInstructor: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching instructor by ID:", err);
      throw err;
    }
  },

  // UPDATE - Actualizar instructor
  updateInstructor: async (instructorData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("instructors")
        .update([
          {
            name: instructorData.name,
            last_name: instructorData.last_name,
            profession: instructorData.profession,
            email: instructorData.email,
            phone: instructorData.phone,
            experience: instructorData.experience,
            biography: instructorData.biography,
            image_url: instructorData.image_url,
          },
        ])
        .eq("id", instructorData.id).select(`
          id,
          name,
          last_name,
          profession,
          email,
          phone,
          experience,
          biography,
          image_url
        `);

      if (error) throw error;

      set((state) => ({
        instructors: state.instructors.map((t) =>
          t.id === instructorData.id ? data[0] : t
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error updating instructor:", err);
      throw err;
    }
  },

  // DELETE - Eliminar instructor
  deleteInstructor: async (instructorId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("instructors")
        .delete()
        .eq("id", instructorId);

      if (error) throw error;

      set((state) => ({
        instructors: state.instructors.filter(
          (instructor) => instructor.id !== instructorId
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error deleting instructor:", err);
      throw err;
    }
  },
}));

export default useInstructorsStore;
