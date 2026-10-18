import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "./prisma";
import { createClient } from "./supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user || !user.email) {
    redirect("/login");
  }
  return user;
}

async function loadUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { settings: true },
  });
}

/** Upsert app User + default UserSettings. An toàn khi layout + page gọi song song. */
export async function ensureUser(authUser: {
  id: string;
  email?: string | null;
}) {
  if (!authUser.email) {
    throw new Error("Tài khoản thiếu email");
  }

  const existing = await loadUser(authUser.id);
  if (existing) {
    if (!existing.settings) {
      await prisma.userSettings.create({ data: { userId: existing.id } });
      return (await loadUser(authUser.id))!;
    }
    if (existing.email !== authUser.email) {
      return prisma.user.update({
        where: { id: authUser.id },
        data: { email: authUser.email },
        include: { settings: true },
      });
    }
    return existing;
  }

  try {
    return await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        settings: { create: {} },
      },
      include: { settings: true },
    });
  } catch (error) {
    // Race: request khác đã tạo user cùng id/email
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const again = await loadUser(authUser.id);
      if (again) {
        if (!again.settings) {
          await prisma.userSettings.create({ data: { userId: again.id } });
          return (await loadUser(authUser.id))!;
        }
        return again;
      }
    }
    throw error;
  }
}

/** Dedup trong cùng một RSC request (layout + page). */
export const requireAppUser = cache(async () => {
  const authUser = await requireUser();
  return ensureUser(authUser);
});

export class AuthError extends Error {
  status = 401;
  constructor(message = "Chưa đăng nhập") {
    super(message);
    this.name = "AuthError";
  }
}

/** For API routes — throws AuthError instead of redirecting. */
export async function requireApiUser() {
  const authUser = await getSessionUser();
  if (!authUser || !authUser.email) {
    throw new AuthError();
  }
  return ensureUser(authUser);
}
