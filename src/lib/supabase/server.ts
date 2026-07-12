import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./types";
import { requireSupabasePublicConfig } from "./config";

/** Formato de cada cookie que o Supabase pede para gravar. */
type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Cliente Supabase para o SERVIDOR (Server Components, Server Actions e Route
 * Handlers).
 *
 * A identidade é sempre validada no servidor a partir dos cookies da sessão. Em
 * Next.js 16 `cookies()` é assíncrono, por isso esta função é `async`.
 *
 * IMPORTANTE: em Server Components a escrita de cookies pode não estar
 * disponível (contexto somente-leitura). Envolvemos `setAll` em try/catch por
 * esse motivo; a renovação efetiva da sessão acontece no middleware
 * (`updateSession`), que roda em um contexto onde a escrita é permitida.
 */
export async function createSupabaseServerClient(): Promise<TypedSupabaseClient> {
  const { url, publishableKey } = requireSupabasePublicConfig();
  const cookieStore = await cookies();

  const client = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado a partir de um Server Component: a renovação de sessão será
          // aplicada pelo middleware. Silenciar aqui é seguro e esperado.
        }
      },
    },
  });

  return client as unknown as TypedSupabaseClient;
}
