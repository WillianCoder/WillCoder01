import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { savePreferences } from "../actions";
import { logout } from "../../auth-actions";

export const metadata = { title: "Configurações" };

export default async function Configuracoes({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  const user = await requireUser();
  const jar = await cookies();
  const { salvo } = await searchParams;
  return (
    <div className="stack">
    <form action={savePreferences} className="card stack" style={{ maxWidth: 520 }}>
      <h1>Configurações</h1>
      {salvo && <p className="alert ok">Preferências salvas.</p>}
      <div className="field"><label htmlFor="nickname">Apelido (aparece no ranking)</label><input id="nickname" name="nickname" defaultValue={user.nickname ?? ""} maxLength={30} /></div>
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
    <form action={logout} className="card row" style={{ maxWidth: 520, justifyContent: "space-between" }}>
      <span>Conectado como <strong>{user.email}</strong></span>
      <button className="btn ghost small" type="submit">Sair da conta</button>
    </form>
    </div>
  );
}
