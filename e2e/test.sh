#!/usr/bin/env bash
set -ueo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)
cd "$SCRIPT_DIR"

APP_URL="${E2E_BASE_URL:-http://localhost:3000}"

echo "[E2E] Installing dependencies..."
npm ci --quiet

echo "[E2E] Waiting for app to be ready at ${APP_URL}..."
TIMEOUT=120
elapsed=0
until curl -sf "$APP_URL" > /dev/null 2>&1; do
  if [ "$elapsed" -ge "$TIMEOUT" ]; then
    echo "[E2E] App did not become ready within ${TIMEOUT}s." >&2
    exit 1
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done
echo "[E2E] App is ready."

echo "[E2E] Running Playwright tests..."
npx playwright test
