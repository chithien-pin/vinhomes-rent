import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "vr_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

function encodeBase64Url(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function getRequiredSecret(name: "SESSION_SECRET" | "ADMIN_PASSWORD") {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return "vinhomes-rent-dev-secret";
  throw new Error(`${name} must be set in production`);
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getRequiredSecret("SESSION_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function getAdminCredentials() {
  const password = process.env.ADMIN_PASSWORD;
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: password || (process.env.NODE_ENV !== "production" ? "admin" : ""),
    configured: Boolean(password) || process.env.NODE_ENV !== "production",
  };
}

export async function createSessionToken() {
  const payload = encodeBase64Url(
    JSON.stringify({
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    })
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", await getSigningKey(), encoder.encode(payload))
  );
  return `${payload}.${encodeBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const [payloadPart, signaturePart, extra] = token.split(".");
  if (!payloadPart || !signaturePart || extra) return false;

  try {
    const verified = await crypto.subtle.verify(
      "HMAC",
      await getSigningKey(),
      decodeBase64Url(signaturePart),
      encoder.encode(payloadPart)
    );
    if (!verified) return false;

    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(payloadPart))
    ) as { role?: string; exp?: number };
    return (
      payload.role === "admin" &&
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function isLoggedIn() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function isLoggedInFromRequest(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
