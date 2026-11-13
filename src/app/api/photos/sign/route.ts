import { apiError } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import {
  filterStoredPhotoPaths,
  parseRequestedPhotoPaths,
} from "@/lib/photo-signing";
import { prisma } from "@/lib/prisma";
import { createSignedUrls } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const requestedPaths = parseRequestedPhotoPaths(body.paths);
    if (!requestedPaths.length) {
      return NextResponse.json({ urls: {} });
    }

    const storedPhotos = await prisma.listingPhoto.findMany({
      where: {
        storagePath: { in: requestedPaths },
        listing: { userId: user.id },
      },
      select: { storagePath: true },
    });
    const signablePaths = filterStoredPhotoPaths(
      requestedPaths,
      storedPhotos.map((photo) => photo.storagePath)
    );

    const urls = await createSignedUrls(signablePaths);
    return NextResponse.json({ urls });
  } catch (error) {
    return apiError(error, "Không lấy được URL ảnh");
  }
}
