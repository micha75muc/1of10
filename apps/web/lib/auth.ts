import { cookies } from "next/headers";

const SESSION_COOKIE = "1of10_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

/**
 * Erstellt eine Session nach erfolgreichem Login.
 * Speichert einen signierten Token als HTTP-only Cookie.
 */
export async function createSession(): Promise<void> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");

  const expires = Date.now() + SESSION_DURATION;
  const payload = `admin:${expires}`;

  // HMAC-SHA256 Signatur
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  const sig = Buffer.from(signature).toString("hex");
  const token = `${payload}.${sig}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION / 1000,
  });
}

/**
 * Prüft ob eine gültige Admin-Session existiert.
 */
export async function verifySession(): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;

  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);

  // Signatur prüfen
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  const expectedHex = Buffer.from(expected).toString("hex");

  // Timing-safe Vergleich
  if (sig.length !== expectedHex.length) return false;
  const a = encoder.encode(sig);
  const b = encoder.encode(expectedHex);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  if (diff !== 0) return false;

  // Ablauf prüfen
  const [, expiresStr] = payload.split(":");
  const expires = parseInt(expiresStr, 10);
  if (Date.now() > expires) return false;

  return true;
}

/**
 * Verifiziert Admin-Credentials.
 * Sven (Security): bcrypt statt Klartext-Vergleich.
 * ADMIN_PASSWORD_HASH muss ein bcrypt-Hash sein (z.B. via: npx bcryptjs hash "password")
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) return false;
  if (email !== adminEmail) return false;

  // Support both bcrypt hash ($2a$/$2b$) and legacy plaintext
  if (adminPasswordHash.startsWith("$2")) {
    const { compare } = await import("bcryptjs");
    return compare(password, adminPasswordHash);
  }
  // Fallback: Klartext (für Migration — sollte ASAP auf Hash umgestellt werden)
  return password === adminPasswordHash;
}

/**
 * Session löschen (Logout).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
