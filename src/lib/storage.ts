import { del, put } from "@vercel/blob";

/** Blob public URL đã lưu trong DB — trả về nguyên URL. */
export function resolvePhotoUrls(paths: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const path of paths) {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      result[path] = path;
    }
  }
  return result;
}

export async function uploadToStorage(
  pathname: string,
  file: Buffer,
  contentType: string
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Thiếu BLOB_READ_WRITE_TOKEN (Vercel Blob)");
  }

  const blob = await put(pathname, file, {
    access: "public",
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  });

  return blob.url;
}

export async function removeFromStorage(urlsOrPaths: string[]) {
  const urls = urlsOrPaths.filter(
    (p) => p.startsWith("http://") || p.startsWith("https://")
  );
  if (!urls.length) return;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  await del(urls, { token: process.env.BLOB_READ_WRITE_TOKEN });
}
