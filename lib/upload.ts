import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("uploadToSupabase can only be called in the browser.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL in .env.local");
  }
  if (!supabaseAnonKey) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

export async function uploadToSupabase(
  file: File,
  bucketName: string = "public-assets",
  pathPrefix?: string,
) {
  try {
    const supabase = getSupabaseClient();

    const fileExt = file.name.split(".").pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const prefix = pathPrefix?.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
    const storagePath = prefix ? `${prefix}/${uniqueName}` : uniqueName;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
