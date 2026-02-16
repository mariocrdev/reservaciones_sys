import { supabase } from "@/lib/supabase";

export const FacilityBlockagesService = {
    async getByFacilityId(facilityId) {
        const { data, error } = await supabase
            .from("facility_blockages")
            .select("*")
            .eq("facility_id", facilityId)
            // Order by the start of the blocked_period
            .order("blocked_period", { ascending: true });

        if (error) throw error;
        return data;
    },

    async create(blockageData) {
        // blockageData should contain: { facility_id, blocked_period, reason }
        const { data, error } = await supabase
            .from("facility_blockages")
            .insert([blockageData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from("facility_blockages")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return true;
    },
};
