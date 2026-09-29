import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="topbar">
      <div className="container">
        <Link href="/" className="logo">Bizu do <b>Salles</b></Link>
      </div>
    </header>
  );
}
