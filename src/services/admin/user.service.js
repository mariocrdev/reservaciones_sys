import { supabase } from "@/lib/supabase";

export const UserService = {
  async getAllUsers({ page = 1, limit = 20 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        profile_image_url,
        user_roles (
          role
        )
      `,
        { count: "exact" },
      )
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const users = data.map((user) => {
      const roles = user.user_roles?.map((r) => r.role) || [];
      const role = roles.includes("admin") ? "admin" : roles[0] || "member";
      return { ...user, role };
    });

    return { users, count };
  },

  async updateUserRole(userId, role) {
    // Upserting because if a role doesn't exist for the user-role pair constraint (unique),
    // but here we likely want to UPDATE the existing one or Insert if missing.
    // However, the constraint is (user_id, role).
    // Wait, if a user has 'member' and we want to change to 'admin'.
    // If we just upsert (user_id, role='admin'), we might end up with TWO roles if the old one isn't removed,
    // UNLESS the primary key is involved or we handle it differently.
    // The user_roles table has `id` as PK. `user_id` and `role` are unique pair.
    // Access pattern usually implies a user has ONE role in this simple app context based on "cambiar el role entre los cuatos distintos".
    // If the app supports multiple roles, adding 'admin' is fine.
    // But if it's "Change role", we might want to delete old roles or update the single existing one.
    // The schema provided shows: `constraint user_roles_user_id_role_key unique (user_id, role)`
    // This allows a user to have MULTIPLE roles (e.g. member AND admin).
    // But the request says "cambiar el role entre los cuatos distintos" (change the role between the four distinct ones).
    // This implies a single-role model or "primary" role model in the UI.
    // To safely "change" the role, we should probably delete existing roles and insert the new one, OR assume 1 role per user.
    // Given the `has_role` function checks existence, multiple roles are supported.
    // However, for a simple "User Management" dropdown where you pick ONE role, it usually implies replacing the current status.
    // Strategy: Delete all roles for user and insert the new one? Or is there a `role` column on `profiles`? No, it's a separate table.
    // Let's assume we want to SET the role.
    // Safe approach: Remove all roles for user, then add the new one.

    // Step 1: Delete all roles for this user
    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Step 2: Insert new role
    const { data, error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) throw error;
    return data;
  },
};
