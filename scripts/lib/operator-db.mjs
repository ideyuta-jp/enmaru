// Shared guardrails for the operator scripts in scripts/ that write to the
// database (grant-admin, update-email): argument parsing with --dry-run,
// DATABASE_URL handling that surfaces which host is being targeted, and a
// confirmation prompt shown before anything is written.
// See docs/operations.md for the procedures these scripts belong to.
import {createInterface} from 'node:readline/promises';

import {neon} from '@neondatabase/serverless';

export function parseOperatorArgs(argv) {
  const dryRun = argv.includes('--dry-run');
  const positional = argv.filter((arg) => arg !== '--dry-run');
  const unknown = positional.find((arg) => arg.startsWith('--'));
  if (unknown) {
    console.error(`Unknown option ${unknown}.`);
    process.exit(1);
  }
  return {dryRun, positional};
}

// Known Neon endpoints, so the preview can say which environment is being
// targeted — the endpoint IDs themselves are opaque to a human. A host not
// listed here shows as "unknown environment"; update the map when Neon
// branches change.
const KNOWN_ENVIRONMENTS = [
  {endpoint: 'ep-round-bread-aow4sv0c', label: 'dev'},
  {endpoint: 'ep-morning-field-aobsbehi', label: 'prod'},
];

function environmentLabel(host) {
  const match = KNOWN_ENVIRONMENTS.find(
    ({endpoint}) =>
      host.startsWith(`${endpoint}.`) || host.startsWith(`${endpoint}-pooler.`),
  );
  return match ? match.label : 'unknown environment';
}

export function connect() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }
  const host = new URL(connectionString).host;
  return {
    sql: neon(connectionString),
    host,
    environment: environmentLabel(host),
  };
}

// Returns only on an explicit "y"/"yes"; exits otherwise. An ended stdin (e.g.
// running with no input attached) counts as "no", so nothing is ever written
// without someone answering the prompt.
export async function confirmOrAbort(question) {
  const rl = createInterface({input: process.stdin, output: process.stdout});
  // question() never settles if stdin ends without a line, so race it against
  // the interface closing and treat that as an empty (= "no") answer.
  const closed = new Promise((resolve) => rl.once('close', () => resolve('')));
  const answer = await Promise.race([
    rl.question(`${question} [y/N] `),
    closed,
  ]);
  rl.close();
  if (!['y', 'yes'].includes(answer.trim().toLowerCase())) {
    console.log('Aborted; no changes made.');
    process.exit(1);
  }
}
