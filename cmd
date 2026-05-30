#!/usr/bin/env bash
set -ueo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)
cd "$SCRIPT_DIR"

usage() {
  cat <<'EOF'
Usage: ./cmd <command>

  test unit          Run Vitest unit tests
  test e2e           Run Playwright e2e tests (starts the app via webServer)
  test e2e-setup     Install Playwright browsers (one-time)
  test e2e-report    Open the last Playwright HTML report
  lint               Run ESLint
  format             Run Prettier (write)
EOF
}

case "${1:-}" in
  test)
    case "${2:-}" in
      unit)
        pnpm test:unit
        ;;
      e2e)
        (cd e2e && npm test)
        ;;
      e2e-setup)
        (cd e2e && npm ci && npm run setup)
        ;;
      e2e-report)
        (cd e2e && npm run report)
        ;;
      *)
        usage
        exit 1
        ;;
    esac
    ;;
  lint)
    pnpm lint
    ;;
  format)
    pnpm format
    ;;
  *)
    usage
    exit 1
    ;;
esac
