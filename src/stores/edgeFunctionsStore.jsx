import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config";

const useEdgeFunctionsStore = create((set, get) => ({
  loading: false,
  error: null,

  sendEmailNotification: async ({ email, status, courseOrReservationName }) => {
    set({ loading: true, error: null });
    console.log("Valores enviados:", {
      email,
      status,
      courseOrReservationName,
    });

    if (
      !email ||
      typeof email !== "string" ||
      !status ||
      typeof status !== "string" ||
      !courseOrReservationName ||
      typeof courseOrReservationName !== "string"
    ) {
      const errorMsg =
        "Faltan o son inválidos los campos: email, status o courseOrReservationName";
      set({ error: errorMsg, loading: false });
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "send-confirmation-email",
        {
          body: {
            email,
            status,
            courseOrReservationName,
          },
        }
      );

      if (error) {
        throw error;
      }

      set({
        loading: false,
        error: null,
      });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error al enviar notificación por email:", err);
      throw err;
    }
  },
}));

export default useEdgeFunctionsStore;
