// Update a user's email on the `User` row, by their current email.
//
// Auth lives in Logto; the `User.email` in the database is a mirror seeded once
// at registration (src/server/user.ts) and never synced afterwards. So when you
// change a user's primary email in the Logto admin console, this row is left
// pointing at the old address — this script brings it back in sync.
// See docs/operations.md for the full on-behalf registration procedure.
import {
  connect,
  confirmOrAbort,
  parseOperatorArgs,
} from './lib/operator-db.mjs';

const {dryRun, positional} = parseOperatorArgs(process.argv.slice(2));
const [currentEmail, newEmail] = positional;
if (positional.length !== 2) {
  console.error(
    'Usage: pnpm email:update <current-email> <new-email> [--dry-run]',
  );
  process.exit(1);
}

const {sql, host, environment} = connect();

const targets = await sql`
  SELECT id, email, "role" FROM "User" WHERE email = ${currentEmail}
`;
if (targets.length === 0) {
  console.error(
    `No user found with email "${currentEmail}". Check the current address, or that you are pointing at the right environment's DATABASE_URL.`,
  );
  process.exit(1);
}

console.log(`Database: ${host} (${environment})`);
console.log(
  `Will update email for user ${targets[0].id} (${targets[0].role}): ${targets[0].email} -> ${newEmail}`,
);
if (dryRun) {
  console.log('Dry run — no changes made.');
  process.exit(0);
}
await confirmOrAbort('Apply this update?');

let updated;
try {
  updated = await sql`
    UPDATE "User" SET email = ${newEmail} WHERE email = ${currentEmail}
    RETURNING id
  `;
} catch (error) {
  // email is @unique — the most likely failure is that the new address is
  // already taken by another row. Surface that clearly instead of a raw stack.
  if (error?.code === '23505') {
    console.error(
      `Cannot update: a user with email "${newEmail}" already exists.`,
    );
    process.exit(1);
  }
  throw error;
}

if (updated.length === 0) {
  console.error('No row was updated — the user changed concurrently. Re-run.');
  process.exit(1);
}

console.log(`Updated email for user ${targets[0].id} -> ${newEmail}.`);
