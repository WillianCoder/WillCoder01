"use server";
/**
 * 📄 O QUE É: CADASTRO, LOGIN e SAIR (servidor).
 * ✏️ EDITÁVEL: Mensagens de erro (textos entre aspas). Campos do cadastro: signupSchema. Limites: src/config/regras.ts.
 * ⚠️ CUIDADO: Área de SEGURANÇA: não troque a mensagem genérica 'E-mail ou senha incorretos' por algo que revele se o e-mail existe.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, hashPassword, startSession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { REGRAS, janela } from "@/config/regras";

const ip = async () => (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
const fail = (path: string, msg: string): never => redirect(`${path}?erro=${encodeURIComponent(msg)}`);

const signupSchema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo.").max(80),
    email: z.string().trim().toLowerCase().email("E-mail inválido."),
    password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres.").max(128),
    confirm: z.string(),
    stateCode: z.string().regex(/^[A-Z]{2}$/, "Escolha seu estado."),
    schoolId: z.string().optional(),
    terms: z.literal("on", { message: "Aceite os termos e a política de privacidade." }),
  })
  .refine((d) => d.password === d.confirm, { message: "As senhas não conferem." });

export async function signup(form: FormData) {
  if (!rateLimit(`signup:${await ip()}`, ...janela(REGRAS.limites.cadastroPorIP))) fail("/cadastro", "Muitas tentativas. Tente mais tarde.");
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) fail("/cadastro", parsed.error!.issues[0].message);
  const d = parsed.data!;
  if (await db.user.findUnique({ where: { email: d.email } })) fail("/cadastro", "Este e-mail já tem conta. Use Entrar.");
  const now = new Date();
  const user = await db.user.create({
    data: {
      name: d.name, email: d.email, passwordHash: await hashPassword(d.password), stateCode: d.stateCode,
      schoolId: d.schoolId || null, termsAcceptedAt: now, privacyAcceptedAt: now,
    },
  });
  await startSession(user.id);
  redirect("/app?bemvindo=1");
}

export async function login(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  // Proteção contra força bruta: por IP e por conta.
  if (!rateLimit(`login-ip:${await ip()}`, ...janela(REGRAS.limites.loginPorIP)) || !rateLimit(`login:${email}`, ...janela(REGRAS.limites.loginPorConta)))
    fail("/entrar", `Muitas tentativas. Aguarde ${REGRAS.limites.loginPorConta.minutos} minutos.`);
  const user = await db.user.findUnique({ where: { email } });
  // Mesma mensagem para e-mail inexistente ou senha errada (não revela quem tem conta).
  if (!user || !(await verifyPassword(user.passwordHash, password))) fail("/entrar", "E-mail ou senha incorretos.");
  if (user!.blocked) fail("/entrar", "Conta bloqueada. Fale com o suporte.");
  await startSession(user!.id);
  redirect(user!.role === "STUDENT" ? "/app" : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/entrar?motivo=LOGOUT");
}
