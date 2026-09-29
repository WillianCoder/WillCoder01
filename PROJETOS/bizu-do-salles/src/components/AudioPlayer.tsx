"use client";
/**
 * 📄 O QUE É: PLAYER DE ÁUDIO com velocidade (0,75× a 2×) e "continuar de onde parou" (guardado neste aparelho).
 */
import { useEffect, useRef, useState } from "react";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer({ id, src }: { id: string; src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);
  const key = `bizu-audio-${id}`;

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    try {
      const saved = Number(localStorage.getItem(key));
      if (saved > 0) a.currentTime = saved;
    } catch {}
    const save = () => { try { localStorage.setItem(key, String(Math.floor(a.currentTime))); } catch {} };
    const t = setInterval(save, 5000);
    a.addEventListener("pause", save);
    return () => { clearInterval(t); a.removeEventListener("pause", save); };
  }, [key]);

  useEffect(() => { if (ref.current) ref.current.playbackRate = speed; }, [speed]);

  return (
    <div className="card stack">
      <audio ref={ref} src={src} controls preload="metadata" style={{ width: "100%" }} />
      <div className="row" role="group" aria-label="Velocidade">
        <span className="muted">Velocidade:</span>
        {SPEEDS.map((s) => (
          <button key={s} type="button" className={`btn small ${s === speed ? "" : "ghost"}`} aria-pressed={s === speed} onClick={() => setSpeed(s)}>
            {String(s).replace(".", ",")}×
          </button>
        ))}
      </div>
      <p className="muted" style={{ fontSize: ".85rem" }}>O ponto em que você parou fica salvo neste aparelho.</p>
    </div>
  );
}
