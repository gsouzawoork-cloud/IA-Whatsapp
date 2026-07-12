import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { requireSupabasePublicConfig } from "./config";

/**
 * Cliente Supabase para o NAVEGADOR.
 *
 * Usa apenas as variáveis públicas (`NEXT_PUBLIC_*`). A sessão é gerenciada por
 * cookies pela biblioteca oficial `@supabase/ssr` — nunca guardamos tokens
 * manualmente em localStorage. Só deve ser instanciado em componentes client e
 * apenas quando o Supabase estiver configurado; o `requireSupabasePublicConfig`
 * lança de forma segura (sem expor valores) caso contrário.
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = requireSupabasePublicConfig();
  return createBrowserClient<Database>(url, publishableKey);
}
