import { createHash, randomBytes } from "node:crypto";

/** Token opaco entregue ao cliente; no banco guardamos apenas o hash. */
export function newSessionToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const SESSION_REPLACED = "SESSION_REPLACED";
export const SESSION_REPLACED_MESSAGE = "Sua conta foi conectada em outro dispositivo.";

export interface SessionRow {
  id: string;
  expiresAt: Date;
  revokedAt: Date | null;
  revokedReason: string | null;
}

/** Resultado da validação de uma sessão recebida em uma requisição. */
export function checkSession(s: SessionRow | null, now = new Date()) {
  if (!s) return { ok: false as const, code: "UNAUTHENTICATED" };
  if (s.revokedAt) return { ok: false as const, code: s.revokedReason ?? "REVOKED" };
  if (s.expiresAt <= now) return { ok: false as const, code: "EXPIRED" };
  return { ok: true as const };
}

/** Ao logar: quais sessões ativas devem ser revogadas (todas as anteriores do usuário). */
export function sessionsToRevoke(active: SessionRow[], now = new Date()) {
  return active.filter((s) => !s.revokedAt && s.expiresAt > now).map((s) => s.id);
}
