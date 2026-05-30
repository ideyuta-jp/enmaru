#!/usr/bin/env bash
set -ueo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)
cd "$SCRIPT_DIR"

usage() {
  cat <<'EOF'
Usage: ./cmd <command>

  test unit          Run Vitest unit tests
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
