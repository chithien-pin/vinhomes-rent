import { apiError } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blobPathname, createSignedUrls } from "@/lib/storage";
import { NextResponse } from "next/server";

export function filterSignablePhotoPaths(
  requestedPaths: string[],
  ownedPhotoPaths: string[]
) {
  const owned = new Set(ownedPhotoPaths.map((path) => blobPathname(path)));
  return requestedPaths.filter((path) => owned.has(blobPathname(path)));
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const paths = Array.isArray(body.paths)
      ? body.paths.filter((p: unknown) => typeof p === "string")
      : [];

    const photos = paths.length
      ? await prisma.listingPhoto.findMany({
          where: { listing: { userId: user.id } },
          select: { storagePath: true },
        })
      : [];
    const signablePaths = filterSignablePhotoPaths(
      paths,
      photos.map((photo) => photo.storagePath)
    );

    const urls = await createSignedUrls(signablePaths);
    return NextResponse.json({ urls });
  } catch (error) {
    return apiError(error, "Không lấy được URL ảnh");
  }
}
