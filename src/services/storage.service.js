import { supabase } from "@/lib/supabase";

export const StorageService = {
    /**
     * Sube un archivo al bucket 'payment_vouchers'.
     * La ruta será: {userId}/{randomHash}.{ext}
     * @param {File} file - El archivo a subir.
     * @param {string} userId - El ID del usuario (auth.uid).
     * @returns {Promise<string>} - La URL pública del archivo subido.
     */
    async uploadVoucher(file, userId) {
        try {
            if (!file) throw new Error("No file content");
            if (!userId) throw new Error("No user ID provided");

            const fileExt = file.name.split(".").pop();
            const randomHash = Math.random().toString(36).substring(2, 15);
            const filePath = `${userId}/${randomHash}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("payment_vouchers")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from("payment_vouchers")
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error("Error uploading voucher:", error);
            throw error;
        }
    },
};
