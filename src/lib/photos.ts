import imageCompression from "browser-image-compression";
import {
  MAX_PHOTO_SIZE_MB,
  PHOTO_MAX_DIMENSION,
  PHOTO_QUALITY,
  STORAGE_BUCKET,
} from "./constants";
import { createClient } from "./supabase/client";

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_PHOTO_SIZE_MB,
    maxWidthOrHeight: PHOTO_MAX_DIMENSION,
    useWebWorker: true,
    initialQuality: PHOTO_QUALITY,
    fileType: "image/jpeg",
  });
  const name = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([compressed], name, { type: "image/jpeg" });
}

export async function uploadListingPhoto(params: {
  file: File;
  userId: string;
  listingId: string;
  photoId: string;
  onProgress?: (pct: number) => void;
}): Promise<string> {
  const { file, userId, listingId, photoId, onProgress } = params;
  const path = `${userId}/${listingId}/${photoId}.jpg`;
  const supabase = createClient();

  // Supabase JS doesn't expose XHR progress; approximate with start/end.
  onProgress?.(10);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "image/jpeg",
    });
  if (error) throw error;
  onProgress?.(100);
  return path;
}

export async function getSignedPhotoUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

export async function uploadWithRetry(
  fn: () => Promise<string>,
  retries = 2
): Promise<string> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
  }
  throw lastError;
}
