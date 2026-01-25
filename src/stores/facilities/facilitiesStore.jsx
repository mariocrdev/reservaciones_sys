import { create } from "zustand";
import { supabase } from "@/lib/supabase";

const useFacilitiesStore = create((set, get) => ({
  facilities: [],
  facilityDetails: {},
  loading: false,
  error: null,

  // CREATE - Añadir nueva instalacion
  addFacilities: async (facilityData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from("facilities").insert([
        {
          name: facilityData.name,
          type_id: facilityData.type_id,
          description: facilityData.description,
          image_urls: facilityData.image_urls,
          is_active: true,
          for_reservation: facilityData.for_reservation || null,
          price_reservation: facilityData.price_reservation || null,
        },
      ]).select(`
          id,
          name,
          description,
          image_urls,
          is_active,
          for_reservation,
          price_reservation,
          type_facilities (
            id,
            name,
            type,
            description
          )
        `);

      if (error) throw error;

      // Actualizar el estado
      set((state) => ({
        facilities: [...state.facilities, data[0]],
        loading: false,
      }));
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error adding facility:", err);
      throw err;
    }
  },

  // READ - Obtener todas las instalaciones
  getFacilities: async () => {
    // Si ya está cargando o ya tiene datos, no hagas nada
    if (get().loading || get().facilities.length > 0) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("facilities")
        .select(
          `
        id,
        name,
        description,
        image_urls,
        is_active,
        for_reservation,
        price_reservation,
        type_facilities (
          id,
          name,
          type,
          description
        )
      `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ facilities: data, loading: false });
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error fetching facilities:", err);
      throw err;
    }
  },

  // READ - Obtener facility por id
  getFacilityById: async (facilityId) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("facilities")
        .select(
          `
          id,
          name,
          description,
          image_urls,
          is_active,
          for_reservation,
          price_reservation,
          type_facilities (
            id,
            name,
            type,
            description
          )
        `
        )
        .eq("id", facilityId)
        .single(); // <- Esto asegura que devuelve solo un objeto

      if (error) throw error;

      set({ facilityDetails: data, loading: false }); // asume que guardas 1 sola instalación
      return data;
    } catch (err) {
      console.error("Error fetching facility:", err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  // UPDATE - Actualizar facility
  updateFacilities: async (facilityData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("facilities")
        .update([
          {
            name: facilityData.name,
            type_id: facilityData.type_id,
            description: facilityData.description,
            image_urls: facilityData.image_urls,
            for_reservation: facilityData.for_reservation,
            price_reservation: facilityData.price_reservation,
            is_active: true,
          },
        ])
        .eq("id", facilityData.id).select(`
          id,
          name,
          description,
          image_urls,
          for_reservation,
          price_reservation,
          is_active,
          type_facilities (
            id,
            name,
            type,
            description
          )
        `);

      if (error) throw error;

      set((state) => ({
        facilities: state.facilities.map((t) =>
          t.id === facilityData.id ? data[0] : t
        ),
        loading: false,
      }));
      return data[0];
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error updating facility:", err);
      throw err;
    }
  },

  // DELETE - Eliminar tarea
  deleteFacilitie: async (facilityId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("facilities")
        .delete()
        .eq("id", facilityId);

      if (error) throw error;

      set((state) => ({
        facilities: state.facilities.filter(
          (facility) => facility.id !== facilityId
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Error deleting facility:", err);
      throw err;
    }
  },
}));

export default useFacilitiesStore;
