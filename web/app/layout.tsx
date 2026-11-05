import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";
import { Footer, Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: { default: "Zobbo — Tip anyone with one scan", template: "%s · Zobbo" },
  description: "Claim a handle, print your QR, get tipped straight to your wallet.",
};

export const viewport: Viewport = { themeColor: "#07080B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen">
        <WalletProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
