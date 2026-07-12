import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware raiz: renova a sessão do Supabase e protege as rotas reais.
 * A lógica vive em `src/lib/supabase/middleware.ts` para manter este arquivo
 * mínimo (exigência de plataforma: o middleware fica na raiz do projeto).
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * Executa em tudo, exceto assets estáticos e arquivos de imagem, para não
   * pagar o custo de renovação de sessão em requisições de estáticos.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
