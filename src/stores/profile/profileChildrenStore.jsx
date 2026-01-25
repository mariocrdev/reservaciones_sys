// stores/taskStore.js
import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config"; // Ajusta la ruta según tu estructura

const useChildrensStore = create((set, get) => ({
  children: [],
  loading: false,
  error: null,

  // CREATE - Añadir nuevo children
  addChildren: async (childrenData) => {
    set({ loading: true, error: null });
    try {
      // Insertar y obtener los datos con el JOIN en una sola consulta
      const { data, error } = await supabase.from("profile_children").insert([
        {
          parent_id: childrenData.parent_id,
          first_name: childrenData.first_name,
          last_name: childrenData.last_name,
          age: childrenData.age,
          medical_notes: childrenData.medical_notes,
        },
      ]).select(`
          id,
          parent_id,
          first_name,
          last_name,
          age,
          medical_notes
        `);

      if (error) throw error;

      // Actualizar el estado
      set((state) => ({
        children: [...state.children, data[0]],
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error adding childre:", err);
      throw err;
    }
  },

  // READ - Obtener todas las tareas
  getChildrens: async () => {
    // Si ya está cargando o ya tiene datos, no hagas nada
    if (get().loading || get().facilities.length > 0) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.from("facilities").select(`
        id,
        name,
        description,
        image_urls,
        capacity,
        is_active,
        created_at,
        type_facilities (
          id,
          name,
          type,
          description,
          created_at
        )
      `);

      if (error) throw error;

      set({ facilities: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching facilities:", err);
      throw err;
    }
  },

  // READ - Obtener childrens por parent_id
  getChildrensByParentId: async (parentId) => {
    set({ loading: true, error: null });

    console.log("parent ID", parentId)

    try {
      const { data, error } = await supabase
        .from("profile_children")
        .select(
          `
          id,
          parent_id,
          first_name,
          last_name,
          age,
          medical_notes
        `
        )
        .eq("parent_id", parentId);

      if (error) throw error;

      set({ children: data, loading: false });
      return data;
    } catch (err) {
      console.error("Error fetching childrens by parent_id:", err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // UPDATE - Actualizar children
  updateChildren: async (childrenData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("profile_children")
        .update([
          {
            parent_id: childrenData.parent_id,
            first_name: childrenData.first_name,
            last_name: childrenData.last_name,
            age: childrenData.age,
            medical_notes: childrenData.medical_notes,
          },
        ])
        .eq("id", childrenData.id).select(`
          id,
          parent_id,
          first_name,
          last_name,
          age,
          medical_notes
        `);

      if (error) throw error;

      set((state) => ({
        children: state.children.map((t) =>
          t.id === childrenData.id ? data[0] : t
        ),
        loading: false,
      }));
      return data[0];
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error updating children:", err);
      throw err;
    }
  },

  // DELETE - Eliminar children
  deleteChildren: async (childrenId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("profile_children")
        .delete()
        .eq("id", childrenId);

      if (error) throw error;

      set((state) => ({
        children: state.children.filter(
          (facilitie) => facilitie.id !== childrenId
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error deleting children:", err);
      throw err;
    }
  },
}));

export default useChildrensStore;
