export const TOKEN_SYMBOL = process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "XLM";
export const DECIMALS = 7;
export const PRESETS = TOKEN_SYMBOL === "XLM" ? [1, 5, 10] : [1, 2, 5];

export function toUnits(amount: number): bigint {
  return BigInt(Math.round(amount * 10 ** DECIMALS));
}

export function fromUnits(units: number | bigint): number {
  return Number(units) / 10 ** DECIMALS;
}

export function formatAmount(units: number | bigint): string {
  const v = fromUnits(units);
  return v.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function shortAddr(addr: string, n = 4): string {
  return addr.length > n * 2 + 1 ? `${addr.slice(0, n)}…${addr.slice(-n)}` : addr;
}

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function appUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/HostError.*Error\(Contract, #2\)/.test(msg)) return "That handle is already taken.";
  if (/Error\(Contract, #3\)/.test(msg)) return "This wallet already has a handle.";
  if (/Error\(Contract, #7\)/.test(msg)) return "You can't tip yourself.";
  if (/Error\(Contract, #1\)/.test(msg)) return "Invalid handle.";
  if (/User declined|rejected|denied/i.test(msg)) return "Request cancelled.";
  if (/insufficient|underfunded|balance/i.test(msg)) return "Not enough balance in your wallet.";
  return msg.length > 140 ? "Something went wrong. Please try again." : msg;
}
