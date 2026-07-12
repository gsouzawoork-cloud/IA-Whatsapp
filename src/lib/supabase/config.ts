/**
 * Guarda de configuração do Supabase.
 *
 * Nesta fase o projeto precisa continuar compilando e rodando o modo
 * demonstração mesmo SEM credenciais reais. Este módulo centraliza a leitura das
 * variáveis públicas e expõe uma verificação determinística de "está
 * configurado?". Nunca lê segredos (service role, senha do banco, JWT secret):
 * apenas as variáveis `NEXT_PUBLIC_*`, que são as únicas que podem chegar ao
 * cliente.
 *
 * Regra de ouro: se as variáveis não existirem, o modo real deve exibir um
 * estado de "configuração ausente" — nunca dados falsos fingindo vir do banco.
 */

/** Formato validado das variáveis públicas do Supabase. */
export interface SupabasePublicConfig {
  readonly url: string;
  readonly publishableKey: string;
}

/**
 * Lê a URL do Supabase. Vazia/ausente => `null`. A leitura é feita diretamente
 * de `process.env` para que o bundler do Next inline o valor `NEXT_PUBLIC_*`.
 */
function readUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return value && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Lê a publishable key (chave pública anon/publishable). Vazia/ausente => `null`.
 * NUNCA usar a service role aqui: ela jamais pode chegar ao navegador.
 */
function readPublishableKey(): string | null {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return value && value.trim().length > 0 ? value.trim() : null;
}

/** `true` quando URL e publishable key estão presentes e não vazias. */
export function isSupabaseConfigured(): boolean {
  return readUrl() !== null && readPublishableKey() !== null;
}

/**
 * Retorna a configuração validada ou `null` quando ausente. Quem chama deve
 * tratar o `null` (estado de configuração ausente), sem inventar valores.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = readUrl();
  const publishableKey = readPublishableKey();
  if (url === null || publishableKey === null) {
    return null;
  }
  return { url, publishableKey };
}

/**
 * Igual a `getSupabasePublicConfig`, mas lança quando ausente. Use apenas em
 * caminhos que já validaram `isSupabaseConfigured()` (ex.: criação de clients
 * dentro de fluxos reais protegidos). A mensagem é segura para log — não expõe
 * valores.
 */
export function requireSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabasePublicConfig();
  if (config === null) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return config;
}

/** URL pública da aplicação, usada em redirects de e-mail de autenticação. */
export function getAppUrl(): string {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  return value && value.trim().length > 0
    ? value.trim().replace(/\/$/, "")
    : "http://localhost:3000";
}
