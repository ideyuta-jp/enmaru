#!/usr/bin/env bash
set -ueo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)
cd "$SCRIPT_DIR"

usage() {
  cat <<'EOF'
Usage: ./cmd <command>

  check              Run the full CI gate (format check, lint, typecheck, unit)
  test unit          Run Vitest unit tests
  lint               Run ESLint
  typecheck          Run tsc --noEmit
  format             Run Prettier (write)
  format-check       Run Prettier (check only; does not write)
EOF
}

case "${1:-}" in
  check)
    # The exact gate CI runs, so `./cmd check` locally mirrors CI.
    pnpm format:check
    pnpm lint
    pnpm typecheck
    pnpm test:unit
    ;;
  test)
    case "${2:-}" in
      unit)
        pnpm test:unit
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
  typecheck)
    pnpm typecheck
    ;;
  format)
    pnpm format
    ;;
  format-check)
    pnpm format:check
    ;;
  *)
    usage
    exit 1
    ;;
esac
