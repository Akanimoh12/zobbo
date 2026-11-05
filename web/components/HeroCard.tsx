import { QRCodeSVG } from "qrcode.react";
import { Check, Zap } from "lucide-react";
import { Avatar } from "./Avatar";

const WALL = [
  { from: "GB7K…2QXA", amt: "5", msg: "Your last set was unreal!" },
  { from: "GDM3…9PLE", amt: "2", msg: "Thanks for the playlist!" },
];

export function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <div className="absolute -inset-10 -z-10 rounded-full bg-lime-400/20 blur-[90px]" />

      <div className="card relative overflow-hidden p-6 shadow-glow">
        <div className="flex items-center gap-3">
          <Avatar seed="tobi" size={48} />
          <div>
            <p className="text-lg font-semibold leading-tight">Tobi Beats</p>
            <p className="font-mono text-sm text-mute">@tobi</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center rounded-2xl bg-white p-5">
          <QRCodeSVG value="https://zobbo.app/tobi" size={176} level="M" fgColor="#07080B" />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {["$1", "$2", "$5"].map((a, i) => (
            <div
              key={a}
              className={`rounded-xl border py-2.5 text-center text-sm font-semibold ${
                i === 1
                  ? "border-lime-400/60 bg-lime-400/10 text-lime-400"
                  : "border-white/10 bg-ink-800 text-fg"
              }`}
            >
              {a}
            </div>
          ))}
        </div>
      </div>

      <div className="card absolute -bottom-8 -right-4 w-[260px] space-y-3 p-4 shadow-2xl sm:-right-10">
        {WALL.map((t) => (
          <div key={t.from} className="flex gap-3">
            <Avatar seed={t.from} size={30} />
            <div className="min-w-0 text-[13px]">
              <p className="flex items-center gap-2">
                <span className="font-mono text-mute">{t.from}</span>
                <span className="font-semibold text-lime-400">${t.amt}</span>
              </p>
              <p className="truncate text-fg/90">{t.msg}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card absolute -left-4 top-24 hidden items-center gap-2.5 px-4 py-3 text-sm font-medium shadow-2xl sm:flex md:-left-14">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-400 text-ink-950">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        Tip sent
        <Zap className="h-4 w-4 text-lime-400" />
      </div>
    </div>
  );
}
