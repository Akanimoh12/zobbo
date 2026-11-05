"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const freighter = await import("@stellar/freighter-api");
        const res = await freighter.getAddress();
        if (res.address && !res.error) setAddress(res.address);
      } catch {}
    })();
  }, []);

  const connect = async () => {
    const freighter = await import("@stellar/freighter-api");
    const res = await freighter.requestAccess();
    if (res.error || !res.address) {
      throw new Error(
        "Could not connect. Install Freighter and switch it to Testnet."
      );
    }
    setAddress(res.address);
  };

  const disconnect = () => setAddress(null);

  return (
    <WalletContext.Provider
      value={{ address, connected: !!address, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
