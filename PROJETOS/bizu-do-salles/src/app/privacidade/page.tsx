/**
 * 📄 O QUE É: POLÍTICA DE PRIVACIDADE / LGPD (endereço /privacidade).
 * ✏️ EDITÁVEL: Todo o texto entre as tags <p>…</p> e <h2>…</h2> pode ser reescrito.
 * ⚠️ CUIDADO: Revise com um advogado antes de vender.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import { TextPage } from "@/components/TextPage";

export const metadata = { title: "Política de privacidade" };

// MODELO LGPD: revise com um advogado antes de vender.
export default function Privacidade() {
  return (
    <TextPage title="Política de privacidade">
      <p className="alert">Versão modelo — revisar com assessoria jurídica antes do lançamento comercial.</p>
      <h2>Dados que coletamos</h2><p>Nome, e-mail, senha (guardada apenas de forma criptografada irreversível), estado, escola (opcional) e seu histórico de respostas. Não pedimos CPF.</p>
      <h2>Para que usamos</h2><p>Para dar acesso à conta, calcular seu desempenho, gerar recomendações de estudo, controlar o plano contratado e manter a segurança (ex.: um aparelho por vez).</p>
      <h2>Compartilhamento</h2><p>Não vendemos dados. Compartilhamos apenas o necessário com prestadores (hospedagem, e-mail, pagamento). No ranking aparece só o apelido que você escolher.</p>
      <h2>Seus direitos (LGPD, art. 18)</h2><p>Você pode baixar seus dados ou excluir sua conta a qualquer momento em <strong>Configurações → Meus dados</strong>. Para correções, fale com o suporte.</p>
      <h2>Segurança</h2><p>Conexão criptografada (HTTPS), senhas com Argon2id, acesso administrativo registrado em auditoria e backups criptografados.</p>
    </TextPage>
  );
}
