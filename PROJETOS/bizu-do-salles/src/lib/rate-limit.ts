// Limite de tentativas em memória (janela deslizante). Suficiente para 1 servidor;
// com vários servidores, trocar por Redis/Upstash mantendo a mesma função.
const hits = new Map<string, number[]>();

// Limpeza periódica: chaves sem uso há mais que o maior prazo possível saem da memória
// (sem isso, cada IP/e-mail que já tentou algo ficaria guardado para sempre).
const SWEEP_EVERY_MS = 10 * 60_000;
const STALE_AFTER_MS = 24 * 60 * 60_000; // bem acima da maior janela de src/config/regras.ts
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  for (const [key, list] of hits) if (!list.length || now - list[list.length - 1] > STALE_AFTER_MS) hits.delete(key);
}

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  return true;
}
