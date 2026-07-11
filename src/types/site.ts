/**
 * Tipos compartilhados da camada de apresentação institucional.
 *
 * Esta fase (fundação) possui apenas uma página institucional. Os tipos aqui
 * descrevem o conteúdo estático apresentado, mantendo textos centralizados e
 * fora dos componentes visuais.
 */

/** Um pilar de valor exibido na página institucional. */
export interface Pillar {
  readonly title: string;
  readonly description: string;
}

/** Configuração institucional e de metadados do site. */
export interface SiteConfig {
  /** Nome provisório do produto. */
  readonly name: string;
  /** Frase principal (hero). */
  readonly tagline: string;
  /** Descrição curta usada em texto e metadados. */
  readonly description: string;
  /** Fase atual do projeto, exibida de forma discreta. */
  readonly phase: string;
  /** Pilares de valor. */
  readonly pillars: readonly Pillar[];
}
