"use server";
/**
 * 📄 O QUE É: AÇÕES DO ADMINISTRADOR no servidor: salvar questão, planos, liberar assinatura, bloquear, escolas, configurações.
 * ✏️ EDITÁVEL: Regras de validação da questão (questionSchema): tamanhos mínimos, formato do código.
 * ⚠️ CUIDADO: Área de SEGURANÇA e AUDITORIA: toda ação grava em AuditLog. Não remova as chamadas audit(...) nem requireAdmin().
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { activationWindow } from "@/core/access";
import { createResetLink } from "@/lib/password-reset";
import { isSafeUrl } from "@/core/material";

const L = ["A", "B", "C", "D", "E"] as const;
const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const questionSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]+(-[A-Z0-9]+)*-\d{3}$/, "Código no formato SIGLA-ASSUNTO-001."),
  subjectId: z.string().min(1, "Escolha a disciplina."),
  topic: z.string().trim().max(120),
  stateCode: z.string().regex(/^([A-Z]{2})?$/),
  statement: z.string().trim().min(15, "Enunciado muito curto."),
  A: z.string().trim().min(1, "Preencha a alternativa A."), B: z.string().trim().min(1, "Preencha a alternativa B."),
  C: z.string().trim().min(1, "Preencha a alternativa C."), D: z.string().trim().min(1, "Preencha a alternativa D."),
  E: z.string().trim().min(1, "Preencha a alternativa E."),
  wA: z.string().trim(), wB: z.string().trim(), wC: z.string().trim(), wD: z.string().trim(), wE: z.string().trim(),
  correct: z.enum(L, { message: "Escolha o gabarito." }),
  explanation: z.string().trim().min(10, "Escreva a explicação."),
  reference: z.string().trim().min(3, "Informe a referência (ex.: CF/88, art. 5º, XI)."),
  sourceLicense: z.string().trim().min(10, "Informe a origem/licença do conteúdo."),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  status: z.enum(["GENERATED", "IN_REVIEW", "REVIEWED", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]),
  isFree: z.string().optional(),
});

export async function saveQuestion(form: FormData) {
  const user = await requireAdmin(["ADMIN", "EDITOR"]);
  const id = String(form.get("id") ?? "");
  const back = `/admin/questoes/${id || "nova"}`;
  const parsed = questionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`${back}?erro=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const d = parsed.data!;
  const texts = L.map((l) => d[l].toLowerCase());
  if (new Set(texts).size < 5) redirect(`${back}?erro=${encodeURIComponent("Há alternativas repetidas.")}`);
  if (d.status === "PUBLISHED" && user.role !== "ADMIN") redirect(`${back}?erro=${encodeURIComponent("Só o administrador publica. Salve como Aprovada.")}`);
  const dup = await db.question.findFirst({ where: { code: d.code, NOT: id ? { id } : undefined } });
  if (dup) redirect(`${back}?erro=${encodeURIComponent("Já existe questão com este código.")}`);

  let topicId: string | null = null;
  if (d.topic) {
    const t = await db.topic.upsert({ where: { subjectId_slug: { subjectId: d.subjectId, slug: slug(d.topic) } }, update: {}, create: { subjectId: d.subjectId, name: d.topic, slug: slug(d.topic) } });
    topicId = t.id;
  }
  const data = {
    code: d.code, subjectId: d.subjectId, topicId, stateCode: d.stateCode || null, statement: d.statement, correctLetter: d.correct,
    explanation: d.explanation, reference: d.reference, sourceLicense: d.sourceLicense, difficulty: d.difficulty, status: d.status, isFree: d.isFree === "on",
  };
  const options = L.map((letter) => ({ letter, text: d[letter], whyWrong: d[`w${letter}`] || null }));
  const before = id ? await db.question.findUnique({ where: { id }, include: { options: true } }) : null;
  const saved = await db.$transaction(async (tx) => {
    const q = id ? await tx.question.update({ where: { id }, data }) : await tx.question.create({ data: { ...data, author: user.name } });
    await tx.questionOption.deleteMany({ where: { questionId: q.id } });
    await tx.questionOption.createMany({ data: options.map((o) => ({ ...o, questionId: q.id })) });
    return q;
  });
  await audit(user.id, id ? "question.update" : "question.create", "Question", saved.id, before, { ...data, options });
  revalidatePath("/admin/questoes");
  redirect(`/admin/questoes/${saved.id}?salvo=1`);
}

export async function savePlan(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get("id"));
  const d = z.object({
    name: z.string().trim().min(3), description: z.string().trim().min(3),
    price: z.string().regex(/^\d+([.,]\d{1,2})?$/), durationDays: z.coerce.number().int().min(1).max(3650),
  }).safeParse(Object.fromEntries(form));
  if (!d.success) redirect("/admin/planos?erro=1");
  const priceCents = Math.round(Number(d.data!.price.replace(",", ".")) * 100);
  const before = await db.plan.findUnique({ where: { id } });
  const after = await db.plan.update({ where: { id }, data: { name: d.data!.name, description: d.data!.description, priceCents, durationDays: d.data!.durationDays, active: form.get("active") === "on" } });
  await audit(user.id, "plan.update", "Plan", id, before, after);
  redirect("/admin/planos?salvo=1");
}

/** Liberação manual (ex.: Pix conferido no extrato) enquanto o gateway não está ligado. Fica auditada. */
export async function activateSubscription(form: FormData) {
  const user = await requireAdmin();
  const sub = await db.subscription.findUnique({ where: { id: String(form.get("id")) }, include: { plan: true } });
  if (!sub) redirect("/admin/usuarios");
  const w = activationWindow("APPROVED", sub!.plan.durationDays, new Date())!;
  await db.subscription.update({ where: { id: sub!.id }, data: { status: "ACTIVE", startsAt: w.startsAt, endsAt: w.endsAt, source: "manual" } });
  await audit(user.id, "subscription.activate_manual", "Subscription", sub!.id, { status: sub!.status }, { status: "ACTIVE", endsAt: w.endsAt, note: String(form.get("note") ?? "") });
  redirect("/admin/usuarios?salvo=1");
}

export async function cancelSubscription(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get("id"));
  await db.subscription.update({ where: { id }, data: { status: "CANCELED" } });
  await audit(user.id, "subscription.cancel", "Subscription", id);
  redirect("/admin/usuarios?salvo=1");
}

export async function toggleBlock(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  if (id === admin.id) redirect("/admin/usuarios");
  const u = await db.user.findUniqueOrThrow({ where: { id } });
  await db.user.update({ where: { id }, data: { blocked: !u.blocked } });
  if (!u.blocked) await db.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date(), revokedReason: "BLOCKED" } });
  await audit(admin.id, u.blocked ? "user.unblock" : "user.block", "User", id);
  redirect("/admin/usuarios?salvo=1");
}

export async function endSessions(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  await db.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date(), revokedReason: "REVOKED" } });
  await audit(admin.id, "user.end_sessions", "User", id);
  redirect("/admin/usuarios?salvo=1");
}

export async function saveSchool(form: FormData) {
  const admin = await requireAdmin();
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const stateCode = String(form.get("stateCode") ?? "SP");
  if (name.length < 3) redirect("/admin/escolas?erro=1");
  const s = await db.school.upsert({ where: { name }, update: { active: true, stateCode }, create: { name, stateCode, city: String(form.get("city") ?? "").trim() || null } });
  await audit(admin.id, "school.save", "School", s.id, null, s);
  redirect("/admin/escolas?salvo=1");
}

export async function toggleSchool(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const s = await db.school.findUniqueOrThrow({ where: { id } });
  await db.school.update({ where: { id }, data: { active: !s.active } });
  await audit(admin.id, s.active ? "school.disable" : "school.enable", "School", id);
  redirect("/admin/escolas");
}

export async function resolveFlag(form: FormData) {
  const user = await requireAdmin(["ADMIN", "EDITOR"]);
  const id = String(form.get("id"));
  await db.questionFlag.update({ where: { id }, data: { resolvedAt: new Date() } });
  await audit(user.id, "flag.resolve", "QuestionFlag", id);
  redirect("/admin/problemas");
}

export async function saveSettings(form: FormData) {
  const user = await requireAdmin();
  for (const key of ["support_whatsapp", "support_email"]) {
    const value = String(form.get(key) ?? "").trim().slice(0, 120);
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  const flags = await db.featureFlag.findMany();
  for (const f of flags) await db.featureFlag.update({ where: { key: f.key }, data: { enabled: form.get(`flag_${f.key}`) === "on" } });
  await audit(user.id, "settings.update", "Setting", "*");
  redirect("/admin?salvo=1");
}

/** Gera link de nova senha para enviar ao aluno (ex.: WhatsApp). Mostrado uma vez; auditado. */
export async function adminResetLink(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const u = await db.user.findUnique({ where: { id } });
  if (!u) redirect("/admin/usuarios");
  const link = await createResetLink(u!.id);
  await audit(admin.id, "user.reset_link", "User", u!.id);
  // Guardado por 2 minutos num cookie protegido, só para exibir na próxima tela.
  (await cookies()).set("reset_link", JSON.stringify({ email: u!.email, link }), { httpOnly: true, sameSite: "strict", path: "/admin", maxAge: 120, secure: process.env.NODE_ENV === "production" });
  redirect("/admin/usuarios?link=1");
}

/** Muda o papel (Aluno / Editor / Administrador). Ninguém muda o próprio papel. Auditado. */
export async function setRole(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const role = String(form.get("role"));
  if (id === admin.id || !["STUDENT", "EDITOR", "ADMIN"].includes(role)) redirect("/admin/usuarios");
  const u = await db.user.findUnique({ where: { id } });
  if (!u) redirect("/admin/usuarios");
  await db.user.update({ where: { id }, data: { role: role as "STUDENT" } });
  await audit(admin.id, "user.role", "User", id, { role: u!.role }, { role });
  redirect("/admin/usuarios?salvo=1");
}

/** Cria cupom de desconto. Percentual (0–100) OU valor fixo em reais. Auditado. */
export async function saveCoupon(form: FormData) {
  const admin = await requireAdmin();
  const d = z.object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/, "Código com 3 a 40 letras/números (sem espaço)."),
    percentOff: z.string().regex(/^(\d{1,3})?$/),
    amountOff: z.string().regex(/^(\d+([.,]\d{1,2})?)?$/),
    maxUses: z.string().regex(/^(\d{1,6})?$/),
    validUntil: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
  }).safeParse(Object.fromEntries(form));
  if (!d.success) redirect(`/admin/cupons?erro=${encodeURIComponent(d.error.issues[0].message)}`);
  const v = d.data!;
  const percentOff = v.percentOff ? Math.min(Number(v.percentOff), 100) : null;
  const amountOffCents = v.amountOff ? Math.round(Number(v.amountOff.replace(",", ".")) * 100) : null;
  if (!percentOff && !amountOffCents) redirect(`/admin/cupons?erro=${encodeURIComponent("Informe o desconto em % ou em R$.")}`);
  if (await db.coupon.findUnique({ where: { code: v.code } })) redirect(`/admin/cupons?erro=${encodeURIComponent("Já existe cupom com esse código.")}`);
  const planSlugs = form.getAll("planSlugs").map(String).filter(Boolean);
  const c = await db.coupon.create({
    data: {
      code: v.code, percentOff, amountOffCents, planSlugs, maxUses: v.maxUses ? Number(v.maxUses) : null,
      validUntil: v.validUntil ? new Date(`${v.validUntil}T23:59:59-03:00`) : null,
    },
  });
  await audit(admin.id, "coupon.create", "Coupon", c.id, null, c);
  redirect("/admin/cupons?salvo=1");
}

export async function toggleCoupon(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const c = await db.coupon.findUniqueOrThrow({ where: { id } });
  await db.coupon.update({ where: { id }, data: { active: !c.active } });
  await audit(admin.id, c.active ? "coupon.disable" : "coupon.enable", "Coupon", id);
  redirect("/admin/cupons");
}

const materialSchema = z.object({
  title: z.string().trim().min(3, "Título muito curto.").max(160),
  kind: z.enum(["summary", "audio", "pdf"]),
  cycle: z.enum(["", "BASIC", "SPECIFIC"]),
  subjectId: z.string(),
  stateCode: z.string().regex(/^([A-Z]{2})?$/),
  storageKey: z.string().trim().max(1000),
  body: z.string().max(50_000),
  sourceLicense: z.string().trim().min(10, "Informe a origem/licença do material."),
});

/** Cria/edita material da biblioteca. Links só https (áudio/PDF hospedados em serviço com permissão). Auditado. */
export async function saveMaterial(form: FormData) {
  const user = await requireAdmin(["ADMIN", "EDITOR"]);
  const id = String(form.get("id") ?? "");
  const back = `/admin/materiais/${id || "novo"}`;
  const p = materialSchema.safeParse(Object.fromEntries(form));
  if (!p.success) redirect(`${back}?erro=${encodeURIComponent(p.error.issues[0].message)}`);
  const d = p.data!;
  if (d.kind !== "summary" && !isSafeUrl(d.storageKey)) redirect(`${back}?erro=${encodeURIComponent("Informe um link https:// válido para o áudio/PDF.")}`);
  if (d.kind === "summary" && d.body.trim().length < 30) redirect(`${back}?erro=${encodeURIComponent("Escreva o texto do resumo.")}`);
  const published = form.get("published") === "on";
  if (published && user.role !== "ADMIN") redirect(`${back}?erro=${encodeURIComponent("Só o administrador publica.")}`);
  const data = {
    title: d.title, kind: d.kind, cycle: d.cycle || null, subjectId: d.subjectId || null, stateCode: d.stateCode || null,
    storageKey: d.kind === "summary" ? "" : d.storageKey, body: d.body, sourceLicense: d.sourceLicense, free: form.get("free") === "on", published,
  } as const;
  const before = id ? await db.material.findUnique({ where: { id } }) : null;
  const m = id ? await db.material.update({ where: { id }, data }) : await db.material.create({ data });
  await audit(user.id, id ? "material.update" : "material.create", "Material", m.id, before, data);
  redirect(`/admin/materiais/${m.id}?salvo=1`);
}
