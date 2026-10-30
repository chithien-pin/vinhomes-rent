import { cache } from "react";
import { prisma } from "./prisma";

/** Lấy đúng 1 tài khoản app trong DB (dùng cá nhân, không login). */
export async function getSoloAppUser() {
  let user = await prisma.user.findFirst({
    include: { settings: true },
    orderBy: { createdAt: "asc" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "admin",
        email: "admin@local",
        settings: { create: {} },
      },
      include: { settings: true },
    });
  } else if (!user.settings) {
    await prisma.userSettings.create({ data: { userId: user.id } });
    user = (await prisma.user.findUnique({
      where: { id: user.id },
      include: { settings: true },
    }))!;
  }

  return user;
}

export const requireAppUser = cache(async () => getSoloAppUser());

export async function requireApiUser() {
  return getSoloAppUser();
}

/** Giữ class để apiError không phải đổi — không còn dùng để chặn truy cập. */
export class AuthError extends Error {
  status = 401;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}
