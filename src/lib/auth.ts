import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "./prisma";
import { isLoggedIn } from "./session";

/** Lấy đúng 1 tài khoản app trong DB (dữ liệu hiện có). */
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

export async function requireSession() {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }
}

/** Dedup trong cùng RSC request. */
export const requireAppUser = cache(async () => {
  await requireSession();
  return getSoloAppUser();
});

export class AuthError extends Error {
  status = 401;
  constructor(message = "Chưa đăng nhập") {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireApiUser() {
  if (!(await isLoggedIn())) {
    throw new AuthError();
  }
  return getSoloAppUser();
}
