/**
 * 📄 O QUE É: ENVIO DE E-MAIL (via Resend). Sem RESEND_API_KEY no .env, nada é enviado
 *   e o sistema segue funcionando (links de senha podem ser gerados no painel).
 * ✏️ EDITÁVEL: configure RESEND_API_KEY e EMAIL_FROM no .env.
 * ⚠️ CUIDADO: a chave é secreta — só no .env / gerenciador de segredos.
 */
import "server-only";

export const emailEnabled = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!emailEnabled()) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
    });
    if (!r.ok) console.error("Falha ao enviar e-mail:", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("Falha ao enviar e-mail:", e);
    return false;
  }
}
