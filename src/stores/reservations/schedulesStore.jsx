import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config";

const useSchedulesStore = create((set, get) => ({
  schedules: [],
  loading: false,
  error: null,

  // CREATE - Crear nuevos horarios (almacenamiento almacenado para crear multiples a la vez)
  addSchedules: async (schedulesData) => {
    set({ loading: true, error: null });
    try {
      // Función para formatear fecha en zona horaria local (Ecuador)
      const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
      };

      const { data, error } = await supabase.rpc("create_multiple_schedules", {
        facilitie_id: schedulesData.facilitieId,
        dates_array: schedulesData.dates.map(formatLocalDate),
        start_time: schedulesData.startTime,
        end_time: schedulesData.endTime,
        available: schedulesData.available,
        is_active: schedulesData.isActive,
      });

      if (error) throw error;

      // Actualizar el estado
      set({ loading: false });
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error adding schedules:", err);
      throw err;
    }
  },

  // READ - Obtener todos los horarios basandose en la fecha([fechas]) y el facility(instalacion)
  getSchedules: async (facilityId, dates) => {
    set({ loading: true, error: null });

    try {
      let query = supabase
        .from("schedules")
        .select(
          `
          id,
          date,
          start_time,
          end_time,
          is_active,
          available,
          facilitie_id (
            id,
            name
          )
        `
        )
        .eq("facilitie_id", facilityId);

      

      // Transformación robusta de fechas
      if (dates?.length > 0) {
        const dateStrings = dates.map((date) => {
          // Si ya es string en formato YYYY-MM-DD, usarlo directamente
          if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }

          // Si es objeto Date, formatearlo manualmente para la fecha local
          // Por el momento al ser objetos Dates entra en esta condicion y convierte todo el array a formato yyyy/mm/dd
          if (date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses son 0-11, sumar 1
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          }

          // Si es string en otro formato, convertirlo a Date primero
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
            const day = String(parsedDate.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          }

          throw new Error(`Formato de fecha no válido: ${date}`);
        });

        

        query = query.in("date", dateStrings);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ schedules: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error fetching schedules:", err);
      throw err;
    }
  },

  // UPDATE - Actualizar horario
  updateSchedules: async (scheduleData) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from("schedules")
        .update([
          {
            facilitie_id: scheduleData.facilitieId,
            start_time: scheduleData.startTime,
            end_time: scheduleData.endTime,
            date: scheduleData.dates,
            available: scheduleData.available,
            is_active: scheduleData.isActive,
          },
        ])
        .eq("id", scheduleData.scheduleId).select(`
          id,
          date,
          start_time,
          end_time,
          is_active,
          available,
          facilitie_id (
            id,
            name
          )
        `);

      if (error) throw error;

      set((state) => ({
        schedules: state.schedules.map((t) =>
          t.id === scheduleData.scheduleId ? data[0] : t
        ),
        loading: false,
      }));
      return data[0];
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error updating schedule:", err);
      throw err;
    }
  },

  // DELETE - Eliminar horario por id
  deleteSchedule: async (scheduleId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;

      set((state) => ({
        schedules: state.schedules.filter(
          (schedule) => schedule.id !== scheduleId
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error deleting schedule:", err);
      throw err;
    }
  },
}));

export default useSchedulesStore;
