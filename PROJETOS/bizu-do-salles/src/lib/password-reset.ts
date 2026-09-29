/**
 * 📄 O QUE É: LINKS DE REDEFINIÇÃO DE SENHA — uso único, expiram (REGRAS.senha.linkMinutos).
 * ⚠️ CUIDADO: área de SEGURANÇA. O banco guarda só o hash do token; o link completo aparece uma única vez.
 */
import "server-only";
import { headers } from "next/headers";
import { db } from "./db";
import { hashToken, newSessionToken } from "../core/session";
import { REGRAS } from "../config/regras";

async function baseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Cria um link novo e invalida os anteriores do mesmo usuário. */
export async function createResetLink(userId: string) {
  const { token, tokenHash } = newSessionToken();
  const expiresAt = new Date(Date.now() + REGRAS.senha.linkMinutos * 60_000);
  await db.$transaction([
    db.passwordReset.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } }),
    db.passwordReset.create({ data: { userId, tokenHash, expiresAt } }),
  ]);
  return `${await baseUrl()}/redefinir-senha?token=${token}`;
}

/** Link válido (não usado, não expirado) ou null. */
export async function findValidReset(token: string) {
  if (!token || token.length < 20) return null;
  const r = await db.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!r || r.usedAt || r.expiresAt <= new Date()) return null;
  return r;
}
