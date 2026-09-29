import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { checkSession, hashToken, newSessionToken, SESSION_REPLACED } from "../core/session";

export const COOKIE = "bizu_session";
const TTL_DAYS = 30;

export const hashPassword = (pw: string) => hash(pw); // Argon2id com parâmetros padrão seguros
export const verifyPassword = (h: string, pw: string) => verify(h, pw);

/** Cria sessão e revoga TODAS as anteriores do usuário (regra: um dispositivo por vez). */
export async function startSession(userId: string) {
  const { token, tokenHash } = newSessionToken();
  const ua = (await headers()).get("user-agent")?.slice(0, 120) ?? null;
  const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000);
  await db.$transaction([
    db.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: SESSION_REPLACED },
    }),
    db.session.create({ data: { userId, tokenHash, deviceLabel: ua, expiresAt } }),
  ]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.updateMany({ where: { tokenHash: hashToken(token) }, data: { revokedAt: new Date(), revokedReason: "LOGOUT" } });
  jar.delete(COOKIE);
}

/** Usuário logado ou motivo da falha. Validação sempre no servidor. */
export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return { user: null, reason: "UNAUTHENTICATED" as string };
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  const check = checkSession(session);
  if (!check.ok) return { user: null, reason: check.code };
  if (session!.user.blocked) return { user: null, reason: "BLOCKED" };
  if (Date.now() - session!.lastSeenAt.getTime() > 5 * 60_000)
    await db.session.update({ where: { id: session!.id }, data: { lastSeenAt: new Date() } });
  return { user: session!.user, reason: null };
}

export async function requireUser() {
  const { user, reason } = await currentUser();
  if (!user) redirect(`/entrar${reason && reason !== "UNAUTHENTICATED" ? `?motivo=${reason}` : ""}`);
  return user;
}

export async function requireAdmin(roles: ("ADMIN" | "EDITOR")[] = ["ADMIN"]) {
  const user = await requireUser();
  if (!roles.includes(user.role as "ADMIN")) redirect("/app");
  return user;
}
