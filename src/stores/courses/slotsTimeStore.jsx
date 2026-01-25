// stores/taskStore.js
import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config"; // Ajusta la ruta según tu estructura

const useSlotsTimeStore = create((set, get) => ({
  loading: false,
  error: null,

  // CREATE - Añadir multiples slots_times
  addSlotsTimes: async ({ times, slotId }) => {
    set({ loading: true, error: null });
    try {
      // Insertar múltiples course_slot_times vinculados
      const timesWithSlotId = times.map((t) => ({
        course_slot_id: slotId,
        ...t,
      }));

      const { error } = await supabase
        .from("course_slot_times")
        .insert(timesWithSlotId);

      // Actualizar el estado
      set({ loading: false });

      if (error) throw error;
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error adding new slots_time:", err);
      throw err;
    }
  }
}));

export default useSlotsTimeStore;
