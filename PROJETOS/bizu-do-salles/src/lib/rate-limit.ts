// Limite de tentativas em memória (janela deslizante). Suficiente para 1 servidor;
// com vários servidores, trocar por Redis/Upstash mantendo a mesma função.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  return true;
}
