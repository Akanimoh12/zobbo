"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Check, Loader2, Wallet, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useWallet } from "@/lib/wallet";
import { useMyHandle } from "@/lib/hooks";
import { friendlyError } from "@/lib/format";
import { getProfile, isConfigured, register } from "@/lib/zobbo";

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

function CreateForm() {
  const router = useRouter();
  const { address, connect } = useWallet();
  const mine = useMyHandle(address);

  const [handle, setHandle] = useState(useSearchParams().get("handle") ?? "");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avail, setAvail] = useState<"idle" | "checking" | "free" | "taken">("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const validHandle = HANDLE_RE.test(handle);

  useEffect(() => {
    if (!validHandle) return setAvail("idle");
    setAvail("checking");
    let live = true;
    const t = setTimeout(async () => {
      const p = await getProfile(handle);
      if (live) setAvail(p ? "taken" : "free");
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [handle, validHandle]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (!address) return await connect();
      setBusy(true);
      await register(address, handle, name.trim(), bio.trim());
      router.push(`/${handle}/qr`);
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  if (mine) {
    return (
      <div className="card mx-auto flex max-w-md flex-col items-center p-10 text-center">
        <Avatar seed={mine} size={64} />
        <h2 className="mt-5 text-2xl font-semibold">You&apos;re @{mine}</h2>
        <p className="mt-1 text-mute">One handle per wallet.</p>
        <Link href="/dashboard" className="btn-lime mt-7">
          Go to dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const ready = validHandle && avail === "free" && name.trim().length > 0;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="card space-y-6 p-7 sm:p-9">
        <div>
          <label className="label" htmlFor="handle">
            Handle
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-mute">
              @
            </span>
            <input
              id="handle"
              className="input pl-9 pr-11 font-mono"
              value={handle}
              maxLength={20}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="yourname"
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              {avail === "checking" && <Loader2 className="h-4 w-4 animate-spin text-mute" />}
              {avail === "free" && <Check className="h-4 w-4 text-lime-400" strokeWidth={3} />}
              {avail === "taken" && <X className="h-4 w-4 text-red-400" strokeWidth={3} />}
            </span>
          </div>
          <p className="mt-2 text-xs text-mute">
            {avail === "taken"
              ? "Already taken."
              : handle && !validHandle
              ? "3–20 characters: a–z, 0–9, underscore."
              : "Lowercase letters, numbers and underscore."}
          </p>
        </div>

        <div>
          <label className="label" htmlFor="name">
            Display name
          </label>
          <input
            id="name"
            className="input"
            value={name}
            maxLength={50}
            placeholder="Tobi Beats"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="bio">
            Bio <span className="normal-case text-mute/60">(optional)</span>
          </label>
          <textarea
            id="bio"
            rows={3}
            maxLength={160}
            className="input h-auto resize-none py-3"
            value={bio}
            placeholder="Producer from Lagos."
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}
        {!isConfigured && (
          <p className="flex items-center gap-2 text-sm text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" /> Contract not configured. Run contracts/deploy.sh.
          </p>
        )}

        <button
          type="submit"
          disabled={busy || (!!address && (!ready || !isConfigured))}
          className="btn-lime h-12 w-full text-base"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Confirm in wallet
            </>
          ) : address ? (
            <>
              Claim @{handle || "handle"} <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" /> Connect wallet
            </>
          )}
        </button>
      </form>

      <aside className="card hidden p-7 lg:block">
        <p className="label">Preview</p>
        <div className="mt-4 flex items-center gap-3">
          <Avatar seed={handle || "z"} size={52} />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{name || "Your name"}</p>
            <p className="truncate font-mono text-sm text-mute">@{handle || "handle"}</p>
          </div>
        </div>
        <p className="mt-4 min-h-[3rem] text-sm text-fg/70">{bio || "Your bio appears here."}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[1, 5, 10].map((n) => (
            <div key={n} className="rounded-xl border border-white/10 bg-ink-800 py-2.5 text-center text-sm font-semibold">
              {n}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">Claim your handle</h1>
      <Suspense>
        <CreateForm />
      </Suspense>
    </div>
  );
}
