// Grant the ADMIN role to an existing user, by email.
//
// Sign-up only creates seeker / nursery accounts, so an admin is made by
// flipping the role on their `User` row in the database after they have
// registered through the app. See docs/operations.md for the full procedure.
import {
  connect,
  confirmOrAbort,
  parseOperatorArgs,
} from './lib/operator-db.mjs';

const {dryRun, positional} = parseOperatorArgs(process.argv.slice(2));
const [email] = positional;
if (positional.length !== 1) {
  console.error('Usage: pnpm admin:grant <email> [--dry-run]');
  process.exit(1);
}

const {sql, host, environment} = connect();

const targets = await sql`
  SELECT id, email, "role" FROM "User" WHERE email = ${email}
`;
if (targets.length === 0) {
  console.error(
    `No user found with email "${email}". They must sign in and complete registration first.`,
  );
  process.exit(1);
}

console.log(`Database: ${host} (${environment})`);
console.log(
  `Will set role ADMIN for ${targets[0].email} (id ${targets[0].id}, current role ${targets[0].role}).`,
);
if (dryRun) {
  console.log('Dry run — no changes made.');
  process.exit(0);
}
await confirmOrAbort('Apply this update?');

const updated = await sql`
  UPDATE "User" SET "role" = 'ADMIN' WHERE email = ${email}
  RETURNING id
`;
if (updated.length === 0) {
  console.error('No row was updated — the user changed concurrently. Re-run.');
  process.exit(1);
}

console.log(`Granted ADMIN to ${targets[0].email} (id ${targets[0].id}).`);
