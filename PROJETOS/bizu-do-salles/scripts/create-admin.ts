// Cria (ou promove) o administrador. Uso:
//   npm run admin:create -- email@exemplo.com "Seu Nome"
// A senha é pedida no terminal (não fica no histórico).
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import { createInterface } from "node:readline/promises";

const [email, name = "Administrador"] = process.argv.slice(2);
if (!email) { console.error('Uso: npm run admin:create -- email@exemplo.com "Seu Nome"'); process.exit(1); }

const db = new PrismaClient();

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const password = process.env.ADMIN_PASSWORD ?? (await rl.question("Senha (mínimo 12 caracteres): "));
  rl.close();
  if (password.length < 12) { console.error("Senha muito curta."); process.exit(1); }
  const now = new Date();
  const user = await db.user.upsert({
    where: { email: email.toLowerCase() },
    update: { role: "ADMIN", passwordHash: await hash(password) },
    create: { email: email.toLowerCase(), name, role: "ADMIN", passwordHash: await hash(password), stateCode: "SP", termsAcceptedAt: now, privacyAcceptedAt: now },
  });
  console.log(`Administrador pronto: ${user.email}`);
  await db.$disconnect();
}

main();
