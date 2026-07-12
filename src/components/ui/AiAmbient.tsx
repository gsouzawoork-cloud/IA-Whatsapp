/**
 * Elemento ambiental de IA: fluxo abstrato de sinais/dados (ondas suaves e
 * partículas), em SVG inline leve. Linguagem de processamento/atividade — não
 * usa nós grandes conectados que possam lembrar campo ou tática esportiva.
 * Decorativo e discreto (aria-hidden, sem interação, sem dependências).
 */

const STREAMS: readonly { d: string; color: string; width: number; opacity: number }[] = [
  {
    d: "M-20,58 C60,30 130,86 210,54 C280,26 340,72 420,44",
    color: "rgba(78,197,224,0.9)",
    width: 1.1,
    opacity: 0.5,
  },
  {
    d: "M-20,104 C70,132 140,74 220,108 C300,140 350,96 420,120",
    color: "rgba(142,166,255,0.9)",
    width: 1,
    opacity: 0.42,
  },
  {
    d: "M-20,150 C80,120 150,168 240,138 C310,116 360,150 420,132",
    color: "rgba(174,157,244,0.85)",
    width: 0.9,
    opacity: 0.34,
  },
  {
    d: "M-20,28 C90,44 160,10 250,30 C320,46 370,20 420,34",
    color: "rgba(78,197,224,0.6)",
    width: 0.8,
    opacity: 0.3,
  },
];

const PARTICLES: readonly { x: number; y: number; r: number; teal?: boolean }[] = [
  { x: 210, y: 54, r: 2, teal: true },
  { x: 220, y: 108, r: 1.8 },
  { x: 240, y: 138, r: 1.6 },
  { x: 90, y: 41, r: 1.5, teal: true },
  { x: 340, y: 72, r: 1.6 },
  { x: 150, y: 168, r: 1.4 },
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
          <radialGradient id="ai-bloom" cx="72%" cy="18%" r="62%">
            <stop offset="0%" stopColor="rgba(78,197,224,0.18)" />
            <stop offset="100%" stopColor="rgba(78,197,224,0)" />
          </radialGradient>
          <radialGradient id="ai-bloom-2" cx="22%" cy="92%" r="55%">
            <stop offset="0%" stopColor="rgba(174,157,244,0.12)" />
            <stop offset="100%" stopColor="rgba(174,157,244,0)" />
          </radialGradient>
          <radialGradient id="ai-fade" cx="62%" cy="35%" r="78%">
            <stop offset="55%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <mask id="ai-mask">
            <rect width="400" height="200" fill="url(#ai-fade)" />
          </mask>
        </defs>

        <rect width="400" height="200" fill="url(#ai-bloom)" />
        <rect width="400" height="200" fill="url(#ai-bloom-2)" />

        <g mask="url(#ai-mask)" fill="none" strokeLinecap="round">
          {STREAMS.map((stream, i) => (
            <path
              key={i}
              d={stream.d}
              stroke={stream.color}
              strokeWidth={stream.width}
              opacity={stream.opacity}
            />
          ))}
          {PARTICLES.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill={p.teal ? "rgba(78,197,224,0.75)" : "rgba(142,166,255,0.6)"}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
