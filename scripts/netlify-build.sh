#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_DIR="${ROOT_DIR}/packages/react-app"

# Support running either from repo root or from Netlify base=packages/react-app.
if [[ -f "package.json" && -d "src" ]]; then
  CWD_APP_DIR="$(pwd)"
else
  CWD_APP_DIR="${APP_DIR}"
fi

is_address() {
  local value="${1:-}"
  [[ "$value" =~ ^0x[0-9a-fA-F]{40}$ ]]
}

# Provider / contract mapping (safe and expected for frontend)
if [[ -z "${REACT_APP_PROVIDER:-}" ]] && [[ -n "${MONAD_RPC_URL:-}" ]]; then
  export REACT_APP_PROVIDER="$MONAD_RPC_URL"
fi

if [[ -z "${REACT_APP_TICKETS_CONTRACT_ADDRESS:-}" ]] && is_address "${TICKETS_CONTRACT_ADDRESS:-}"; then
  export REACT_APP_TICKETS_CONTRACT_ADDRESS="$TICKETS_CONTRACT_ADDRESS"
fi

# Mock addresses for demo connect flow:
# Only forward values that are already plain addresses.
if [[ -z "${REACT_APP_MOCK_DEPLOYER_ADDRESS:-}" ]] && is_address "${DEPLOYER_PRIVATE_KEY:-}"; then
  export REACT_APP_MOCK_DEPLOYER_ADDRESS="$DEPLOYER_PRIVATE_KEY"
fi

if [[ -z "${REACT_APP_MOCK_USDC_ADDRESS:-}" ]] && is_address "${USDC_ADDRESS:-}"; then
  export REACT_APP_MOCK_USDC_ADDRESS="$USDC_ADDRESS"
fi

echo "[netlify-build] Building React app at: ${CWD_APP_DIR}"
cd "${CWD_APP_DIR}"

# Prefer npm in app-only context to avoid monorepo workspace install side effects on Netlify.
if [[ -f "package-lock.json" ]]; then
  npm run build
else
  yarn build
fi
