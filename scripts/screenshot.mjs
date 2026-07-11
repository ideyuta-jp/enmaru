// ローカルの dev サーバーにログインしてページのスクリーンショットを撮影する
// 使い方:
//   node scripts/screenshot.mjs <path> [output.png] [email] [password]
// 例:
//   node scripts/screenshot.mjs /profile/preview                         # seekerアカウントでログイン
//   node scripts/screenshot.mjs /nursery/mypage after.png email pw       # 指定アカウントでログイン
//   node scripts/screenshot.mjs /terms/seeker before.png                 # ログイン不要
//
// 認証が不要なページは EMAIL/PASSWORD 不要（ログインステップはスキップされます）
import {chromium} from 'playwright';
import {writeFileSync} from 'fs';

// Chromiumのパスは環境によって異なります。
// `npx playwright install chromium` 後、`npx playwright install --dry-run` で確認できます。
// 未設定の場合は playwright のデフォルト検出に任せます（null を渡すと自動検出）。
const CHROMIUM = process.env.CHROMIUM_PATH ?? null;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

// デフォルト認証情報は環境変数または引数で上書きしてください。
// .env.local に SCREENSHOT_EMAIL / SCREENSHOT_PASSWORD を設定することを推奨します。
const DEFAULT_EMAIL = process.env.SCREENSHOT_EMAIL ?? 'DUMMY_EMAIL';
const DEFAULT_PASSWORD = process.env.SCREENSHOT_PASSWORD ?? 'DUMMY_PASSWORD';

const targetPath = process.argv[2];
const outFile = process.argv[3] ?? 'screenshot.png';
const EMAIL = process.argv[4] ?? DEFAULT_EMAIL;
const PASSWORD = process.argv[5] ?? DEFAULT_PASSWORD;

if (!targetPath) {
  console.error('Usage: node scripts/screenshot.mjs <path> [output.png] [email] [password]');
  process.exit(1);
}

const browser = await chromium.launch({...(CHROMIUM && {executablePath: CHROMIUM}), headless: true});
const context = await browser.newContext({viewport: {width: 390, height: 844}});
const page = await context.newPage();

// まず対象ページに直接アクセスしてログイン不要か確認
await page.goto(`${BASE_URL}${targetPath}`, {waitUntil: 'domcontentloaded'});
const needsLogin = !page.url().startsWith(BASE_URL) || page.url().includes('/login');

if (needsLogin || page.url() !== `${BASE_URL}${targetPath}`) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForURL(url => !url.toString().startsWith(BASE_URL), {timeout: 15000});
  console.error('Logto URL:', page.url());

  await page.waitForSelector('input', {timeout: 10000});
  await page.fill('input[name="identifier"]', EMAIL).catch(() => page.fill('input[type="text"]', EMAIL));
  await page.click('button[type="submit"]');

  const pwInput = await page.waitForSelector('input[type="password"]', {timeout: 8000});
  await pwInput.fill(PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForURL(`${BASE_URL}/**`, {timeout: 20000});
  console.error('Logged in, URL:', page.url());

  await page.goto(`${BASE_URL}${targetPath}`, {waitUntil: 'networkidle'});
}

console.error('Screenshot URL:', page.url());
const buf = await page.screenshot({fullPage: true});
writeFileSync(outFile, buf);
console.log(outFile);

await browser.close();
