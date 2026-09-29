import Link from "next/link";
import { signup } from "../auth-actions";
import { PublicHeader } from "@/components/PublicHeader";
import { db } from "@/lib/db";

export const metadata = { title: "Criar conta" };
export const dynamic = "force-dynamic";

export default async function Cadastro({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const [states, schools] = await Promise.all([
    db.state.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.school.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <PublicHeader />
      <main className="container" style={{ maxWidth: 520, padding: "3rem 16px" }}>
        <form action={signup} className="card stack">
          <h1>Criar conta</h1>
          <p className="muted">Grátis para experimentar. Você escolhe um plano depois.</p>
          {erro && <p className="alert bad" role="alert">{erro}</p>}
          <div className="field"><label htmlFor="name">Nome completo</label><input id="name" name="name" autoComplete="name" required /></div>
          <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="password">Senha (mínimo 8 caracteres)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /></div>
          <div className="field"><label htmlFor="confirm">Confirme a senha</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" required /></div>
          <div className="field">
            <label htmlFor="stateCode">Estado da sua formação</label>
            <select id="stateCode" name="stateCode" defaultValue="SP" required>
              {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
          {schools.length > 0 && (
            <div className="field">
              <label htmlFor="schoolId">Escola/unidade de formação (opcional)</label>
              <select id="schoolId" name="schoolId" defaultValue="">
                <option value="">Prefiro não informar</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <label className="row" style={{ fontWeight: 400 }}>
            <input type="checkbox" name="terms" required style={{ width: "auto", minHeight: "auto" }} />
            <span>Li e aceito os <Link href="/termos">termos de uso</Link> e a <Link href="/privacidade">política de privacidade</Link>.</span>
          </label>
          <button className="btn" type="submit">Criar conta</button>
          <p className="muted">Já tem conta? <Link href="/entrar">Entrar</Link></p>
        </form>
      </main>
    </>
  );
}
