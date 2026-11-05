"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { appUrl } from "@/lib/format";
import { Avatar } from "./Avatar";
import { LogoMark } from "./Logo";

export function QrCard({ handle, name }: { handle: string; name: string }) {
  const box = useRef<HTMLDivElement>(null);
  const url = `${appUrl()}/${handle}`;

  function download() {
    const canvas = box.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `zobbo-${handle}.png`;
    a.click();
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-ink-900 p-8 text-center shadow-glow print:border-ink-950 print:shadow-none">
        <div className="absolute inset-x-0 -top-24 mx-auto h-48 w-64 rounded-full bg-lime-400/20 blur-[70px] print:hidden" />
        <div className="relative">
          <div className="flex justify-center">
            <Avatar seed={handle} size={64} />
          </div>
          <p className="mt-4 text-2xl font-semibold">{name}</p>
          <p className="font-mono text-mute">@{handle}</p>

          <div ref={box} className="mt-7 inline-block rounded-3xl bg-white p-5">
            <QRCodeCanvas value={url} size={216} level="H" fgColor="#07080B" />
          </div>

          <p className="mt-6 text-lg font-semibold">
            Scan to <span className="text-lime-400">tip</span>
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-mute">
            <LogoMark size={18} /> zobbo
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 print:hidden">
        <button onClick={download} className="btn-ghost flex-1">
          <Download className="h-4 w-4" /> PNG
        </button>
        <button onClick={() => window.print()} className="btn-lime flex-1">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>
    </div>
  );
}
