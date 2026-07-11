#!/usr/bin/env node
// Start a work item on a guaranteed-clean tree: fetch origin, ensure the
// working tree holds nothing (interactively stashing or deleting leftovers),
// then branch from origin/dev. This is a mechanism, not a convention — a
// branch created here cannot carry another work item's files into its
// commits (the contamination that hit PRs #124/#127).
//
// Usage:
//   pnpm work:start <type>/<description>     # e.g. feature/12-reservation-list
//   pnpm work:start --stash <branch>         # stash leftovers without prompting
//
// Without a TTY (e.g. driven by a coding agent) a dirty tree aborts unless
// --stash is given — leftovers are never deleted without a human answering
// the prompt.
import {execFileSync} from 'node:child_process';
import {createInterface} from 'node:readline/promises';

const BRANCH_PATTERN = /^(feature|fix|chore|refactor)\/[a-z0-9][a-z0-9-]*$/;

function git(...args) {
  return execFileSync('git', args, {encoding: 'utf8'});
}

function fail(message) {
  console.error(`\nerror: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const stashFlag = args.includes('--stash');
const branch = args.filter((a) => a !== '--stash')[0];

if (!branch || !BRANCH_PATTERN.test(branch)) {
  fail(
    'usage: pnpm work:start [--stash] <type>/<description>\n' +
      '  type: feature | fix | chore | refactor\n' +
      '  description: kebab-case, issue number first when one exists\n' +
      '  e.g. pnpm work:start feature/12-reservation-list',
  );
}

console.log('Fetching origin...');
git('fetch', 'origin');

const status = git('status', '--porcelain');
if (status.trim() !== '') {
  console.log('\nThe working tree is not clean:\n');
  console.log(git('status', '--short'));

  if (stashFlag) {
    stashLeftovers();
  } else if (!process.stdin.isTTY) {
    fail(
      'dirty working tree and no TTY to ask what to do with it.\n' +
        'Re-run with --stash to stash the leftovers, or clean up first\n' +
        '(commit on the right branch / git stash -u / git clean).',
    );
  } else {
    const rl = createInterface({input: process.stdin, output: process.stdout});
    // If input closes mid-question (Ctrl-D), the pending question never
    // settles and node would exit 0 silently — turn that into an explicit
    // abort instead.
    let settled = false;
    rl.on('close', () => {
      if (!settled) {
        console.error(
          '\nerror: aborted (input closed); resolve the working tree first.',
        );
        process.exit(1);
      }
    });
    try {
      const answer = (
        await rl.question(
          'These files would leak into the new branch. ' +
            '[s]tash them / [d]elete them / [a]bort? ',
        )
      )
        .trim()
        .toLowerCase();

      if (answer === 's') {
        stashLeftovers();
      } else if (answer === 'd') {
        console.log('\nThis will permanently delete:\n');
        console.log(git('clean', '-nd'));
        const sure = (
          await rl.question('Type "delete" to confirm, anything else aborts: ')
        ).trim();
        if (sure !== 'delete') fail('aborted; nothing was deleted.');
        git('reset', '--hard');
        git('clean', '-fd');
        console.log('Working tree cleaned.');
      } else {
        fail('aborted; resolve the working tree first.');
      }
      settled = true;
    } finally {
      rl.close();
    }
  }
}

git('switch', '-c', branch, 'origin/dev');
console.log(`\nOn ${branch}, branched from origin/dev — ready to work.`);

function stashLeftovers() {
  const from = git('rev-parse', '--abbrev-ref', 'HEAD').trim();
  git(
    'stash',
    'push',
    '--include-untracked',
    '-m',
    `work:start leftovers from ${from}`,
  );
  console.log('Stashed (recover with `git stash pop` on the right branch).');
}
