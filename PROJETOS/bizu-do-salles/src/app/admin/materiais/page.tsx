/**
 * 📄 O QUE É: LISTA DE MATERIAIS no painel (endereço /admin/materiais).
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { KIND_NAME } from "@/lib/materials";
import { CYCLE_NAME } from "@/lib/format";

export const metadata = { title: "Materiais" };

export default async function AdminMateriais() {
  const items = await db.material.findMany({ include: { subject: true }, orderBy: { updatedAt: "desc" }, take: 300 });
  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}><h1>📖 Materiais ({items.length})</h1><Link className="btn" href="/admin/materiais/novo">+ Novo material</Link></div>
      <p className="muted">Resumos são escritos aqui mesmo. Áudios e PDFs: hospede o arquivo em um serviço com link https (ex.: Google Drive público, Cloudflare R2) e cole o link. Só publique conteúdo próprio ou autorizado.</p>
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Título</th><th>Tipo</th><th>Ciclo / disciplina</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} className="muted">Nenhum material ainda.</td></tr>}
            {items.map((m) => (
              <tr key={m.id}>
                <td><Link href={`/admin/materiais/${m.id}`}>{m.title}</Link>{m.stateCode && <> <span className="badge">{m.stateCode}</span></>}</td>
                <td>{KIND_NAME[m.kind] ?? m.kind}</td>
                <td>{m.cycle ? CYCLE_NAME[m.cycle] : "Geral"}{m.subject ? ` · ${m.subject.name}` : ""}</td>
                <td>{m.published ? "Publicado" : "Rascunho"}{m.free && <> · <span className="badge">Grátis</span></>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
