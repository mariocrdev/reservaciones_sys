// stores/taskStore.js
import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config";

const useTypeFacilitiesStore = create((set, get) => ({
  type_facilities: [], //State for Types Facilities
  loading: false,
  error: null,

  // CREATE - Añadir nuevo tipo de instalaciones
  addTypeFacilities: async (facilitieData) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("type_facilities")
        .insert([
          {
            name: facilitieData.name,
            type: facilitieData.type,
            description: facilitieData.description,
          },
        ])
        .select();

      if (error) throw error;

      set((state) => ({
        type_facilities: [...state.type_facilities, data[0]],
        loading: false,
      }));
      
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error adding type facilities:", err);
      throw err;
    }
  },

  // READ - Obtener todas los tipos de instalaciones
  getTypeFacilities: async () => {
    // Si ya está cargando o ya tiene datos, no hagas nada
    if (get().loading || get().type_facilities.length > 0) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("type_facilities")
        .select("*");

      if (error) throw error;

      set({ type_facilities: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching type facilities:", err);
      throw err;
    }
  },

  // UPDATE - Actualizar tipo de instalaciones
  updateTypeFacilities: async (facilitieData) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("type_facilities")
        .update([
          {
            name: facilitieData.name,
            type: facilitieData.type,
            description: facilitieData.description,
          },
        ])
        .eq("id", facilitieData.id)
        .select();

      if (error) throw error;

      set((state) => ({
        type_facilities: state.type_facilities.map((t) =>
          t.id === facilitieData.id ? data[0] : t
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error updating type facilities:", err);
      throw err;
    }
  },

  // DELETE - Eliminar tipo de instalaciones
  deleteTypeFacilities: async (facilitieId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("type_facilities")
        .delete()
        .eq("id", facilitieId);

      if (error) throw error;

      set((state) => ({
        type_facilities: state.type_facilities.filter(
          (facilitie) => facilitie.id !== facilitieId
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error deleting type facilities:", err);
      throw err;
    }
  },
}));

export default useTypeFacilitiesStore;
