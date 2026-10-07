import "server-only";
import { db } from "./db";
import { GRADE } from "@/config/grade";

/**
 * 📄 O QUE É: quanto conteúdo PUBLICADO o site tem em cada matéria da grade oficial
 *             (questões e resumos). Usado na página pública /grade e na página inicial.
 */
export async function cobertura() {
  const [subjects, q, m] = await Promise.all([
    db.subject.findMany({ select: { id: true, name: true, cycle: { select: { code: true } } } }),
    db.question.groupBy({ by: ["subjectId"], where: { status: "PUBLISHED" }, _count: { _all: true } }),
    db.material.groupBy({ by: ["subjectId"], where: { published: true }, _count: { _all: true } }),
  ]);
  const qn = new Map(q.map((r) => [r.subjectId, r._count._all]));
  const mn = new Map(m.map((r) => [r.subjectId, r._count._all]));
  const conta = (ciclo: "BASIC" | "SPECIFIC", nome: string) => {
    const ids = subjects.filter((s) => s.cycle.code === ciclo && s.name === nome).map((s) => s.id);
    return { questoes: ids.reduce((n, id) => n + (qn.get(id) ?? 0), 0), resumos: ids.reduce((n, id) => n + (mn.get(id) ?? 0), 0) };
  };
  const ciclos = (["BASIC", "SPECIFIC"] as const).map((ciclo) => {
    const materias = GRADE[ciclo].map((mat) => ({ ...mat, ...conta(ciclo, mat.nome) }));
    return { ciclo, horas: materias.reduce((n, x) => n + x.horas, 0), materias };
  });
  const teoricas = ciclos.flatMap((c) => c.materias.filter((x) => !x.pratica));
  return { ciclos, materiasTeoricas: teoricas.length, comQuestoes: teoricas.filter((x) => x.questoes > 0).length };
}
