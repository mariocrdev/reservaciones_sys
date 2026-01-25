import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config";

const useProfilesStore = create((set, get) => ({
  profiles: [], 
  profile: [],
  loading: false,
  error: null,

  // READ - Obtener profile por userId
  getProfileByUserId: async (userId) => {
    // Si ya está cargando o ya tiene datos, no hagas nada
    if (get().loading || get().profile.length > 0) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          first_name,
          last_name,
          phone,
          email,
          membership_type,
          address,
          city,
          profile_image_url
        `
        )
        .eq("id", userId);

      if (error) throw error;

      // Actualizar el estado
      set(() => ({
        profile: data,
        loading: false,
      }));
    } catch (err) {
      console.error("Error fetching getProfileByUserId:", err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  // READ - Obtener todos los perfiles de los usuarios Funcion (ADMIN)
  getProfiles: async () => {
    // Si ya está cargando o ya tiene datos, no hagas nada
    if (get().loading || get().profiles.length > 0) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          first_name,
          last_name,
          phone,
          email,
          membership_type,
          address,
          city,
          profile_image_url
        `
        )

      if (error) throw error;

      set({ profiles: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error fetching getProfiles:", err);
      throw err;
    }
  },

  // UPDATE - Actualizar perfil (una sola operación que retorna el usuario actualizado)
  updateProfile: async (userId, profileData) => {
    set({ loading: true, error: null });

    try {
      // Construir dinámicamente los datos a actualizar
      const updateFields = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        membership_type: profileData.membership_type,
      };

      // Solo incluir la imagen si no es null
      if (profileData.profile_image) {
        updateFields.profile_image_url = profileData.profile_image;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updateFields)
        .eq("id", userId).select(`
          first_name,
          last_name,
          phone,
          email,
          membership_type,
          address,
          city,
          profile_image_url
        `);

      if (error) throw error;

      set({
        profile: data,
        loading: false,
      });
    } catch (err) {
      console.error("Error update updateProfile:", err);
      set({ error: err, loading: false });
    }
  },
}));

export default useProfilesStore;
