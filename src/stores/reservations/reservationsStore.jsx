import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config";

const useReservationsStore = create((set, get) => ({
  reservations: [],
  loading: false,
  error: null,

  // CREATE - Añadir nueva reservacion
  addReservation: async (reservationData) => {
    set({ loading: true, error: null });
    try {
      // Insertar y obtener los datos con el JOIN en una sola consulta
      const { data, error } = await supabase.from("reservations").insert([
        {
          user_id: reservationData.user_id,
          facility_id: reservationData.facility_id,
          schedule_id: reservationData.time_slot_id,
          payment_img_url: reservationData.payment_img_url,
          status: reservationData.status,
          date: reservationData.date.toLocaleDateString("sv-SE"),
        },
      ]).select(`
        id,
        user_id,
        facility_id (*),
        schedule_id (*),
        status,
        payment_img_url,
        date
      `);

      if (error) throw error;

      // Actualizar el estado
      set((state) => ({
        reservations: [...state.reservations, data[0]],
        loading: false,
      }));
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error adding reservation:", err);
      throw err;
    }
  },

  // READ - Obtener todas las reservas de un usuario
  getReservationByUserId: async (userId, { status, date } = {}) => {
    set({ loading: true, error: null });

    try {
      let query = supabase
        .from("reservations")
        .select(
          `
          id,
          facility_id(*),
          schedule_id(*),
          payment_img_url,
          status,
          created_at,
          date
          `
        )
        .eq("user_id", userId);

      if (status) {
        query = query.eq("status", status);
      }

      if (date) {
        query = query.eq("date", date);
      }

      const { data, error } = await query;

      if (error) throw error;

      set(() => ({
        reservations: data,
        loading: false,
      }));
    } catch (err) {
      console.error("Error fetching reservationsByUser:", err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  // READ - Obtener todas las reservas
  getReservations: async ({ status, date } = {}) => {
    set({ loading: true, error: null });

    try {
      let query = supabase.from("reservations").select(
        `
          id,
          user_id(*),
          facility_id(*),
          schedule_id(*),
          payment_img_url,
          status,
          created_at,
          date
          `
      );

      if (status) {
        query = query.eq("status", status);
      }

      if (date) {
        query = query.eq("date", date);
      }

      const { data, error } = await query;

      if (error) throw error;

      set(() => ({
        reservations: data,
        loading: false,
      }));
    } catch (err) {
      console.error("Error fetching reservationsByUser:", err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  // UPDATE - Actualizar tarea
  updateReservation: async (reservationData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("reservations")
        .update([
          {
            user_id: reservationData.user_id.id,
            facility_id: reservationData.facility_id.id,
            schedule_id: reservationData.schedule_id.id,
            payment_img_url: reservationData.payment_img_url,
            status: reservationData.status,
            date: reservationData.date,
          },
        ])
        .eq("id", reservationData.id).select(`
          id,
          user_id(*),
          facility_id(*),
          schedule_id(*),
          payment_img_url,
          status,
          created_at,
          date
        `);

      if (error) throw error;

      set((state) => ({
        reservations: state.reservations.map((t) =>
          t.id === reservationData.id ? data[0] : t
        ),
        loading: false,
      }));
      return data[0];
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error updating facilitie:", err);
      throw err;
    }
  },
}));

export default useReservationsStore;
