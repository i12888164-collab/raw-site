export default function GrainOverlay() {
  return (
    <svg className="grain-overlay" aria-hidden="true">
      <filter id="grainFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grainFilter)" />
    </svg>
  );
}
