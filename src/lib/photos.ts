import imageCompression from "browser-image-compression";
import {
  MAX_PHOTO_SIZE_MB,
  PHOTO_MAX_DIMENSION,
  PHOTO_QUALITY,
} from "./constants";

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

export async function fetchSignedUrls(
  paths: string[]
): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const res = await fetch("/api/photos/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths }),
  });
  if (!res.ok) return {};
  const data = await res.json();
  return data.urls ?? {};
}

export async function uploadListingPhotoFile(params: {
  listingId: string;
  file: File;
  onProgress?: (pct: number) => void;
}) {
  const { listingId, file, onProgress } = params;
  onProgress?.(20);
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`/api/listings/${listingId}/photos/upload`, {
    method: "POST",
    body: form,
  });
  onProgress?.(100);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload lỗi");
  return data.photo as { id: string; storagePath: string };
}

export async function uploadWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2
): Promise<T> {
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
