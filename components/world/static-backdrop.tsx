/**
 * Fondo sin WebGL (nivel "static", carga inicial o contexto perdido):
 * gradientes + grano SVG en CSS puro. El contenido HTML sigue igual de legible.
 */
export function StaticBackdrop({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 10%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)," +
            "radial-gradient(50% 45% at 15% 80%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 70%)," +
            "var(--background)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
