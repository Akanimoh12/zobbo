import Link from "next/link";
import { ArrowRight, AtSign, Coins, MessageCircle, QrCode, ShieldCheck, Zap } from "lucide-react";
import { HeroCard } from "@/components/HeroCard";

const FEATURES = [
  { icon: Zap, title: "Instant", text: "Settles in about 5 seconds." },
  { icon: ShieldCheck, title: "Non-custodial", text: "Tips go wallet to wallet. We never hold funds." },
  { icon: MessageCircle, title: "Message wall", text: "Every tip can carry a shout-out." },
];

const STEPS = [
  { icon: AtSign, title: "Claim your handle" },
  { icon: QrCode, title: "Print your QR" },
  { icon: Coins, title: "Get tipped" },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 pb-28 pt-16 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-mute">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              Live on Stellar
            </span>
            <h1 className="mt-6 text-[44px] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Tip anyone
              <br />
              with <span className="text-lime-400">one scan.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-mute">
              Claim a handle, print your QR, get paid straight to your wallet.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/create" className="btn-lime h-12 px-7 text-base">
                Claim your handle <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tobi" className="btn-ghost h-12 px-7 text-base">
                See a profile
              </Link>
            </div>
            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/[0.07] pt-8">
              {[
                ["~5s", "Settlement"],
                ["<$0.01", "Network fee"],
                ["0%", "Platform cut"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-2xl font-semibold">{v}</dt>
                  <dd className="mt-1 text-sm text-mute">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroCard />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-7 transition hover:border-white/15">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-mute">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-x-0 -top-40 mx-auto h-72 w-[600px] rounded-full bg-lime-400/15 blur-[100px]" />
          <div className="relative">
            <ol className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
              {STEPS.map(({ icon: Icon, title }, i) => (
                <li key={title} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-ink-800 text-lime-400">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="font-medium">{title}</span>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="ml-4 hidden h-4 w-4 text-mute/50 sm:block" />
                  )}
                </li>
              ))}
            </ol>
            <h2 className="mt-12 text-4xl font-semibold tracking-tight sm:text-5xl">Ready in a minute.</h2>
            <Link href="/create" className="btn-lime mt-8 h-12 px-7 text-base">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
