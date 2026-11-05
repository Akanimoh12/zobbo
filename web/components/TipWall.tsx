"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getTipEvents, TipEvent } from "@/lib/events";
import { TOKEN_SYMBOL, formatAmount, shortAddr, timeAgo } from "@/lib/format";
import { Avatar } from "./Avatar";

export function TipWall({
  handle,
  refreshKey = 0,
  limit = 20,
}: {
  handle: string;
  refreshKey?: number;
  limit?: number;
}) {
  const [tips, setTips] = useState<TipEvent[] | null>(null);

  useEffect(() => {
    let live = true;
    const load = () =>
      getTipEvents(handle)
        .then((t) => live && setTips(t))
        .catch(() => live && setTips([]));
    load();
    const id = setInterval(load, 15000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, [handle, refreshKey]);

  if (!tips) {
    return (
      <ul className="space-y-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="card h-[72px] animate-pulse" />
        ))}
      </ul>
    );
  }

  if (tips.length === 0) {
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-mute">
          <MessageCircle className="h-5 w-5" />
        </span>
        <p className="mt-4 font-medium">No tips yet</p>
        <p className="mt-1 text-sm text-mute">Be the first to leave a message.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tips.slice(0, limit).map((t) => (
        <li key={t.id} className="card flex gap-3.5 p-4">
          <Avatar seed={t.from} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm text-mute">{shortAddr(t.from)}</span>
              <span className="text-xs text-mute/70">{timeAgo(t.at)}</span>
            </div>
            <p className="mt-0.5 font-semibold text-lime-400">
              {formatAmount(t.amount)} {TOKEN_SYMBOL}
            </p>
            {t.message && <p className="mt-1.5 break-words text-[15px] text-fg/90">{t.message}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
