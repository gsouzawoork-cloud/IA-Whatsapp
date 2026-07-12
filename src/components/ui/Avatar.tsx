/**
 * Avatar tipográfico (iniciais). A cor é derivada deterministicamente do nome,
 * dando identidade estável a cada cliente/operador sem imagens externas.
 */

const PALETTE: readonly string[] = [
  "from-emerald-500/25 to-emerald-500/5 text-emerald-200",
  "from-sky-500/25 to-sky-500/5 text-sky-200",
  "from-violet-500/25 to-violet-500/5 text-violet-200",
  "from-amber-500/25 to-amber-500/5 text-amber-200",
  "from-rose-500/25 to-rose-500/5 text-rose-200",
  "from-teal-500/25 to-teal-500/5 text-teal-200",
];

const SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

function paletteFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length] ?? PALETTE[0]!;
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-gradient-to-b font-bold ${paletteFor(
        name,
      )} ${SIZES[size]}`}
    >
      {initials(name)}
    </span>
  );
}
