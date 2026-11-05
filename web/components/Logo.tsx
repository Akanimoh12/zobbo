const CELLS: [number, number][] = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  [3, 1], [1, 3],
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
];

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1A1C25" />
          <stop offset="1" stopColor="#0A0B0F" />
        </linearGradient>
        <linearGradient id="lm-lime" x1="76" y1="76" x2="436" y2="436" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E4FF8A" />
          <stop offset="1" stopColor="#B7F52A" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="url(#lm-bg)" />
      <rect x="1.5" y="1.5" width="509" height="509" rx="126.5" stroke="#fff" strokeOpacity=".1" strokeWidth="3" />
      <g fill="url(#lm-lime)">
        {CELLS.map(([c, r]) => (
          <rect key={`${c}${r}`} x={76 + c * 74} y={76 + r * 74} width="64" height="64" rx="20" />
        ))}
        <circle cx={76 + 2 * 74 + 32} cy={76 + 2 * 74 + 32} r="32" />
      </g>
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="text-[22px] font-semibold leading-none tracking-tight text-fg">zobbo</span>
    </span>
  );
}
