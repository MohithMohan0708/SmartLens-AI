import { supabase } from "./supabaseClient.js";

export const uploadToSupabase = async (file, userId) => {
  const bucket = "SmartLens Store";
  const filePath = `user_${userId}/${Date.now()}_${file.originalname}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
};
