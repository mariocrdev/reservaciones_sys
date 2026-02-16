import { supabase } from "@/lib/supabase";

export const FamilyMembersService = {
    // GET all family members for the current user (handled by RLS mostly, but good to filter by parent_id if needed, though RLS enforces auth.uid() = parent_id)
    getAllFamilyMembers: async () => {
        const { data, error } = await supabase
            .from("family_members")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    },

    // CREATE a new family member
    createFamilyMember: async (memberData) => {
        // We expect memberData to contain: first_name, last_name, date_of_birth, gender, medical_notes
        // parent_id should be assigned via implicit auth.uid() if RLS/Trigger handles it, OR explicitly passed.
        // Looking at database.sql:
        // create policy "Parents manage their children" ... using ( auth.uid() = parent_id )
        // So we must send parent_id matching auth.uid().

        // However, usually we can get the user ID from the session and pass it.
        // Let's check how other services do it. 
        // Assuming for now we pass the full object including parent_id.

        const { data, error } = await supabase
            .from("family_members")
            .insert([memberData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // UPDATE a family member
    updateFamilyMember: async ({ id, data }) => {
        const { data: updatedData, error } = await supabase
            .from("family_members")
            .update(data)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return updatedData;
    },

    // DELETE a family member
    deleteFamilyMember: async (id) => {
        const { error } = await supabase
            .from("family_members")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return true;
    },
};
