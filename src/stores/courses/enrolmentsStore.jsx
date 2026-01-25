import { create } from "zustand"
import { supabase } from "@/supabase/supabase.config"

const useEnrolmentStore = create((set, get) => ({
  enrolments: [],
  loading: false,
  error: null,

  // Obtener inscripciones del usuario actual
  getEnrolments: async () => {
    set({ loading: true, error: null })
    try {
      // En una aplicación real, obtendrías el ID del usuario autenticado
      // const { data: { user } } = await supabase.auth.getUser();
      // const userId = user.id;

      // Para propósitos de demostración, usamos un ID fijo
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const { data, error } = await supabase
        .from("enrolments")
        .select("*")
        .or(`profile_id.eq.${userId},enrolled_by.eq.${userId}`)
        .order("enrolled_at", { ascending: false })

      if (error) throw error

      set({ enrolments: data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error("Error fetching enrolments:", err)
      throw err
    }
  },

  // Crear una nueva inscripción
  addEnrolment: async (enrolmentData) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.from("enrolments").insert([enrolmentData]).select()

      if (error) throw error

      set((state) => ({
        enrolments: [data[0], ...state.enrolments],
        loading: false,
      }))

      return data[0]
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error("Error creating enrolment:", err)
      throw err
    }
  },

  // Cancelar una inscripción
  cancelEnrolment: async (enrolmentId) => {
    set({ loading: true, error: null })
    try {
      const cancelled_at = new Date().toISOString()

      const { data, error } = await supabase
        .from("enrolments")
        .update({
          status: "cancelled",
          cancelled_at,
        })
        .eq("id", enrolmentId)
        .select()

      if (error) throw error

      set((state) => ({
        enrolments: state.enrolments.map((e) =>
          e.id === enrolmentId ? { ...e, status: "cancelled", cancelled_at } : e,
        ),
        loading: false,
      }))

      return data[0]
    } catch (err) {
      set({ error: err.message, loading: false })
      console.error("Error cancelling enrolment:", err)
      throw err
    }
  },
}))

export default useEnrolmentStore
