/**
 * 📄 O QUE É: LEITOR DE PLANILHA CSV (formato "CSV separado por ponto e vírgula" do Excel em português).
 *   Aceita aspas, ponto e vírgula/quebra de linha dentro de aspas, e o BOM que o Excel coloca no início.
 * ⚠️ CUIDADO: coberto por testes (npm test).
 */
export function parseCsv(text: string, sep?: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const d = sep ?? (firstLine.split(";").length >= firstLine.split(",").length ? ";" : ",");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === "") quoted = true;
    else if (c === d) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows.map((r) => r.map((x) => x.trim()));
}

/** Converte linhas em objetos usando a primeira linha como cabeçalho (nomes em minúsculas, sem acento). */
export function csvToObjects(text: string) {
  const [header, ...rows] = parseCsv(text);
  if (!header) return [];
  const keys = header.map((h) => h.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim());
  return rows.map((r, i) => ({ line: i + 2, data: Object.fromEntries(keys.map((k, j) => [k, r[j] ?? ""])) as Record<string, string> }));
}
