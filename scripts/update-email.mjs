// Update a user's email on the `User` row, by their current email.
//
// Auth lives in Logto; the `User.email` in the database is a mirror seeded once
// at registration (src/server/user.ts) and never synced afterwards. So when you
// change a user's primary email in the Logto admin console, this row is left
// pointing at the old address — this script brings it back in sync.
// See docs/operations.md for the full on-behalf registration procedure.
import {neon} from '@neondatabase/serverless';

const currentEmail = process.argv[2];
const newEmail = process.argv[3];
if (!currentEmail || !newEmail) {
  console.error('Usage: pnpm email:update <current-email> <new-email>');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(connectionString);

let rows;
try {
  rows = await sql`
    UPDATE "User" SET email = ${newEmail} WHERE email = ${currentEmail}
    RETURNING id, email, "role"
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

if (rows.length === 0) {
  console.error(
    `No user found with email "${currentEmail}". Check the current address, or that you are pointing at the right environment's DATABASE_URL.`,
  );
  process.exit(1);
}

console.log(
  `Updated email for user ${rows[0].id} (${rows[0].role}) -> ${rows[0].email}.`,
);
