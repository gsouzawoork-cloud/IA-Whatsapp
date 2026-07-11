import type { SiteConfig } from "@/types/site";

/**
 * Fonte única de verdade do conteúdo institucional e dos metadados.
 *
 * Mantido em um único lugar para evitar espalhar textos por vários componentes.
 * Consumido por `src/app/layout.tsx` (metadados) e pela página institucional.
 */
export const siteConfig: SiteConfig = {
  name: "IA WhatsApp",
  tagline:
    "A central inteligente de atendimento da sua empresa, conectada ao WhatsApp.",
  description:
    "Plataforma SaaS multiempresa onde a inteligência artificial atende clientes pelo WhatsApp, organiza solicitações e apoia a operação — com controle humano e módulos que se adaptam ao seu negócio.",
  phase: "Fase de fundação — arquitetura e documentação",
  pillars: [
    {
      title: "Atendimento com IA",
      description:
        "A IA interpreta as conversas, consulta informações oficiais da empresa e responde ao cliente. Quando necessário, transfere para um atendente humano.",
    },
    {
      title: "Operação centralizada",
      description:
        "Sua equipe acompanha conversas, assume atendimentos, pausa ou devolve para a IA e conduz a operação sem precisar operar pelo WhatsApp.",
    },
    {
      title: "Módulos adaptáveis",
      description:
        "Atendimento é o núcleo. Pedidos, catálogo, agenda, orçamentos e outros recursos são módulos opcionais, habilitados conforme o negócio.",
    },
  ],
} as const;
