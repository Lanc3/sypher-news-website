export function CrtOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.07] motion-reduce:opacity-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.35)_3px)]"
    />
  );
}
