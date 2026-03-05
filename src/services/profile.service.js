import { supabase } from "@/lib/supabase";

export const ProfileService = {
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        phone,
        email,
        address,
        city,
        date_birth,
        profile_image_url,
        user_roles (
          role
        )
      `,
      )
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Extract role from the nested user_roles array
    // We prioritize 'admin' if the user has multiple roles, otherwise take the first one
    const roles = data.user_roles?.map((r) => r.role) || [];
    const role = roles.includes("admin") ? "admin" : roles[0] || "member";

    return { ...data, role };
  },

  async getAll() {
    const { data, error } = await supabase.from("profiles").select(
      `
        id,
        first_name,
        last_name,
        phone,
        email,
        address,
        city,
        date_birth,
        profile_image_url
      `,
    );

    if (error) throw error;
    return data;
  },

  async update(userId, profileData) {
    const updateFields = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
      city: profileData.city,
      date_birth: profileData.date_birth,
    };

    if (profileData.profile_image) {
      updateFields.profile_image_url = profileData.profile_image;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateFields)
      .eq("id", userId)
      .select(
        `
        first_name,
        last_name,
        phone,
        email,
        address,
        city,
        profile_image_url
      `,
      )
      .single();

    if (error) throw error;
    return data;
  },

  async uploadProfileImage(userId, file) {
    const fileName = `${userId}/profile.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("profile")
      .upload(fileName, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("profile")
      .getPublicUrl(fileName);

    return `${publicUrlData.publicUrl}?t=${Date.now()}`;
  },
};
