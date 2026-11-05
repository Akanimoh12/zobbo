"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Check, Copy, QrCode } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { TipForm } from "@/components/TipForm";
import { TipWall } from "@/components/TipWall";
import { useProfile } from "@/lib/hooks";
import { TOKEN_SYMBOL, appUrl, formatAmount } from "@/lib/format";

export default function CreatorPage() {
  const handle = decodeURIComponent(String(useParams().handle)).toLowerCase();
  const { profile, reload } = useProfile(handle);
  const [refresh, setRefresh] = useState(0);
  const [copied, setCopied] = useState(false);

  if (profile === undefined) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-12">
        <div className="card h-40 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card h-96 animate-pulse" />
          <div className="card h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-28 text-center">
        <Avatar seed={handle} size={72} />
        <h1 className="mt-6 text-3xl font-semibold">@{handle}</h1>
        <p className="mt-2 text-mute">This handle hasn&apos;t been claimed.</p>
        <Link href={`/create?handle=${handle}`} className="btn-lime mt-8 h-12 px-7">
          Claim it <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <section className="card relative overflow-hidden p-7 sm:p-9">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lime-400/10 blur-[80px]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar seed={profile.handle} size={88} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-3xl font-semibold tracking-tight">{profile.display_name}</h1>
            <p className="font-mono text-mute">@{profile.handle}</p>
            {profile.bio && <p className="mt-3 max-w-xl text-fg/80">{profile.bio}</p>}
          </div>
          <div className="flex gap-2">
            <button
              className="btn-ghost"
              onClick={() => {
                navigator.clipboard.writeText(`${appUrl()}/${profile.handle}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
            >
              {copied ? <Check className="h-4 w-4 text-lime-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <Link href={`/${profile.handle}/qr`} className="btn-ghost" aria-label="QR card">
              <QrCode className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <dl className="relative mt-8 grid grid-cols-2 gap-6 border-t border-white/[0.07] pt-6 sm:max-w-sm">
          <div>
            <dd className="text-2xl font-semibold">
              {formatAmount(profile.total_received)}{" "}
              <span className="text-base font-normal text-mute">{TOKEN_SYMBOL}</span>
            </dd>
            <dt className="mt-1 text-sm text-mute">Received</dt>
          </div>
          <div>
            <dd className="text-2xl font-semibold">{profile.tip_count}</dd>
            <dt className="mt-1 text-sm text-mute">Tips</dt>
          </div>
        </dl>
      </section>

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[400px_1fr]">
        <TipForm
          handle={profile.handle}
          owner={profile.owner}
          onSent={() => {
            reload();
            setTimeout(() => setRefresh((n) => n + 1), 4000);
          }}
        />
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-mute">Wall</h2>
          <TipWall handle={profile.handle} refreshKey={refresh} />
        </div>
      </div>
    </div>
  );
}
