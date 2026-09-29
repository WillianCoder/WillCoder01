/**
 * 📄 O QUE É: PÁGINA DE NOVA SENHA (endereço /redefinir-senha?token=...), aberta pelo link recebido.
 * ✏️ EDITÁVEL: textos da tela.
 * ⚠️ CUIDADO: o link vale uma vez só e expira (src/config/regras.ts → senha.linkMinutos).
 */
import Link from "next/link";
import { resetPassword } from "../auth-actions";
import { PublicHeader } from "@/components/PublicHeader";
import { findValidReset } from "@/lib/password-reset";

export const metadata = { title: "Nova senha" };
export const dynamic = "force-dynamic";

export default async function Redefinir({ searchParams }: { searchParams: Promise<{ token?: string; erro?: string }> }) {
  const { token = "", erro } = await searchParams;
  const valid = await findValidReset(token);
  return (
    <>
      <PublicHeader />
      <main className="container" style={{ maxWidth: 440, padding: "3rem 16px" }}>
        {!valid ? (
          <div className="card stack">
            <h1>Link inválido</h1>
            <p>Esse link expirou ou já foi usado.</p>
            <Link className="btn" href="/esqueci-senha">Pedir um novo link</Link>
          </div>
        ) : (
          <form action={resetPassword} className="card stack">
            <h1>Criar nova senha</h1>
            {erro && <p className="alert bad" role="alert">{erro}</p>}
            <input type="hidden" name="token" value={token} />
            <div className="field"><label htmlFor="password">Nova senha (mínimo 8 caracteres)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /></div>
            <div className="field"><label htmlFor="confirm">Confirme a nova senha</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" required /></div>
            <button className="btn" type="submit">Salvar nova senha</button>
            <p className="muted" style={{ fontSize: ".85rem" }}>Por segurança, todos os aparelhos conectados serão desconectados.</p>
          </form>
        )}
      </main>
    </>
  );
}
