"use client";

import { useCallback, useEffect, useState } from "react";
import { Profile, getHandle, getProfile } from "./zobbo";

// undefined = loading, null = not found
export function useProfile(handle: string | null) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  const reload = useCallback(async () => {
    if (!handle) return setProfile(null);
    setProfile(await getProfile(handle));
  }, [handle]);

  useEffect(() => {
    setProfile(undefined);
    reload();
  }, [reload]);

  return { profile, reload };
}

export function useMyHandle(address: string | null) {
  const [handle, setHandle] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!address) return setHandle(null);
    setHandle(undefined);
    let live = true;
    getHandle(address).then((h) => live && setHandle(h));
    return () => {
      live = false;
    };
  }, [address]);

  return handle;
}
