#!/usr/bin/env bash
# Build, test and deploy the Zobbo contract, then write its address to
# contracts/deployments/<network>.json and web/.env.local.
#
#   ./deploy.sh                      # testnet, native XLM as the tip token
#   TOKEN_ASSET=USDC:<ISSUER> ./deploy.sh
#
set -euo pipefail

NETWORK="${NETWORK:-testnet}"
SOURCE="${SOURCE:-zobbo-deployer}"
TOKEN_ASSET="${TOKEN_ASSET:-native}"
TOKEN_SYMBOL="${TOKEN_SYMBOL:-$([ "$TOKEN_ASSET" = native ] && echo XLM || echo "${TOKEN_ASSET%%:*}")}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
CONTRACT_DIR="$ROOT/zobbo"
WEB_ENV="$ROOT/../web/.env.local"
WASM="$CONTRACT_DIR/target/wasm32v1-none/release/zobbo.wasm"

for bin in cargo stellar; do
  command -v "$bin" >/dev/null || { echo "missing dependency: $bin" >&2; exit 1; }
done

case "$NETWORK" in
  testnet) RPC_URL="https://soroban-testnet.stellar.org"; PASSPHRASE="Test SDF Network ; September 2015" ;;
  mainnet) RPC_URL="${RPC_URL:?set RPC_URL for mainnet}"; PASSPHRASE="Public Global Stellar Network ; September 2015" ;;
  *) echo "unsupported NETWORK: $NETWORK" >&2; exit 1 ;;
esac

if ! stellar keys address "$SOURCE" >/dev/null 2>&1; then
  echo "==> creating key '$SOURCE'"
  if [ "$NETWORK" = testnet ]; then
    stellar keys generate "$SOURCE" --network "$NETWORK" --fund
  else
    echo "create and fund '$SOURCE' first: stellar keys generate $SOURCE" >&2; exit 1
  fi
fi
echo "==> deployer: $(stellar keys address "$SOURCE")"

echo "==> testing"
(cd "$CONTRACT_DIR" && cargo test)

echo "==> building"
(cd "$CONTRACT_DIR" && stellar contract build)

echo "==> resolving token ($TOKEN_ASSET)"
TOKEN_ID="$(stellar contract id asset --asset "$TOKEN_ASSET" --network "$NETWORK")"
echo "    $TOKEN_ID"

echo "==> deploying"
CONTRACT_ID="$(stellar contract deploy \
  --wasm "$WASM" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- --token "$TOKEN_ID" | tail -n1)"
echo "    $CONTRACT_ID"

mkdir -p "$ROOT/deployments"
cat > "$ROOT/deployments/$NETWORK.json" <<EOF
{
  "network": "$NETWORK",
  "contractId": "$CONTRACT_ID",
  "tokenId": "$TOKEN_ID",
  "tokenSymbol": "$TOKEN_SYMBOL",
  "rpcUrl": "$RPC_URL",
  "networkPassphrase": "$PASSPHRASE"
}
EOF

cat > "$WEB_ENV" <<EOF
NEXT_PUBLIC_STELLAR_NETWORK=$NETWORK
NEXT_PUBLIC_RPC_URL=$RPC_URL
NEXT_PUBLIC_NETWORK_PASSPHRASE="$PASSPHRASE"
NEXT_PUBLIC_ZOBBO_CONTRACT_ID=$CONTRACT_ID
NEXT_PUBLIC_TOKEN_CONTRACT_ID=$TOKEN_ID
NEXT_PUBLIC_TOKEN_SYMBOL=$TOKEN_SYMBOL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "==> smoke test"
stellar contract invoke --id "$CONTRACT_ID" --source "$SOURCE" --network "$NETWORK" -- token

echo "done. contract: $CONTRACT_ID  (written to deployments/$NETWORK.json and web/.env.local)"
