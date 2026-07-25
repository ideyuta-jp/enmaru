// Close every OPEN JobPosting whose workDate is before today (JST). A
// posting's status only otherwise changes when a seeker applies (immediate
// first-come match) — nothing today closes an unmatched posting once its
// work date has passed, so they'd sit OPEN indefinitely (#185).
//
// Meant to run unattended on a schedule (see .github/workflows/), so unlike
// grant-admin.mjs/update-email.mjs this does NOT prompt for confirmation —
// there's no human present to answer it. Run with --dry-run to preview.
//
// Usage: pnpm jobs:close-expired [--dry-run]
import {connect, parseOperatorArgs} from './lib/operator-db.mjs';

const {dryRun, positional} = parseOperatorArgs(process.argv.slice(2));
if (positional.length !== 0) {
  console.error('Usage: pnpm jobs:close-expired [--dry-run]');
  process.exit(1);
}

const {sql, host, environment} = connect();

// Same JST-"today" convention as job-actions.ts's parseJobInput: the server
// clock may run in UTC, and toISOString-style UTC dates lag Japan by 9 hours
// around midnight, so compare calendar dates in JST explicitly.
const todayJst = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
}).format(new Date());

const openJobs = await sql`
  SELECT id, "workDate" FROM "JobPosting" WHERE status = 'OPEN'
`;
// Compare in JS (same .toISOString().slice(0, 10) convention used throughout
// the codebase, e.g. server/job.ts) rather than in the SQL query, so this
// isn't relying on Postgres's session timezone to agree with how workDate was
// originally stored.
const expired = openJobs.filter(
  (job) => new Date(job.workDate).toISOString().slice(0, 10) < todayJst,
);

console.log(`Database: ${host} (${environment})`);
console.log(
  `${expired.length} of ${openJobs.length} OPEN posting(s) have a workDate before ${todayJst} (JST).`,
);

if (expired.length === 0) {
  console.log('Nothing to close.');
  process.exit(0);
}

if (dryRun) {
  console.log('Dry run — no changes made.');
  process.exit(0);
}

const ids = expired.map((job) => job.id);
const closed = await sql`
  UPDATE "JobPosting" SET status = 'CLOSED' WHERE id = ANY(${ids})
  RETURNING id
`;
console.log(`Closed ${closed.length} posting(s).`);
