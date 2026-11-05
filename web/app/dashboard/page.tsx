"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, ExternalLink, QrCode, Wallet } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { TipWall } from "@/components/TipWall";
import { WalletButton } from "@/components/WalletButton";
import { useMyHandle, useProfile } from "@/lib/hooks";
import { TOKEN_SYMBOL, appUrl, formatAmount, fromUnits } from "@/lib/format";
import { useWallet } from "@/lib/wallet";

export default function Dashboard() {
  const { address } = useWallet();
  const handle = useMyHandle(address);
  const { profile } = useProfile(handle ?? null);
  const [copied, setCopied] = useState(false);

  if (!address) {
    return (
      <Centered icon={<Wallet className="h-6 w-6" />} title="Connect your wallet">
        <WalletButton className="mt-6 h-12 px-7" />
      </Centered>
    );
  }

  if (handle === undefined || (handle && profile === undefined)) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-5 py-12">
        <div className="card h-32 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!handle || !profile) {
    return (
      <Centered icon={<Avatar seed="z" size={56} />} title="No handle yet">
        <Link href="/create" className="btn-lime mt-6 h-12 px-7">
          Claim your handle <ArrowRight className="h-4 w-4" />
        </Link>
      </Centered>
    );
  }

  const url = `${appUrl()}/${profile.handle}`;
  const avg = profile.tip_count ? fromUnits(profile.total_received) / profile.tip_count : 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar seed={profile.handle} size={56} />
          <div>
            <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
            <p className="font-mono text-sm text-mute">@{profile.handle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/${profile.handle}`} className="btn-ghost">
            <ExternalLink className="h-4 w-4" /> View page
          </Link>
          <Link href={`/${profile.handle}/qr`} className="btn-lime">
            <QrCode className="h-4 w-4" /> QR card
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Received" value={formatAmount(profile.total_received)} unit={TOKEN_SYMBOL} accent />
        <Stat label="Tips" value={String(profile.tip_count)} />
        <Stat label="Average" value={avg.toLocaleString(undefined, { maximumFractionDigits: 2 })} unit={TOKEN_SYMBOL} />
      </div>

      <div className="card mt-4 flex items-center justify-between gap-4 p-4 pl-6">
        <span className="min-w-0 truncate font-mono text-sm text-mute">{url}</span>
        <button
          className="btn-ghost shrink-0"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          {copied ? <Check className="h-4 w-4 text-lime-400" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <h2 className="mb-4 mt-10 text-sm font-medium uppercase tracking-wider text-mute">Recent tips</h2>
      <TipWall handle={profile.handle} />
    </div>
  );
}

function Stat({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-mute">{label}</p>
      <p className={`mt-3 text-4xl font-semibold tracking-tight ${accent ? "text-lime-400" : ""}`}>
        {value}
        {unit && <span className="ml-2 text-base font-normal text-mute">{unit}</span>}
      </p>
    </div>
  );
}

function Centered({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-28 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05] text-mute">{icon}</span>
      <h1 className="mt-6 text-3xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}
