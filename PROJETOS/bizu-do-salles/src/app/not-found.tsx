import Link from "next/link";
export default function NotFound() {
  return <main className="container" style={{ padding: "4rem 16px" }}><h1>Página não encontrada</h1><Link href="/">Voltar ao início</Link></main>;
}
