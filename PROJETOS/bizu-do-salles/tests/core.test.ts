import { describe, expect, it } from "vitest";
import { activationWindow, canAccess, daysRemaining } from "../src/core/access";
import { checkSession, newSessionToken, hashToken, sessionsToRevoke } from "../src/core/session";
import { xray } from "../src/core/performance";
import { loadQuestionFiles } from "../src/content";
import { visibleForState } from "../src/core/states";
import { displayOrder, isNumericOptions, orderFor, originalLetter } from "../src/core/shuffle";
import { gradeSimulation, pickRandom, secondsLeft } from "../src/core/simulation";
import { csvToObjects, parseCsv } from "../src/core/csv";
import { loadMaterialFiles } from "../src/content";
import { applyCoupon } from "../src/core/pricing";
import { isSafeUrl, parseBody, splitBold } from "../src/core/material";
import { signWebhook, verifyWebhookSignature } from "../src/core/mercadopago-signature";

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
  it("nenhuma letra concentra mais de 35% dos gabaritos", () => {
    const qs = loadQuestionFiles().flatMap((f) => f.questions);
    for (const l of "ABCDE") expect(qs.filter((q) => q.correct === l).length / qs.length).toBeLessThanOrEqual(0.35);
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

describe("embaralhamento das alternativas", () => {
  it("é uma permutação estável por aluno e questão", () => {
    const a = displayOrder("u1", "q1");
    expect([...a].sort()).toEqual(["A", "B", "C", "D", "E"]);
    expect(displayOrder("u1", "q1")).toEqual(a);
    expect(originalLetter("u1", "q1", 2)).toBe(a[2]);
  });
  it("varia entre alunos", () => {
    const orders = new Set(Array.from({ length: 20 }, (_, i) => displayOrder(`u${i}`, "q1").join("")));
    expect(orders.size).toBeGreaterThan(5);
  });
});

describe("simulados", () => {
  it("sorteia sem repetir e respeita a quantidade", () => {
    const ids = Array.from({ length: 50 }, (_, i) => i);
    const s = pickRandom(ids, 20);
    expect(s).toHaveLength(20);
    expect(new Set(s).size).toBe(20);
    expect(pickRandom([1, 2], 10)).toHaveLength(2);
  });
  it("corrige com em branco contando como erro e agrupa por disciplina", () => {
    const r = gradeSimulation([
      { subject: "RDPM", correctLetter: "A", chosenLetter: "A" },
      { subject: "RDPM", correctLetter: "B", chosenLetter: "C" },
      { subject: "CF", correctLetter: "D", chosenLetter: null },
      { subject: "CF", correctLetter: "E", chosenLetter: "E" },
    ]);
    expect(r).toMatchObject({ total: 4, correct: 2, wrong: 1, blank: 1, rate: 50 });
    expect(r.subjects.find((s) => s.subject === "RDPM")).toMatchObject({ total: 2, correct: 1, rate: 50 });
  });
  it("calcula o tempo restante", () => {
    const start = new Date("2026-10-01T12:00:00Z");
    expect(secondsLeft(start, null)).toBeNull();
    expect(secondsLeft(start, 600, new Date("2026-10-01T12:04:00Z"))).toBe(360);
    expect(secondsLeft(start, 600, new Date("2026-10-01T13:00:00Z"))).toBe(0);
  });
});

describe("alternativas numéricas", () => {
  it("não embaralha quando todas são números/valores", () => {
    expect(isNumericOptions(["15 dias", "30 dias", "45 dias", "60 dias", "90 dias"])).toBe(true);
    expect(isNumericOptions(["R$ 2.030,00", "R$ 2.150,00", "R$ 2.300,00", "R$ 2.318,55", "R$ 3.000,00"])).toBe(true);
    expect(isNumericOptions(["Advertência", "5 dias", "x", "y", "z"])).toBe(false);
    const q = { id: "q1", options: ["1 ano", "2 anos", "5 anos", "10 anos", "20 anos"].map((text, i) => ({ letter: "ABCDE"[i], text })) };
    expect(orderFor("u1", q)).toEqual(["A", "B", "C", "D", "E"]);
  });
});

describe("planilha CSV", () => {
  it("lê ponto e vírgula, aspas, quebra de linha em aspas e BOM do Excel", () => {
    const t = '\uFEFFcodigo;enunciado;A\r\nX-Y-001;"Texto; com ""aspas""\ne quebra";opção\r\n\r\n';
    expect(parseCsv(t)).toEqual([["codigo", "enunciado", "A"], ["X-Y-001", 'Texto; com "aspas"\ne quebra', "opção"]]);
  });
  it("aceita vírgula e cabeçalho com acento/maiúsculas", () => {
    const [r] = csvToObjects("Código,Explicação\nA-B-001,ok");
    expect(r).toEqual({ line: 2, data: { codigo: "A-B-001", explicacao: "ok" } });
  });
});

describe("cupons", () => {
  const base = { code: "X", percentOff: null, amountOffCents: null, planSlugs: [] as string[], maxUses: null, used: 0, validUntil: null, active: true };
  it("aplica percentual e valor fixo, respeitando o mínimo", () => {
    expect(applyCoupon(6000, "basico", { ...base, percentOff: 10 }, 100)).toEqual({ ok: true, finalCents: 5400, discountCents: 600 });
    expect(applyCoupon(3500, "basico", { ...base, amountOffCents: 1000 }, 100)).toMatchObject({ ok: true, finalCents: 2500 });
    expect(applyCoupon(3500, "basico", { ...base, percentOff: 100 }, 100)).toMatchObject({ ok: true, finalCents: 100 });
    expect(applyCoupon(3500, "basico", null, 100)).toMatchObject({ ok: true, finalCents: 3500 });
  });
  it("recusa cupom inativo, expirado, esgotado ou de outro plano", () => {
    expect(applyCoupon(3500, "basico", { ...base, active: false }, 100).ok).toBe(false);
    expect(applyCoupon(3500, "basico", { ...base, validUntil: new Date("2020-01-01") }, 100).ok).toBe(false);
    expect(applyCoupon(3500, "basico", { ...base, maxUses: 5, used: 5 }, 100).ok).toBe(false);
    expect(applyCoupon(3500, "basico", { ...base, planSlugs: ["especifico"] }, 100).ok).toBe(false);
  });
});

describe("assinatura do webhook do Mercado Pago", () => {
  it("aceita assinatura correta e recusa adulterada", () => {
    const v1 = signWebhook("segredo", "123456", "req-1", "1700000000");
    expect(verifyWebhookSignature({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: "req-1", dataId: "123456", secret: "segredo" })).toBe(true);
    expect(verifyWebhookSignature({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: "req-1", dataId: "999999", secret: "segredo" })).toBe(false);
    expect(verifyWebhookSignature({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: "req-1", dataId: "123456", secret: "outro" })).toBe(false);
    expect(verifyWebhookSignature({ xSignature: null, xRequestId: null, dataId: "1", secret: "s" })).toBe(false);
    expect(verifyWebhookSignature({ xSignature: "ts=1,v1=zz", xRequestId: null, dataId: "1", secret: "s" })).toBe(false);
  });
});

describe("biblioteca", () => {
  it("formata o resumo em blocos sem HTML", () => {
    const b = parseBody("## Título\nlinha um\nlinha dois\n\n- item A\n- item B\ntexto <b>depois</b>");
    expect(b).toEqual([
      { t: "h", text: "Título" },
      { t: "p", text: "linha um linha dois" },
      { t: "ul", items: ["item A", "item B"] },
      { t: "p", text: "texto <b>depois</b>" },
    ]);
    expect(splitBold("a **b** c")).toEqual([{ b: false, s: "a " }, { b: true, s: "b" }, { b: false, s: " c" }]);
  });
  it("só aceita links https seguros", () => {
    expect(isSafeUrl("https://exemplo.com/audio.mp3")).toBe(true);
    for (const u of ["http://exemplo.com/a.mp3", "javascript:alert(1)", "data:text/html,oi", "https://user:pw@x.com/a", "nada"]) expect(isSafeUrl(u)).toBe(false);
  });
});

describe("materiais iniciais", () => {
  it("arquivos válidos, com fonte e texto", () => {
    const ms = loadMaterialFiles();
    expect(ms.length).toBeGreaterThan(0);
    for (const m of ms) expect(m.kind === "summary" ? m.body.length > 200 : Boolean(m.url)).toBe(true);
  });
});
