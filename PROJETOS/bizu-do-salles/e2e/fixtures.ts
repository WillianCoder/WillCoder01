import { test as base, expect } from "@playwright/test";

/**
 * Cada teste simula um visitante vindo de um endereço de internet (IP) diferente,
 * como alunos reais. Assim os limites de tentativa (proteção contra robôs) continuam
 * ativos e não se acumulam entre testes que rodam na mesma máquina.
 */
const octet = () => Math.floor(Math.random() * 250) + 1;
export const test = base.extend({
  extraHTTPHeaders: async ({}, use) => {
    await use({ "x-forwarded-for": `10.${octet()}.${octet()}.${octet()}` });
  },
});
export { expect };
export type { Page } from "@playwright/test";
