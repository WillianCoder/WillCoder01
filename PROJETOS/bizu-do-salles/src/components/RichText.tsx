/**
 * 📄 O QUE É: EXIBE O TEXTO DOS RESUMOS com subtítulos, listas e negrito — sem usar HTML do banco (seguro).
 */
import { parseBody, splitBold } from "@/core/material";

function Inline({ text }: { text: string }) {
  return <>{splitBold(text).map((p, i) => (p.b ? <strong key={i}>{p.s}</strong> : <span key={i}>{p.s}</span>))}</>;
}

export function RichText({ body }: { body: string }) {
  return (
    <div className="stack">
      {parseBody(body).map((b, i) =>
        b.t === "h" ? <h2 key={i}>{b.text}</h2> : b.t === "ul" ? <ul key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ul> : <p key={i}><Inline text={b.text} /></p>,
      )}
    </div>
  );
}
