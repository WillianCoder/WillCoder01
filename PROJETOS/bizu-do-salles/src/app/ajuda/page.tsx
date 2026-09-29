import { TextPage } from "@/components/TextPage";
import { db } from "@/lib/db";

export const metadata = { title: "Ajuda" };
export const dynamic = "force-dynamic";

const FAQ = [
  ["Por que fui desconectado?", "Sua conta só fica ativa em um aparelho por vez. Quando alguém entra em outro aparelho, o anterior é desconectado. Se não foi você, troque a senha."],
  ["Paguei. Quando libera?", "Assim que o pagamento é confirmado. Se demorar, fale com o suporte informando o e-mail da conta."],
  ["As questões são de provas oficiais?", "Não. São questões originais do Bizu do Salles, escritas a partir da lei, com o artigo de referência em cada uma."],
  ["Achei um erro em uma questão.", "Use o botão “Encontrou um problema?” embaixo da questão. A equipe revisa todos os relatos."],
  ["Como instalo no celular?", "Abra o site no navegador do celular e use “Adicionar à tela inicial”."],
];

export default async function Ajuda() {
  const s = Object.fromEntries((await db.setting.findMany({ where: { key: { in: ["support_whatsapp", "support_email"] } } })).map((x) => [x.key, String(x.value ?? "")]));
  return (
    <TextPage title="Ajuda e suporte">
      {FAQ.map(([q, a]) => <details className="card" key={q}><summary><strong>{q}</strong></summary><p>{a}</p></details>)}
      <div className="card"><h2>Fale com a gente</h2>
        <p>{s.support_whatsapp ? `WhatsApp: ${s.support_whatsapp}` : ""}{s.support_email ? ` · E-mail: ${s.support_email}` : ""}{!s.support_whatsapp && !s.support_email && "Contato em breve."}</p></div>
    </TextPage>
  );
}
