# Zobbo web

Next.js 14 (App Router) + Tailwind. Wallet: Freighter. Chain access: `@stellar/stellar-sdk`.

```bash
npm install
npm run dev        # http://localhost:3000
```

Contract config comes from `.env.local`, written by `../contracts/deploy.sh` (see `.env.example`).

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/create` | Claim a handle |
| `/[handle]` | Public tip page + wall |
| `/[handle]/qr` | Printable QR card |
| `/dashboard` | Totals and recent tips |

Brand assets: `public/brand/` (SVG + PNG). The tip wall reads `tip` events from RPC, which only keeps about a week.
