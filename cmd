#!/usr/bin/env bash
set -ueo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)
cd "$SCRIPT_DIR"

COMPOSE="docker compose"
E2E_FILES="-f docker-compose.yml -f docker-compose.e2e.yml"

usage() {
  cat <<'EOF'
Usage: ./cmd <command>

  up                 Build and start db + app (detached)
  down [args...]     Stop and remove containers (e.g. ./cmd down -v)
  test e2e           Run Playwright e2e tests in Docker against the app
  test e2e-report    Serve the last e2e HTML report at http://localhost:52001
  test unit          Run Vitest unit tests on the host
  lint               Run ESLint
  format             Run Prettier (write)
EOF
}

case "${1:-}" in
  up)
    $COMPOSE up -d --build
    ;;
  down)
    shift
    $COMPOSE down "$@"
    ;;
  test)
    case "${2:-}" in
      e2e)
        trap "$COMPOSE $E2E_FILES down -v" EXIT
        $COMPOSE $E2E_FILES up -d --build db app
        $COMPOSE $E2E_FILES run --build --rm e2e
        ;;
      e2e-report)
        ./e2e/report.sh
        ;;
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
