/**
 * 📄 O QUE É: REGRAS DA BIBLIOTECA — formatação segura dos resumos e validação de links.
 *   Formato do texto (simples, sem HTML):
 *     "## Título"  → subtítulo
 *     "- item"     → item de lista
 *     linha vazia  → novo parágrafo
 *     **negrito**  → destaque
 * ⚠️ CUIDADO: o texto nunca vira HTML direto (evita código malicioso). Coberto por testes.
 */
export type Block = { t: "h"; text: string } | { t: "p"; text: string } | { t: "ul"; items: string[] };

export function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ t: "p", text: para.join(" ") });
    if (list.length) blocks.push({ t: "ul", items: list });
    para = [];
    list = [];
  };
  for (const raw of body.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith("## ")) { flush(); blocks.push({ t: "h", text: line.slice(3).trim() }); continue; }
    if (/^[-•] /.test(line)) { if (para.length) { blocks.push({ t: "p", text: para.join(" ") }); para = []; } list.push(line.slice(2).trim()); continue; }
    if (list.length) { blocks.push({ t: "ul", items: list }); list = []; }
    para.push(line);
  }
  flush();
  return blocks;
}

/** Divide o texto em trechos normais e **negrito**, para renderizar sem HTML. */
export function splitBold(text: string): { b: boolean; s: string }[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((s) => (s.startsWith("**") && s.endsWith("**") && s.length > 4 ? { b: true, s: s.slice(2, -2) } : { b: false, s }));
}

/** Só aceita endereços https:// completos (sem javascript:, data:, http inseguro etc.). */
export function isSafeUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.username && !u.password && url.length <= 1000;
  } catch {
    return false;
  }
}
