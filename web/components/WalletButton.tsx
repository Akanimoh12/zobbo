"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Loader2, LogOut, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { shortAddr } from "@/lib/format";
import { Avatar } from "./Avatar";

export function WalletButton({ className = "" }: { className?: string }) {
  const { address, connect, disconnect } = useWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!address) {
    return (
      <div className="relative">
        <button
          className={`btn-lime ${className}`}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await connect();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not connect");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
          Connect
        </button>
        {error && (
          <p className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-ink-800 p-3 text-xs text-mute shadow-xl">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost gap-2.5 pl-2 pr-4 font-mono text-[13px]"
      >
        <Avatar seed={address} size={28} />
        {shortAddr(address)}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-1.5 shadow-2xl">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.06]"
          >
            <LayoutDashboard className="h-4 w-4 text-mute" /> Dashboard
          </Link>
          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/[0.06]"
          >
            <LogOut className="h-4 w-4 text-mute" /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
