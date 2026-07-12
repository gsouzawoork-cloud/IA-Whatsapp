import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabasePublicConfig } from "./config";

/** Formato de cada cookie que o Supabase pede para gravar. */
type CookieToSet = { name: string; value: string; options: CookieOptions };

/** Prefixos de rota que exigem sessão autenticada. */
const PROTECTED_PREFIXES = ["/app", "/onboarding"] as const;

/** Rotas de autenticação: usuário já logado não deveria vê-las. */
const AUTH_PREFIXES = ["/auth/login", "/auth/cadastro"] as const;

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAuthEntry(pathname: string): boolean {
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Atualiza a sessão do Supabase a cada request e aplica a proteção de rotas.
 *
 * Fluxo:
 * 1. Sem configuração do Supabase → não há autenticação; deixa passar. As rotas
 *    reais renderizam um estado de "configuração ausente" (nunca dados falsos).
 * 2. Com configuração → renova os cookies de sessão via `@supabase/ssr` e valida
 *    a identidade no servidor com `getUser()` (não confia em cookies crus).
 * 3. Redireciona não autenticados para `/auth/login` ao acessar rotas
 *    protegidas, preservando o destino em `redirectTo`.
 *
 * A autorização fina (empresa, papel, módulo) acontece nos Server Components e,
 * de forma inviolável, na RLS do banco. O middleware é apenas a primeira
 * barreira de sessão.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const config = getSupabasePublicConfig();
  const { pathname } = request.nextUrl;

  // Sem Supabase configurado: não há sessão a renovar. As páginas reais tratam
  // a ausência de configuração; a demo é pública.
  if (config === null) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    config.url,
    config.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() valida o token no servidor (não confia apenas no cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthEntry(pathname)) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/app";
    appUrl.search = "";
    return NextResponse.redirect(appUrl);
  }

  return response;
}
