import { TextPage } from "@/components/TextPage";

export const metadata = { title: "Termos de uso" };

// MODELO: revise com um advogado antes de vender. Edite o texto livremente.
export default function Termos() {
  return (
    <TextPage title="Termos de uso">
      <p className="alert">Versão modelo — revisar com assessoria jurídica antes do lançamento comercial.</p>
      <h2>1. O serviço</h2><p>O Bizu do Salles oferece questões comentadas, desempenho e materiais de estudo. Não é vinculado a nenhuma instituição policial nem garante aprovação.</p>
      <h2>2. Conta</h2><p>A conta é pessoal e intransferível. Por segurança, ela fica conectada em um aparelho por vez; um novo acesso encerra o anterior.</p>
      <h2>3. Planos e pagamento</h2><p>O acesso pago é liberado após a confirmação do pagamento e vale pelo período do plano contratado. Direito de arrependimento em até 7 dias da compra (CDC, art. 49).</p>
      <h2>4. Conteúdo</h2><p>As questões e explicações são de autoria do Bizu do Salles, elaboradas a partir de textos legais oficiais. É proibido copiar, revender ou redistribuir o conteúdo.</p>
      <h2>5. Conduta</h2><p>Contas usadas para compartilhamento, cópia em massa ou fraude podem ser bloqueadas.</p>
    </TextPage>
  );
}
