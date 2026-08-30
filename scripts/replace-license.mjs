// Replace one value in a seeker's `SeekerProfile.licenses`, by their email.
//
// `licenses` stores the label text itself, so changing the vocabulary in
// SeekerProfileForm leaves existing rows on the old label. When the new
// vocabulary splits one option into several (#211 split 幼稚園教諭免許 into
// 一種/二種/専修免許状) the right replacement cannot be derived — only the
// seeker knows which one they hold, so it is collected from them and applied
// here one at a time.
// See docs/operations.md for the full procedure.
import {
  connect,
  confirmOrAbort,
  parseOperatorArgs,
} from './lib/operator-db.mjs';

// Mirrors LICENSE_OPTIONS in src/components/SeekerProfileForm.tsx. Kept as a
// copy rather than an import because this script runs as plain Node outside
// the Next build, and a typo here would write a label no checkbox can ever
// show again — exactly the state this script exists to clean up.
const LICENSE_OPTIONS = [
  '保育士資格',
  '幼稚園教諭一種免許状',
  '幼稚園教諭二種免許状',
  '幼稚園教諭専修免許状',
  '子育て支援員',
  '認定ベビーシッター',
  'チャイルドマインダー',
  '家庭的保育者（保育ママ）',
  '病児保育専門士',
  '児童発達支援管理責任者',
  '保育補助者',
  '社会福祉主事任用資格',
  '普通救命講習修了証',
];

const {dryRun, positional} = parseOperatorArgs(process.argv.slice(2));
const [email, oldLicense, newLicense] = positional;
if (positional.length !== 3) {
  console.error(
    'Usage: pnpm license:replace <email> <old-license> <new-license> [--dry-run]',
  );
  process.exit(1);
}

if (!LICENSE_OPTIONS.includes(newLicense)) {
  console.error(
    `"${newLicense}" is not one of the current options, so no checkbox could ever show it. Valid values:\n  ${LICENSE_OPTIONS.join('\n  ')}`,
  );
  process.exit(1);
}

const {sql, host, environment} = connect();

const targets = await sql`
  SELECT p.id, p."realName", p.licenses
  FROM "SeekerProfile" p
  JOIN "User" u ON u.id = p."userId"
  WHERE u.email = ${email}
`;
if (targets.length === 0) {
  console.error(
    `No seeker profile found for "${email}". Check the address, or that you are pointing at the right environment's DATABASE_URL.`,
  );
  process.exit(1);
}

const [profile] = targets;
if (!profile.licenses.includes(oldLicense)) {
  console.error(
    `"${profile.realName}" does not hold "${oldLicense}". Current: ${JSON.stringify(profile.licenses)}`,
  );
  process.exit(1);
}
// Replacing would otherwise leave the same label twice in the array.
if (profile.licenses.includes(newLicense)) {
  console.error(
    `"${profile.realName}" already holds "${newLicense}". Remove "${oldLicense}" from the profile instead of replacing it.`,
  );
  process.exit(1);
}

// Position is preserved so the profile's checkbox order does not shuffle.
const next = profile.licenses.map((l) => (l === oldLicense ? newLicense : l));

console.log(`Database: ${host} (${environment})`);
console.log(`Will update licenses for ${profile.realName} (${email}):`);
console.log(`  ${JSON.stringify(profile.licenses)}`);
console.log(`  ${JSON.stringify(next)}`);
if (dryRun) {
  console.log('Dry run — no changes made.');
  process.exit(0);
}
await confirmOrAbort('Apply this update?');

const updated = await sql`
  UPDATE "SeekerProfile" SET licenses = ${next}
  WHERE id = ${profile.id} AND licenses = ${profile.licenses}
  RETURNING id
`;
if (updated.length === 0) {
  console.error(
    'No row was updated — the profile changed concurrently. Re-run to see its current licenses.',
  );
  process.exit(1);
}

console.log(`Updated licenses for ${profile.realName}.`);
