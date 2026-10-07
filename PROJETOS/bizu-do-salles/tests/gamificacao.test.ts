import { describe, expect, it } from "vitest";
import { calcularXP, conquistas, maiorSequencia, PATENTES, patente, type Progresso } from "../src/core/gamificacao";

const base: Progresso = { respondidas: 0, acertos: 0, simulados: 0, simuladosInteligentes: 0, melhorNotaSimulado: 0, sequenciaRecorde: 0, materias: [] };

describe("XP e patentes", () => {
  it("soma resposta, acerto e simulado", () => {
    expect(calcularXP({ respondidas: 10, acertos: 7, simulados: 1 })).toBe(10 * 2 + 7 * 10 + 30);
  });
  it("começa como Recruta e sobe exatamente no limite", () => {
    expect(patente(0)).toMatchObject({ nivel: 1, nome: "Recruta", proxima: "Aluno-Soldado", faltam: 200, pct: 0 });
    expect(patente(199).nome).toBe("Recruta");
    expect(patente(200)).toMatchObject({ nivel: 2, nome: "Aluno-Soldado", pct: 0 });
    expect(patente(400).pct).toBe(50);
  });
  it("patente máxima não tem próxima", () => {
    const max = patente(PATENTES[PATENTES.length - 1].xp + 999_999);
    expect(max).toMatchObject({ nome: "Coronel", proxima: null, faltam: 0, pct: 100 });
  });
  it("limites das patentes são crescentes", () => {
    for (let i = 1; i < PATENTES.length; i++) expect(PATENTES[i].xp).toBeGreaterThan(PATENTES[i - 1].xp);
  });
});

describe("conquistas", () => {
  const ganhas = (p: Progresso) => conquistas(p).filter((c) => c.ganhou).map((c) => c.id);
  it("aluno novo não tem nenhuma", () => expect(ganhas(base)).toEqual([]));
  it("libera pelas regras", () => {
    const ids = ganhas({ ...base, respondidas: 60, acertos: 40, simulados: 2, simuladosInteligentes: 1, melhorNotaSimulado: 7.5, sequenciaRecorde: 7, materias: [{ answered: 25, rate: 84 }] });
    expect(ids).toEqual(expect.arrayContaining(["primeira", "q50", "seq3", "seq7", "sim1", "intel", "nota7", "dominio"]));
    expect(ids).not.toContain("q200");
    expect(ids).not.toContain("nota9");
  });
  it("domínio exige volume mínimo na matéria", () => {
    expect(ganhas({ ...base, materias: [{ answered: 5, rate: 100 }] })).not.toContain("dominio");
  });
});

describe("maior sequência de dias", () => {
  it("conta dias seguidos, ignora repetidos e ordem", () => {
    expect(maiorSequencia([])).toBe(0);
    expect(maiorSequencia(["2026-10-01"])).toBe(1);
    expect(maiorSequencia(["2026-10-03", "2026-10-01", "2026-10-02", "2026-10-02", "2026-10-05"])).toBe(3);
  });
  it("atravessa a virada de mês", () => {
    expect(maiorSequencia(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"])).toBe(4);
  });
});
