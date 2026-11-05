"use client";

import { useState } from "react";
import { Check, Loader2, Send, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { PRESETS, TOKEN_SYMBOL, friendlyError, toUnits } from "@/lib/format";
import { isConfigured, tip } from "@/lib/zobbo";

export function TipForm({
  handle,
  owner,
  onSent,
}: {
  handle: string;
  owner: string;
  onSent: () => void;
}) {
  const { address, connect } = useWallet();
  const [preset, setPreset] = useState<number | null>(PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const amount = custom ? parseFloat(custom) : preset ?? 0;
  const valid = amount > 0 && isFinite(amount);
  const isOwner = address === owner;

  async function submit() {
    setError("");
    try {
      if (!address) return await connect();
      setBusy(true);
      await tip(address, handle, toUnits(amount), message.trim());
      setDone(true);
      setMessage("");
      onSent();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card flex flex-col items-center p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-ink-950">
          <Check className="h-7 w-7" strokeWidth={3} />
        </span>
        <h3 className="mt-5 text-xl font-semibold">Tip sent</h3>
        <p className="mt-1 text-mute">
          {amount} {TOKEN_SYMBOL} is on its way to @{handle}.
        </p>
        <button className="btn-ghost mt-6" onClick={() => setDone(false)}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p) => {
          const on = !custom && preset === p;
          return (
            <button
              key={p}
              onClick={() => {
                setPreset(p);
                setCustom("");
              }}
              className={`rounded-2xl border py-3.5 text-center transition ${
                on
                  ? "border-lime-400/70 bg-lime-400/10 text-lime-400"
                  : "border-white/10 bg-ink-800 hover:border-white/20"
              }`}
            >
              <span className="text-lg font-semibold">{p}</span>
              <span className="ml-1 text-xs opacity-70">{TOKEN_SYMBOL}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-3">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            setPreset(null);
          }}
          placeholder="Custom amount"
          className="input pr-16"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-mute">
          {TOKEN_SYMBOL}
        </span>
      </div>

      <div className="relative mt-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 140))}
          rows={3}
          placeholder="Add a message (optional)"
          className="input h-auto resize-none py-3"
        />
        <span className="absolute bottom-3 right-4 text-xs text-mute/70">{message.length}/140</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {!isConfigured && (
        <p className="mt-3 text-sm text-amber-300">Contract not configured. Run contracts/deploy.sh.</p>
      )}

      <button
        onClick={submit}
        disabled={busy || isOwner || (!!address && (!valid || !isConfigured))}
        className="btn-lime mt-4 h-13 w-full py-3.5 text-base"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : address ? (
          <Send className="h-4 w-4" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isOwner
          ? "This is your page"
          : address
          ? busy
            ? "Confirm in wallet"
            : `Tip ${valid ? amount : ""} ${TOKEN_SYMBOL}`
          : "Connect wallet to tip"}
      </button>
    </div>
  );
}
