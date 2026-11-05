# Zobbo 🍷

**Tip anyone with one scan.**

Zobbo is a QR tip jar on Stellar. Creators, musicians, barbers, writers, street performers — anyone with fans — claims a handle, prints their QR code, and gets tipped in USDC straight to their wallet. Every tip can carry a short message that shows up on the creator's public wall.

No middleman holds the money. A tip goes from the supporter's wallet to the creator's wallet in one transaction, in about 5 seconds, for a fraction of a cent.

---

## Why Zobbo

- **Cash is disappearing, and bank transfers are clumsy for small tips.** Nobody wants to type an account number to tip ₦500 worth of appreciation.
- **Foreign fans can't easily tip Nigerian creators.** USDC on Stellar works the same from Lagos or London.
- **Tips should feel social.** A message wall turns a payment into a shout-out.

---

## Features (MVP)

- 🔖 **Claim a handle** — `zobbo.app/tobi` belongs to one wallet
- 📱 **QR code** — downloadable and printable, links to the creator's tip page
- 💸 **One-tap tipping** — preset amounts ($1, $2, $5) or custom
- 💬 **Tip messages** — up to 140 characters, shown on the creator's wall
- 📊 **Creator dashboard** — total received, tip count, recent tips
- 🔒 **Non-custodial** — tips go directly to the creator, never held by the contract

---

## How it works

```
Supporter scans QR
      │
      ▼
/[handle] tip page  ──connect wallet (Freighter / xBull / Lobstr)
      │
      ▼
zobbo.tip(from, handle, amount, message)
      │
      ├─► USDC transferred: supporter ──► creator (direct)
      ├─► Profile stats updated (total, count)
      └─► Event emitted: ("tip", handle) → { from, amount, message }
                                   │
                                   ▼
                     Frontend reads events → tip wall + dashboard
```

---

## Tech stack

| Layer | Tool |
|---|---|
| Smart contract | Rust + `soroban-sdk` |
| Token | USDC (or native XLM for dev) via its Stellar Asset Contract |
| Contract tooling | Stellar CLI (`stellar`) |
| Frontend | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Wallets | `@creit.tech/stellar-wallets-kit` |
| Chain access | `@stellar/stellar-sdk` + generated TypeScript bindings |
| QR | `qrcode.react` |
| Hosting | Vercel |

---

## Project structure

```
zobbo/
├── contracts/
│   └── zobbo/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs        # contract
│           └── test.rs       # unit tests
├── packages/
│   └── zobbo-client/         # generated TS bindings (do not edit)
├── web/                      # Next.js app
│   ├── app/
│   │   ├── page.tsx              # landing
│   │   ├── create/page.tsx       # claim a handle
│   │   ├── dashboard/page.tsx    # creator stats + recent tips
│   │   └── [handle]/
│   │       ├── page.tsx          # public tip page + message wall
│   │       └── qr/page.tsx       # printable QR card
│   ├── components/
│   │   ├── WalletButton.tsx
│   │   ├── TipForm.tsx
│   │   ├── TipWall.tsx
│   │   └── QrCard.tsx
│   ├── lib/
│   │   ├── wallet.ts             # Stellar Wallets Kit setup
│   │   ├── zobbo.ts              # contract client wrapper
│   │   └── events.ts             # read tip events from RPC
│   └── .env.local
└── README.md
```

---

## Contract interface

```rust
// Set once at deploy time
fn __constructor(env: Env, token: Address);

// Creator claims a handle (3–20 chars, lowercase a–z, 0–9, _)
fn register(env: Env, owner: Address, handle: String, display_name: String, bio: String);

// Creator updates their profile
fn update_profile(env: Env, owner: Address, display_name: String, bio: String);

// Supporter tips a creator; transfers token directly from -> owner
fn tip(env: Env, from: Address, handle: String, amount: i128, message: String);

// Reads
fn get_profile(env: Env, handle: String) -> Profile;
fn get_handle(env: Env, owner: Address) -> Option<String>;
fn token(env: Env) -> Address;
```

### Data

```rust
#[contracttype]
pub struct Profile {
    pub owner: Address,
    pub handle: String,
    pub display_name: String,
    pub bio: String,
    pub total_received: i128,
    pub tip_count: u32,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Token,                 // instance
    Profile(String),       // persistent: handle -> Profile
    OwnerHandle(Address),  // persistent: owner -> handle
}
```

### Rules

- `register` requires `owner.require_auth()`; fails if the handle is taken or the owner already has one
- `tip` requires `from.require_auth()`; `amount > 0`; `message` ≤ 140 chars; creators cannot tip themselves
- Tips use `token::Client::transfer(&from, &profile.owner, &amount)` — the contract never holds funds
- Persistent entries have their TTL extended on every write so profiles don't expire

### Events

| Topic | Data |
|---|---|
| `("register", handle)` | `owner` |
| `("tip", handle)` | `(from, amount, message)` |

> **Amounts:** Stellar assets use 7 decimals. `1 USDC = 10_000_000` in contract units. The frontend converts.

---

## Getting started

### Prerequisites

- Rust (stable) and the Wasm target:
  ```bash
  rustup target add wasm32v1-none
  ```
- Stellar CLI — see the install guide at [developers.stellar.org](https://developers.stellar.org)
- Node.js 20+ and pnpm (or npm)
- A Stellar wallet browser extension (Freighter is easiest), switched to **Testnet**

### 1. Create and fund a testnet identity

```bash
stellar keys generate dev --network testnet --fund
stellar keys address dev
```

### 2. Build and test the contract

```bash
cd contracts/zobbo
cargo test
stellar contract build
```

### 3. Get the token contract ID

For development, use native XLM so you don't need USDC yet:

```bash
stellar contract id asset --asset native --network testnet
```

For USDC on testnet, use `--asset USDC:<TESTNET_USDC_ISSUER>` (check Circle's/Stellar's docs for the current testnet issuer).

### 4. Deploy

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/zobbo.wasm \
  --source dev \
  --network testnet \
  -- --token <TOKEN_CONTRACT_ID>
```

Save the contract ID it prints.

### 5. Generate TypeScript bindings

```bash
stellar contract bindings typescript \
  --network testnet \
  --contract-id <ZOBBO_CONTRACT_ID> \
  --output-dir packages/zobbo-client

cd packages/zobbo-client && npm install && npm run build
```

### 6. Run the frontend

```bash
cd web
pnpm install
pnpm add ../packages/zobbo-client
cp .env.example .env.local   # then fill in values below
pnpm dev
```

### Environment variables (`web/.env.local`)

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_ZOBBO_CONTRACT_ID=C...
NEXT_PUBLIC_TOKEN_CONTRACT_ID=C...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Quick CLI smoke test

```bash
# register
stellar contract invoke --id <ZOBBO_ID> --source dev --network testnet -- \
  register --owner $(stellar keys address dev) --handle tobi \
  --display_name "Tobi" --bio "I make beats"

# read
stellar contract invoke --id <ZOBBO_ID> --source dev --network testnet -- \
  get_profile --handle tobi
```

---

## Frontend pages

| Route | What it does |
|---|---|
| `/` | Landing page — what Zobbo is, "Claim your handle" CTA |
| `/create` | Connect wallet → pick handle → sign `register` |
| `/[handle]` | Public tip page: profile, amount buttons, message box, tip wall |
| `/[handle]/qr` | Printable QR card with handle and display name |
| `/dashboard` | Creator view: total received, tip count, recent tips list |

### Reading the tip wall

The wall is built from `tip` events using the RPC `getEvents` method, filtered by contract ID and the `("tip", handle)` topic. **RPC only keeps recent events (roughly a week)**, so for full history, add an indexer later (your own small worker, or a hosted Stellar indexer) that stores events in a database.

---

## Roadmap

**Milestone 1 — Contract (week 1)**
- [ ] `register`, `update_profile`, `tip`, reads
- [ ] Unit tests: happy path, duplicate handle, self-tip, zero amount, long message
- [ ] Deployed to testnet

**Milestone 2 — Frontend MVP (week 2)**
- [ ] Wallet connect, claim handle, tip page, QR card
- [ ] Tip wall from events, dashboard totals

**Milestone 3 — Polish & launch**
- [ ] Mobile-first UI, share cards for social media
- [ ] Event indexer for full tip history
- [ ] Switch to USDC, deploy to mainnet after a review/audit
- [ ] Onboard 20 real creators in Lagos and measure weekly tips

**Later**
- Naira cash-out through a Stellar anchor (SEP-24)
- Goal bars ("Help me buy a new mic — 60% there")
- Live "projector mode" for shows and events

---

## Security notes

- Every state-changing function checks `require_auth()` on the right address
- The contract never custodies funds, which limits what can go wrong
- Validate handle format and message length on-chain, not just in the UI
- Treat tip messages as untrusted text — escape them in the frontend
- Get the contract reviewed before mainnet

---

## License

MIT
