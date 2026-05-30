#!/usr/bin/env bash
set -ueo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)
REPORT_DIR="${SCRIPT_DIR}/playwright-report"

if [ ! -f "${REPORT_DIR}/index.html" ]; then
  echo "[E2E] No report found. Run './cmd test e2e' first."
  exit 1
fi

PORT=52001
CONTAINER_NAME=enmaru-e2e-report

cleanup() {
  docker rm -f "$CONTAINER_NAME" > /dev/null 2>&1 || true
}
trap 'cleanup; exit 0' INT TERM
trap cleanup EXIT

# Run detached so the wait loop below stays interruptible: a foreground
# `docker run` would make bash defer the Ctrl+C trap until it returns, and the
# report server is not guaranteed to receive the signal (npx does not forward
# it to the child). Polling + trap stops the container reliably on Ctrl+C.
docker run -d --rm --init --name "$CONTAINER_NAME" -p ${PORT}:${PORT} \
  -v "${REPORT_DIR}:/e2e/playwright-report" \
  -w /e2e \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  npx playwright show-report playwright-report --port ${PORT} --host 0.0.0.0 \
  > /dev/null

echo "[E2E] Serving report at http://localhost:${PORT}"
echo "[E2E] Press Ctrl+C to stop."
while [ -n "$(docker ps -q -f name=^/${CONTAINER_NAME}$)" ]; do
  sleep 1
done
