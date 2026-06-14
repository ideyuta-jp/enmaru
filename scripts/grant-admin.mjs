// Grant the ADMIN role to an existing user, by email.
//
// Prerequisite: the person must have signed in via Logto and completed
// registration once — that creates their User row (with their email). This
// script then flips that row's role to ADMIN.
//
// Dev:  pnpm admin:grant <email>
//       (the npm script passes --env-file=.env.local so DATABASE_URL is the dev
//        Neon branch)
// Prod: DATABASE_URL="<prod connection string>" node scripts/grant-admin.mjs <email>
//
// Uses @neondatabase/serverless (already a dependency) so there is no extra
// tooling; the query is parameterized (no SQL injection) and RETURNING lets us
// tell whether a row actually matched.
import {neon} from '@neondatabase/serverless';

const email = process.argv[2];
if (!email) {
  console.error('Usage: pnpm admin:grant <email>');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(connectionString);
const rows = await sql`
  UPDATE "User" SET "role" = 'ADMIN' WHERE email = ${email}
  RETURNING id, email, "role"
`;

if (rows.length === 0) {
  console.error(
    `No user found with email "${email}". They must sign in and complete registration first.`,
  );
  process.exit(1);
}

console.log(`Granted ADMIN to ${rows[0].email} (id ${rows[0].id}).`);
