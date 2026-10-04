"use client";
/**
 * 📄 O QUE É: botão "☰ Mais" da barra inferior no celular. Abre a lista completa do menu
 *             (os itens que não cabem na barra) e fecha sozinho ao trocar de página.
 * ✏️ EDITÁVEL: os itens vêm do layout (área do aluno ou painel do admin).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function MoreMenu({ items, children }: { items: { href: string; icon: string; label: string }[]; children?: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => { if (ref.current) ref.current.open = false; }, [pathname]);
  return (
    <details className="more" ref={ref}>
      <summary aria-label="Mais opções do menu"><span aria-hidden>☰</span>Mais</summary>
      <div className="more-menu" role="menu">
        {items.map((i) => (
          <Link key={i.href} href={i.href} role="menuitem"><span aria-hidden>{i.icon}</span>{i.label}</Link>
        ))}
        {children}
      </div>
    </details>
  );
}
