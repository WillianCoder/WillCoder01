"use client";
/**
 * 📄 O QUE É: CRONÔMETRO do simulado (roda no navegador). Ao zerar, envia a prova sozinho.
 * ⚠️ CUIDADO: o tempo real é conferido no servidor; este relógio é só a exibição.
 */
import { useEffect, useState } from "react";

export function Timer({ seconds, formId }: { seconds: number; formId: string }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const end = Date.now() + seconds * 1000;
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(t);
        (document.getElementById(formId) as HTMLFormElement | null)?.requestSubmit();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [seconds, formId]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className={`timer ${left <= 300 ? "warn" : ""}`} role="timer" aria-live={left <= 60 ? "assertive" : "off"}>
      ⏱️ {mm}:{ss} {left <= 300 && left > 0 && <small>— faltam menos de 5 minutos</small>}
    </div>
  );
}
