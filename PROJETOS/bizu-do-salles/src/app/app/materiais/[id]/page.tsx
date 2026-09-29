/**
 * 📄 O QUE É: LEITURA/ESCUTA DE UM MATERIAL (endereço /app/materiais/<id>).
 * ⚠️ CUIDADO: só mostra se o aluno tiver acesso (servidor); links externos só https.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { KIND_NAME, visibleMaterialWhere } from "@/lib/materials";
import { isSafeUrl } from "@/core/material";
import { RichText } from "@/components/RichText";
import { AudioPlayer } from "@/components/AudioPlayer";
import { CYCLE_NAME } from "@/lib/format";

export const metadata = { title: "Material" };

export default async function Material({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { cycles } = await userAccess(user.id, user.role);
  const m = await db.material.findFirst({ where: { id, ...visibleMaterialWhere(user, cycles) }, include: { subject: true } });
  if (!m) notFound();
  const url = isSafeUrl(m.storageKey) ? m.storageKey : null;
  return (
    <article className="stack" style={{ maxWidth: 760 }}>
      <Link href="/app/materiais">← Materiais</Link>
      <span className="badge">{KIND_NAME[m.kind] ?? m.kind}</span>
      <h1>{m.title}</h1>
      <p className="muted">{m.cycle ? CYCLE_NAME[m.cycle] : "Geral"}{m.subject ? ` · ${m.subject.name}` : ""}</p>
      {m.kind === "audio" && url && <AudioPlayer id={m.id} src={url} />}
      {m.kind === "pdf" && url && <a className="btn" href={url} target="_blank" rel="noopener noreferrer">Abrir PDF ↗</a>}
      {m.body && <div className="card"><RichText body={m.body} /></div>}
      <p className="muted" style={{ fontSize: ".85rem" }}>Fonte: {m.sourceLicense}</p>
    </article>
  );
}
