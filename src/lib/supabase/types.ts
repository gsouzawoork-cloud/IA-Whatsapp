import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Tipo canônico do client Supabase tipado por `Database`.
 *
 * `createServerClient`/`createBrowserClient` inferem um generic ligeiramente
 * diferente do `SupabaseClient<Database>` padrão (particularidade da versão da
 * lib). Este alias — `SupabaseClient<Database>` — resolve corretamente tabelas e
 * colunas e é o tipo aceito pelos repositórios e pela camada de dados.
 */
export type TypedSupabaseClient = SupabaseClient<Database>;
