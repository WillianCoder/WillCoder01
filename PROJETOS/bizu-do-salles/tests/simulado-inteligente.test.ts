import { describe, expect, it } from "vitest";
import { notaDez, situacaoCFSd, smartPick, smartWeight, type SmartCandidate } from "../src/core/simulation";

const c = (id: string, o: Partial<SmartCandidate> = {}): SmartCandidate => ({ id, answered: true, wrongBefore: false, subjectRate: 90, ...o });

describe("simulado inteligente", () => {
  it("dá mais peso a erros antigos e a matérias fracas", () => {
    expect(smartWeight(c("a", { wrongBefore: true }))).toBeGreaterThan(smartWeight(c("b")));
    expect(smartWeight(c("a", { subjectRate: 20 }))).toBeGreaterThan(smartWeight(c("b", { subjectRate: 90 })));
    expect(smartWeight(c("a", { answered: false }))).toBeGreaterThan(smartWeight(c("b")));
  });
  it("sorteia sem repetir e respeita a quantidade", () => {
    const cands = Array.from({ length: 30 }, (_, i) => c(`q${i}`));
    const r = smartPick(cands, 10);
    expect(r).toHaveLength(10);
    expect(new Set(r).size).toBe(10);
    expect(smartPick(cands, 50)).toHaveLength(30);
  });
  it("na média, escolhe muito mais as questões que o aluno errou", () => {
    const cands = [...Array.from({ length: 10 }, (_, i) => c(`erro${i}`, { wrongBefore: true, subjectRate: 40 })), ...Array.from({ length: 90 }, (_, i) => c(`ok${i}`))];
    let erros = 0;
    for (let k = 0; k < 200; k++) erros += smartPick(cands, 10).filter((id) => id.startsWith("erro")).length;
    expect(erros / 200).toBeGreaterThan(4); // sorteio puro daria ~1 em 10
  });
});

describe("nota no padrão do CFSd", () => {
  it("converte acertos em nota de 0 a 10", () => {
    expect(notaDez(7, 10)).toBe(7);
    expect(notaDez(2, 3)).toBe(6.7);
    expect(notaDez(0, 0)).toBe(0);
  });
  it("lê a nota pelas regras da ESSd (7,0 e 5,0)", () => {
    expect(situacaoCFSd(7).nivel).toBe("ok");
    expect(situacaoCFSd(6.9).nivel).toBe("atencao");
    expect(situacaoCFSd(4.9).nivel).toBe("risco");
  });
});
