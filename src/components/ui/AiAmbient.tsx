/**
 * Elemento ambiental de IA: malha de nós/conexões + halo difuso, em SVG inline
 * leve. Decorativo e discreto (aria-hidden, sem interação, sem dependências).
 * Usado no header da visão geral, no estado vazio do atendimento e no painel de
 * autonomia da IA para reforçar a identidade "inteligência em operação".
 */

interface Node {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly teal?: boolean;
}

const NODES: readonly Node[] = [
  { x: 60, y: 60, r: 2.5 },
  { x: 150, y: 40, r: 2 },
  { x: 230, y: 90, r: 3, teal: true },
  { x: 320, y: 50, r: 2 },
  { x: 360, y: 130, r: 2.5 },
  { x: 270, y: 160, r: 2, teal: true },
  { x: 180, y: 140, r: 2.5 },
  { x: 95, y: 130, r: 2 },
  { x: 40, y: 175, r: 1.8 },
];

const LINKS: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [2, 6],
  [1, 7],
  [5, 2],
  [6, 8],
];

export function AiAmbient({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="ai-bloom" cx="70%" cy="20%" r="60%">
            <stop offset="0%" stopColor="rgba(114,214,173,0.22)" />
            <stop offset="100%" stopColor="rgba(114,214,173,0)" />
          </radialGradient>
          <radialGradient id="ai-bloom-2" cx="20%" cy="90%" r="55%">
            <stop offset="0%" stopColor="rgba(101,201,211,0.14)" />
            <stop offset="100%" stopColor="rgba(101,201,211,0)" />
          </radialGradient>
          <radialGradient id="ai-fade" cx="60%" cy="35%" r="75%">
            <stop offset="55%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <mask id="ai-mask">
            <rect width="400" height="200" fill="url(#ai-fade)" />
          </mask>
        </defs>

        <rect width="400" height="200" fill="url(#ai-bloom)" />
        <rect width="400" height="200" fill="url(#ai-bloom-2)" />

        <g mask="url(#ai-mask)">
          <g stroke="rgba(114,214,173,0.18)" strokeWidth="0.75">
            {LINKS.map(([a, b], i) => {
              const from = NODES[a]!;
              const to = NODES[b]!;
              return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
            })}
          </g>
          {NODES.map((node, i) => (
            <circle
              key={i}
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill={node.teal ? "rgba(101,201,211,0.7)" : "rgba(114,214,173,0.65)"}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
