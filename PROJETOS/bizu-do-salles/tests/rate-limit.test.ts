import { describe, expect, it, vi } from "vitest";
import { rateLimit } from "../src/lib/rate-limit";

describe("rateLimit", () => {
  it("bloqueia depois do máximo e libera quando a janela passa", () => {
    vi.useFakeTimers();
    const key = "teste:" + Math.random();
    expect(rateLimit(key, 2, 1000)).toBe(true);
    expect(rateLimit(key, 2, 1000)).toBe(true);
    expect(rateLimit(key, 2, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 2, 1000)).toBe(true);
    vi.useRealTimers();
  });

  it("a limpeza periódica não apaga tentativas recentes", () => {
    vi.useFakeTimers();
    const key = "teste:" + Math.random();
    expect(rateLimit(key, 1, 60 * 60_000)).toBe(true);
    vi.advanceTimersByTime(30 * 60_000); // passa do intervalo de limpeza, ainda dentro da janela
    expect(rateLimit(key, 1, 60 * 60_000)).toBe(false);
    vi.useRealTimers();
  });
});
