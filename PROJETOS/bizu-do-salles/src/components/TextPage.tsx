import { PublicHeader } from "./PublicHeader";

export function TextPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="container stack" style={{ maxWidth: 760, padding: "2rem 16px 4rem" }}>
        <h1>{title}</h1>
        {children}
      </main>
    </>
  );
}
