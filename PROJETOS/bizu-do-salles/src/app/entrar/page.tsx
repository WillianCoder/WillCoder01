import Link from "next/link";
import { login } from "../auth-actions";
import { PublicHeader } from "@/components/PublicHeader";
import { SESSION_REPLACED_MESSAGE } from "@/core/session";

export const metadata = { title: "Entrar" };

const MOTIVOS: Record<string, string> = {
  SESSION_REPLACED: SESSION_REPLACED_MESSAGE,
  EXPIRED: "Sua sessão expirou. Entre novamente.",
  BLOCKED: "Conta bloqueada. Fale com o suporte.",
  LOGOUT: "Você saiu da sua conta.",
  REVOKED: "Sua sessão foi encerrada. Entre novamente.",
};

export default async function Entrar({ searchParams }: { searchParams: Promise<{ erro?: string; motivo?: string }> }) {
  const { erro, motivo } = await searchParams;
  return (
    <>
      <PublicHeader />
      <main className="container" style={{ maxWidth: 440, padding: "3rem 16px" }}>
        <form action={login} className="card stack">
          <h1>Entrar</h1>
          {motivo && MOTIVOS[motivo] && <p className="alert" role="status">{MOTIVOS[motivo]}</p>}
          {erro && <p className="alert bad" role="alert">{erro}</p>}
          <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          <button className="btn" type="submit">Entrar</button>
          <p className="muted">Ainda não tem conta? <Link href="/cadastro">Criar conta</Link></p>
          <p className="muted" style={{ fontSize: ".85rem" }}>Por segurança, sua conta fica conectada em um aparelho por vez.</p>
        </form>
      </main>
    </>
  );
}
