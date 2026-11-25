/** Codezy logo with a soft ember glow behind it. Swap /public/codezy-logo.svg to change the artwork. */
export function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <span className="logo-wrap">
      <span className="logo-glow" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/codezy-logo.svg" alt="Codezy" className={`relative ${className}`} />
    </span>
  );
}
