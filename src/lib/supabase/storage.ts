import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET } from "@/lib/constants";

/** Client Storage phía server (service role ưu tiên; fallback publishable/anon). */
export function createStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc key Storage (SERVICE_ROLE / PUBLISHABLE)"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createSignedUrls(
  paths: string[],
  expiresIn = 3600
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const supabase = createStorageClient();
  const result: Record<string, string> = {};

  await Promise.all(
    paths.map(async (path) => {
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, expiresIn);
      if (data?.signedUrl) result[path] = data.signedUrl;
    })
  );

  return result;
}

export async function uploadToStorage(path: string, file: Buffer, contentType: string) {
  const supabase = createStorageClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw error;
  return path;
}

export async function removeFromStorage(paths: string[]) {
  if (!paths.length) return;
  const supabase = createStorageClient();
  await supabase.storage.from(STORAGE_BUCKET).remove(paths);
}
