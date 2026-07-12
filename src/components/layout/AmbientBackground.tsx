import { AiAmbient } from "@/components/ui/AiAmbient";

/**
 * Fundo ambiental vivo da plataforma: base grafite verde-petróleo, grade técnica
 * quase imperceptível, auroras difusas em movimento muito lento e uma malha de
 * IA. Fixo atrás de todo o conteúdo, decorativo (aria-hidden, sem interação).
 * O movimento anima apenas transform/opacity e é desligado por reduced-motion.
 */
export function AmbientBackground() {
  return (
    <div
      className="ambient-base pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 tech-grid opacity-70" />

      <div
        className="aurora aurora-drift-a"
        style={{
          top: "-18%",
          right: "-8%",
          width: "48rem",
          height: "48rem",
          background:
            "radial-gradient(circle, rgba(78,197,224,0.16), transparent 62%)",
        }}
      />
      <div
        className="aurora aurora-drift-b"
        style={{
          bottom: "-22%",
          left: "-10%",
          width: "44rem",
          height: "44rem",
          background:
            "radial-gradient(circle, rgba(174,157,244,0.11), transparent 62%)",
        }}
      />
      <div
        className="aurora aurora-drift-a"
        style={{
          top: "38%",
          left: "40%",
          width: "34rem",
          height: "34rem",
          background:
            "radial-gradient(circle, rgba(70,120,175,0.08), transparent 60%)",
          animationDelay: "-12s",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-[46vh] opacity-60">
        <AiAmbient />
      </div>
    </div>
  );
}
