const HUES = [
  ["#CBFF4D", "#5EEAD4"],
  ["#A78BFA", "#F0ABFC"],
  ["#FDBA74", "#F87171"],
  ["#7DD3FC", "#818CF8"],
  ["#86EFAC", "#FDE047"],
];

export function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = HUES[h % HUES.length];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-ink-950"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
    >
      {seed.replace(/^@/, "").charAt(0).toUpperCase() || "?"}
    </span>
  );
}
