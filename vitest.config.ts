import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Configuração do Vitest para as regras puras de domínio e o reducer.
 * Ambiente `node` (sem DOM): testamos apenas lógica determinística.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
