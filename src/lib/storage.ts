import {
  del,
  issueSignedToken,
  presignUrl,
  put,
} from "@vercel/blob";

function blobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Thiếu BLOB_READ_WRITE_TOKEN trên Vercel (Storage → Blob → Connect)"
    );
  }
  return token;
}

/** Lấy pathname từ URL Blob hoặc trả về nguyên chuỗi nếu đã là pathname. */
export function blobPathname(urlOrPath: string): string {
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    try {
      const u = new URL(urlOrPath);
      return decodeURIComponent(u.pathname.replace(/^\//, ""));
    } catch {
      return urlOrPath;
    }
  }
  return urlOrPath;
}

export async function uploadToStorage(
  pathname: string,
  file: Buffer,
  contentType: string
) {
  const token = blobToken();
  // Store đang để private — bắt buộc access: 'private'
  const blob = await put(pathname, file, {
    access: "private",
    contentType,
    token,
    addRandomSuffix: false,
  });
  return blob.url;
}

/** Tạo URL xem tạm (1h) cho ảnh private. */
export async function createSignedUrls(
  urlsOrPaths: string[]
): Promise<Record<string, string>> {
  if (!urlsOrPaths.length) return {};
  const token = blobToken();
  const validUntil = Date.now() + 60 * 60 * 1000;
  const issued = await issueSignedToken({
    token,
    pathname: "*",
    operations: ["get"],
    validUntil,
  });

  const result: Record<string, string> = {};
  await Promise.all(
    urlsOrPaths.map(async (key) => {
      try {
        const pathname = blobPathname(key);
        const { presignedUrl } = await presignUrl(issued, {
          access: "private",
          operation: "get",
          pathname,
          validUntil,
        });
        result[key] = presignedUrl;
      } catch (err) {
        console.error("presign failed", key, err);
      }
    })
  );
  return result;
}

export async function removeFromStorage(urlsOrPaths: string[]) {
  const urls = urlsOrPaths.filter(
    (p) => p.startsWith("http://") || p.startsWith("https://")
  );
  if (!urls.length) return;
  await del(urls, { token: blobToken() });
}
