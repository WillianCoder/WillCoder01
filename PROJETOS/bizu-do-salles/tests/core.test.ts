import { describe, expect, it } from "vitest";
import { activationWindow, canAccess, daysRemaining } from "../src/core/access";
import { checkSession, newSessionToken, hashToken, sessionsToRevoke } from "../src/core/session";
import { xray } from "../src/core/performance";
import { loadQuestionFiles } from "../src/content";
import { visibleForState } from "../src/core/states";

const now = new Date("2026-10-01T12:00:00Z");
const future = new Date("2026-12-30T12:00:00Z");

describe("acesso por plano", () => {
  it("libera só o ciclo contratado e com assinatura ativa e válida", () => {
    const subs = [{ status: "ACTIVE" as const, endsAt: future, cycles: ["BASIC" as const] }];
    expect(canAccess(subs, "BASIC", now)).toBe(true);
    expect(canAccess(subs, "SPECIFIC", now)).toBe(false);
  });
  it("bloqueia expirada, pendente e cancelada", () => {
    for (const status of ["PENDING", "CANCELED", "EXPIRED"] as const)
      expect(canAccess([{ status, endsAt: future, cycles: ["BASIC"] }], "BASIC", now)).toBe(false);
    expect(canAccess([{ status: "ACTIVE", endsAt: new Date("2026-09-01"), cycles: ["BASIC"] }], "BASIC", now)).toBe(false);
  });
  it("só ativa com pagamento aprovado", () => {
    expect(activationWindow("PENDING", 90, now)).toBeNull();
    expect(daysRemaining(activationWindow("APPROVED", 90, now)!.endsAt, now)).toBe(90);
  });
});

describe("sessão única", () => {
  it("revoga todas as sessões ativas anteriores", () => {
    const rows = [
      { id: "a", expiresAt: future, revokedAt: null, revokedReason: null },
      { id: "b", expiresAt: new Date("2026-01-01"), revokedAt: null, revokedReason: null },
    ];
    expect(sessionsToRevoke(rows, now)).toEqual(["a"]);
  });
  it("informa sessão substituída ao dispositivo antigo", () => {
    expect(checkSession({ id: "a", expiresAt: future, revokedAt: now, revokedReason: "SESSION_REPLACED" }, now))
      .toEqual({ ok: false, code: "SESSION_REPLACED" });
  });
  it("guarda só o hash do token", () => {
    const { token, tokenHash } = newSessionToken();
    expect(tokenHash).toBe(hashToken(token));
    expect(tokenHash).not.toContain(token);
  });
});

describe("raio-x", () => {
  it("sugere revisar a disciplina mais fraca", () => {
    const mk = (subject: string, ok: number, total: number) =>
      Array.from({ length: total }, (_, i) => ({ subject, correct: i < ok }));
    const r = xray([...mk("Português", 9, 10), ...mk("História", 5, 10)]);
    expect(r.strong.map((s) => s.key)).toEqual(["Português"]);
    expect(r.tips).toContain("Sugestão: revisar História antes de avançar.");
  });
});

describe("banco de questões", () => {
  it("todos os arquivos são válidos e têm fonte/licença", () => {
    const files = loadQuestionFiles();
    expect(files.flatMap((f) => f.questions).length).toBeGreaterThan(0);
  });
});

describe("conteúdo por estado", () => {
  it("nacional para todos, estadual só para a UF do aluno", () => {
    expect(visibleForState(null, "MG")).toBe(true);
    expect(visibleForState("SP", "SP")).toBe(true);
    expect(visibleForState("SP", "MG")).toBe(false);
    expect(visibleForState("SP", null)).toBe(false);
  });
});
