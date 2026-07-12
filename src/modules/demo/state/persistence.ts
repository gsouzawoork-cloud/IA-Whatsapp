/**
 * Persistência da demonstração em `localStorage`.
 *
 * Best-effort e com validação de formato: dados corrompidos ou de versão
 * incompatível são descartados em favor dos dados iniciais. Não guarda nada
 * sensível — apenas o conteúdo simulado.
 */

import { DEMO_DATA_VERSION, type DemoData } from "@/data/demo";

const STORAGE_KEY = "ia-whatsapp:demo:v1";

interface PersistedPayload {
  readonly version: number;
  readonly data: DemoData;
}

/** Validação mínima do formato antes de confiar nos dados persistidos. */
function isValidData(data: unknown): data is DemoData {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const candidate = data as Partial<DemoData>;
  return (
    typeof candidate.business === "object" &&
    Array.isArray(candidate.products) &&
    Array.isArray(candidate.customers) &&
    Array.isArray(candidate.conversations) &&
    Array.isArray(candidate.messages) &&
    Array.isArray(candidate.orders) &&
    typeof candidate.agentSettings === "object"
  );
}

/** Carrega os dados persistidos, ou `null` quando ausentes/ inválidos. */
export function loadPersistedData(): DemoData | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedPayload>;
    if (parsed.version !== DEMO_DATA_VERSION || !isValidData(parsed.data)) {
      return null;
    }
    return parsed.data;
  } catch {
    // Dado corrompido: descarta e segue com os dados iniciais.
    return null;
  }
}

/** Persiste os dados atuais. Falhas (ex.: cota) são toleradas. */
export function savePersistedData(data: DemoData): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: PersistedPayload = { version: DEMO_DATA_VERSION, data };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Persistência é opcional; sem storage a demonstração roda só na sessão.
  }
}

/** Remove os dados persistidos (usado ao restaurar a demonstração). */
export function clearPersistedData(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignorado: sem storage não há o que limpar.
  }
}
