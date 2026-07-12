/**
 * Tipos do domínio de clientes.
 *
 * Minimização de dados: nada de CPF, RG, e-mail ou informações sensíveis sem
 * necessidade. Apenas o suficiente para operar o atendimento simulado.
 */

/** Endereço autorizado de um cliente. */
export interface CustomerAddress {
  readonly id: string;
  /** Rótulo curto (ex.: "Casa", "Trabalho"). */
  readonly label: string;
  readonly street: string;
  readonly number: string;
  readonly complement?: string;
  readonly district: string;
  readonly city: string;
  readonly reference?: string;
}

/** Cliente final atendido pela empresa. */
export interface Customer {
  readonly id: string;
  readonly name: string;
  /** Telefone completo em dígitos; a apresentação mascara o número. */
  readonly phone: string;
  readonly addresses: readonly CustomerAddress[];
  readonly tags: readonly string[];
  /** Observação interna simulada, visível apenas à equipe. */
  readonly internalNote?: string;
  /** Preferências informadas ao longo do atendimento. */
  readonly preferences?: string;
  /** ISO da última interação conhecida. */
  readonly lastInteractionAt: string;
}
