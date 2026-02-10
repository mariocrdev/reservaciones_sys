import { create } from "zustand";
import { supabase } from "@/supabase/supabase.config";

const useBucketStore = create((set, get) => ({
  loading: false,
  error: null,

  addProofPaymentImg: async (paymentImgFile, userId) => {
    set({ loading: true, error: null });

    try {
      if (!paymentImgFile) {
        throw new Error("No se proporcionó un archivo de imagen");
      }

      // 1. Primero validamos con la API de Railway
      const railwayApiUrl =
        "https://web-production-78667.up.railway.app/validate";

      const formData = new FormData();
      formData.append("file", paymentImgFile);

      const validationResponse = await fetch(railwayApiUrl, {
        method: "POST",
        mode: "cors", // Asegúrate de que esto está presente
        body: formData,
      });

      const validationResult = await validationResponse.json();

      if (!validationResult.valid) {
        throw new Error(
          "El archivo no es un comprobante válido. Score: " +
            validationResult.score,
        );
      }

      // 2. Si es válido, procedemos con la subida a Supabase
      const sanitizeFileName = (name) =>
        name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9._-]/g, "")
          .toLowerCase();

      const cleanName = sanitizeFileName(paymentImgFile.name);
      const fileName = `${userId}/${Date.now()}_${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from("payments")
        .upload(fileName, paymentImgFile);

      if (uploadError) {
        console.error("Error al subir la imagen:", uploadError);
        throw uploadError;
      }

      set({ loading: false, error: null });
      return fileName;
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Error en addProofPaymentImg:", err);
      throw err;
    }
  },

  // Conseguir url firmada para poder acceder al bucket
  fetchPaymentImage: async (imagePath) => {
    try {
      const {
        data: { signedUrl },
        error,
      } = await supabase.storage
        .from("payments")
        .createSignedUrl(imagePath, 3600); // 1 hora de validez

      if (error) {
        console.error("Error fetching payment image:", error);
        throw error;
      }

      return signedUrl;
    } catch (error) {
      console.error(error);
    }
  },
}));

export default useBucketStore;
