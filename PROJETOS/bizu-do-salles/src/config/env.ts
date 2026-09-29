import { z } from "zod";

/** Única leitura de variáveis de ambiente. Segredos nunca vão para o frontend. */
const schema = z.object({
  DATABASE_URL: z.string().url(),
  APP_NAME: z.string().default("Bizu do Salles"),
  SUPPORT_EMAIL: z.string().email().optional(),
  SUPPORT_WHATSAPP: z.string().optional(),
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof schema>;
export const loadEnv = (src: NodeJS.ProcessEnv = process.env): Env => schema.parse(src);
