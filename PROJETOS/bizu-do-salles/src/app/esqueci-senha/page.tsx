/**
 * 📄 O QUE É: PÁGINA "ESQUECI MINHA SENHA" (endereço /esqueci-senha).
 * ✏️ EDITÁVEL: textos da tela.
 * ⚠️ CUIDADO: a mensagem de confirmação é sempre a mesma (não revela se o e-mail tem conta).
 */
import Link from "next/link";
import { requestPasswordReset } from "../auth-actions";
import { PublicHeader } from "@/components/PublicHeader";
import { emailEnabled } from "@/lib/email";
import { db } from "@/lib/db";

export const metadata = { title: "Esqueci minha senha" };
export const dynamic = "force-dynamic";

export default async function Esqueci({ searchParams }: { searchParams: Promise<{ enviado?: string; invalido?: string }> }) {
  const sp = await searchParams;
  const whats = await db.setting.findUnique({ where: { key: "support_whatsapp" } });
  return (
    <>
      <PublicHeader />
      <main className="container" style={{ maxWidth: 440, padding: "3rem 16px" }}>
        <form action={requestPasswordReset} className="card stack">
          <h1>Esqueci minha senha</h1>
          {sp.invalido && <p className="alert bad">Esse link expirou ou já foi usado. Peça um novo.</p>}
          {sp.enviado ? (
            <p className="alert ok" role="status">
              Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha. Confira também o spam.
            </p>
          ) : (
            <>
              <p className="muted">Informe o e-mail da sua conta.</p>
              <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
              <button className="btn" type="submit">Enviar link</button>
            </>
          )}
          {!emailEnabled() && (
            <p className="muted" style={{ fontSize: ".9rem" }}>
              Não recebeu? Fale com o suporte{whats?.value ? ` pelo WhatsApp ${String(whats.value)}` : ""} para receber o link.
            </p>
          )}
          <p className="muted"><Link href="/entrar">Voltar para o login</Link></p>
        </form>
      </main>
    </>
  );
}
