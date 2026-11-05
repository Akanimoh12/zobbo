"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QrCard } from "@/components/QrCard";
import { useProfile } from "@/lib/hooks";

export default function QrPage() {
  const handle = decodeURIComponent(String(useParams().handle)).toLowerCase();
  const { profile } = useProfile(handle);

  return (
    <div className="mx-auto max-w-md px-5 py-12">
      <Link
        href={`/${handle}`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-mute hover:text-fg print:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> @{handle}
      </Link>

      {profile === undefined && <div className="card h-[520px] animate-pulse" />}
      {profile === null && <p className="text-mute">Handle not found.</p>}
      {profile && <QrCard handle={profile.handle} name={profile.display_name} />}
    </div>
  );
}
