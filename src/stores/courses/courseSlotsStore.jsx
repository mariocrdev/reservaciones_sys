// stores/taskStore.js
import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config"; // Ajusta la ruta según tu estructura

const useSlotsStore = create((set, get) => ({
  slots: [],
  loading: false,
  error: null,

  // CREATE - Añadir nuevo slot y retornar el id del slot nuevo
  addSlot: async ({ name_slot, course_id }) => {
    set({ loading: true, error: null });
    try {
      // Paso 1: Insertar el course_slot
      const { data: slot, error } = await supabase
        .from("course_slots")
        .insert({
          course_id: course_id,
          name_slot: name_slot,
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar el estado
      set((state) => ({
        slots: [...state.slots, slot[0]],
        loading: false,
      }));

      return slot; // retorna el slot insertado
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error adding new slot:", err);
      throw err;
    }
  },

  // READ - Obtener todos los slot por courseId
  getSlotsByCourseId: async (courseId) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("course_slots")
        .select(
          `
          *,
          course_slot_times (*)  -- esto hace el JOIN automático gracias a las FK
        `
        )
        .eq("course_id", courseId);

      if (error) throw error;

      set({ slots: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching courses:", err);
      throw err;
    }
  },

  // DELETE - Eliminar slot por id
  deleteSlot: async (courseSlotId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("course_slots")
        .delete()
        .eq("id", courseSlotId);

      if (error) throw error;

      set((state) => ({
        slots: state.slots.filter((slot) => slot.id !== courseSlotId),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error deleting slot:", err);
      throw err;
    }
  },
}));

export default useSlotsStore;
