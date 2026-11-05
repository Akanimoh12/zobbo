# Zobbo contract

Soroban contract for Zobbo. Everything contract-related lives in this folder.

```
contracts/
├── zobbo/            # Rust crate (src/lib.rs, src/test.rs)
├── deploy.sh         # test + build + deploy + write config
└── deployments/      # <network>.json written by deploy.sh
```

## Prerequisites

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32v1-none
brew install stellar-cli        # or: cargo install --locked stellar-cli
```

## Test

```bash
cd contracts/zobbo && cargo test
```

## Deploy to testnet

```bash
./contracts/deploy.sh
```

Creates and funds a `zobbo-deployer` key if missing, runs the tests, builds, deploys with native XLM as the tip token,
and writes the contract ID to `deployments/testnet.json` and `web/.env.local`.

For USDC: `TOKEN_ASSET=USDC:<ISSUER> ./contracts/deploy.sh`.

## Interface

| Function | Auth | Notes |
|---|---|---|
| `register(owner, handle, display_name, bio)` | owner | handle `[a-z0-9_]{3,20}`, unique; one per wallet |
| `update_profile(owner, display_name, bio)` | owner | |
| `tip(from, handle, amount, message)` | from | amount > 0, message ≤ 140 bytes, no self-tips; transfers `from → owner` directly |
| `get_profile(handle)` / `get_handle(owner)` / `token()` | none | reads |

Events: `("register", handle) → owner`, `("tip", handle) → (from, amount, message)`.
Amounts use 7 decimals (`1 = 10_000_000`). The contract never holds funds.
