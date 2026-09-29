import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteAccount, savePreferences } from "../actions";
import { logout } from "../../auth-actions";

export const metadata = { title: "Configurações" };

export default async function Configuracoes({ searchParams }: { searchParams: Promise<{ salvo?: string; erro_exclusao?: string }> }) {
  const user = await requireUser();
  const jar = await cookies();
  const { salvo, erro_exclusao } = await searchParams;
  const goal = await db.goal.findUnique({ where: { userId: user.id } });
  return (
    <div className="stack">
    <form action={savePreferences} className="card stack" style={{ maxWidth: 520 }}>
      <h1>Configurações</h1>
      {salvo && <p className="alert ok">Preferências salvas.</p>}
      <div className="field"><label htmlFor="nickname">Apelido (aparece no ranking)</label><input id="nickname" name="nickname" defaultValue={user.nickname ?? ""} maxLength={30} /></div>
      <label className="row" style={{ fontWeight: 400 }}>
        <input type="checkbox" name="rankingOptIn" defaultChecked={user.rankingOptIn} style={{ width: "auto", minHeight: "auto" }} />
        <span>🏆 Participar do ranking (mostra só o apelido e a escola)</span>
      </label>
      <div className="field"><label htmlFor="metaDiaria">🎯 Meta diária de questões (0 = sem meta)</label><input id="metaDiaria" name="metaDiaria" type="number" min={0} max={500} defaultValue={goal?.questionsDay ?? 20} /></div>
      <h2>Aparência e acessibilidade</h2>
      <div className="field">
        <label htmlFor="tema">Tema</label>
        <select id="tema" name="tema" defaultValue={jar.get("tema")?.value ?? "auto"}>
          <option value="auto">Automático (segue o aparelho)</option><option value="light">Claro</option><option value="dark">Escuro</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="fonte">Tamanho da letra</label>
        <select id="fonte" name="fonte" defaultValue={jar.get("fonte")?.value ?? "normal"}>
          <option value="small">Menor</option><option value="normal">Padrão</option><option value="large">Maior</option><option value="xlarge">Muito maior</option>
        </select>
      </div>
      <button className="btn" type="submit">Salvar</button>
    </form>
    <section className="card stack" style={{ maxWidth: 520 }}>
      <h2>🔒 Meus dados (LGPD)</h2>
      <p className="muted">Você pode baixar tudo o que o Bizu guarda sobre você, ou excluir sua conta.</p>
      <a className="btn ghost small" href="/app/meus-dados" download>Baixar meus dados (JSON)</a>
      {user.role === "STUDENT" && (
        <details>
          <summary>Excluir minha conta</summary>
          <form action={deleteAccount} className="stack" style={{ marginTop: ".75rem" }}>
            <p className="alert bad">Isso apaga seu histórico de estudo, cadernos e simulados e <strong>não pode ser desfeito</strong>. Registros de pagamento são mantidos sem dados pessoais, por obrigação legal.</p>
            {erro_exclusao && <p className="alert bad" role="alert">{erro_exclusao}</p>}
            <div className="field"><label htmlFor="senha">Sua senha</label><input id="senha" name="senha" type="password" autoComplete="current-password" required /></div>
            <div className="field"><label htmlFor="confirmacao">Digite EXCLUIR para confirmar</label><input id="confirmacao" name="confirmacao" required autoComplete="off" /></div>
            <button className="btn danger small" type="submit">Excluir minha conta definitivamente</button>
          </form>
        </details>
      )}
    </section>
    <form action={logout} className="card row" style={{ maxWidth: 520, justifyContent: "space-between" }}>
      <span>Conectado como <strong>{user.email}</strong></span>
      <button className="btn ghost small" type="submit">Sair da conta</button>
    </form>
    </div>
  );
}
