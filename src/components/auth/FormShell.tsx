import type { ReactNode } from "react";

/** Cartão de formulário de autenticação (título, subtítulo e conteúdo). */
export function FormShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="panel elev-low rounded-2xl p-6">
      <h1 className="t-page-title text-xl">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-mid">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
      {footer ? <div className="mt-5 text-center text-sm text-mid">{footer}</div> : null}
    </div>
  );
}

/** Campo de texto rotulado, com estilo consistente da plataforma. */
export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required = true,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className="mb-3.5">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-mid">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-strong bg-white/[0.03] px-3 py-2 text-sm text-hi outline-none transition-colors placeholder:text-dim focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}

/** Alerta de erro (vermelho) ou aviso (neutro) do formulário. */
export function FormAlert({
  error,
  notice,
}: {
  error?: string;
  notice?: string;
}) {
  if (error) {
    return (
      <p role="alert" className="mb-3 rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-xs font-medium text-bad">
        {error}
      </p>
    );
  }
  if (notice) {
    return (
      <p className="mb-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
        {notice}
      </p>
    );
  }
  return null;
}
