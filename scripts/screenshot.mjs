// ローカルの dev サーバーにログインしてページのスクリーンショットを撮影する
// モバイル (390x844) と PC (1280x800) の両サイズを一度に撮影します。
// 使い方 (pnpm 経由だと .env.local が読み込まれます):
//   pnpm screenshot <path> [name-prefix] [email] [password]
//   node scripts/screenshot.mjs <path> [name-prefix] [email] [password]
// 例:
//   node scripts/screenshot.mjs /profile/preview                  # seekerアカウントでログイン
//   node scripts/screenshot.mjs /nursery/mypage after email pw    # 指定アカウントでログイン
//   node scripts/screenshot.mjs /terms/seeker before              # ログイン不要
//
// name-prefix は拡張子なしで指定します。生成されるファイルは
// <name-prefix>-mobile.png / <name-prefix>-desktop.png の2つです
// (例: after → after-mobile.png / after-desktop.png)。
// 生成物は .gitignore 済みなのでコミットに混入しません。
// 認証が不要なページは EMAIL/PASSWORD 不要（ログインステップはスキップされます）
import {chromium} from 'playwright';
import {writeFileSync} from 'fs';

// アプリは PC / モバイル両対応なので、デフォルトで両方のサイズを撮影する。
const VIEWPORTS = [
  {name: 'mobile', width: 390, height: 844},
  {name: 'desktop', width: 1280, height: 800},
];

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
// 拡張子は受け付けない (.png 付きで渡されたら黙って剥がす)。ファイル名は
// スクリプト側が <prefix>-mobile.png / <prefix>-desktop.png に確定させる。
const outPrefix = (process.argv[3] ?? 'screenshot').replace(/\.png$/i, '');
const EMAIL = process.argv[4] ?? DEFAULT_EMAIL;
const PASSWORD = process.argv[5] ?? DEFAULT_PASSWORD;

if (!targetPath) {
  console.error(
    'Usage: node scripts/screenshot.mjs <path> [name-prefix] [email] [password]',
  );
  process.exit(1);
}

// "after" + "mobile" → "after-mobile.png"
function withSizeSuffix(prefix, name) {
  return `${prefix}-${name}.png`;
}

const browser = await chromium.launch({
  ...(CHROMIUM && {executablePath: CHROMIUM}),
  headless: true,
});
const context = await browser.newContext({viewport: VIEWPORTS[0]});
const page = await context.newPage();

// まず対象ページに直接アクセスしてログイン不要か確認
await page.goto(`${BASE_URL}${targetPath}`, {waitUntil: 'domcontentloaded'});
const needsLogin =
  !page.url().startsWith(BASE_URL) || page.url().includes('/login');

// 2つ目の条件も重要: requireRole はロール不一致時に "/" へリダイレクトするため
// needsLogin の判定には引っかからない。対象パス以外に飛ばされたケースを
// これで拾わないと、無関係なページを黙って撮影してしまう。
if (needsLogin || page.url() !== `${BASE_URL}${targetPath}`) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForURL((url) => !url.toString().startsWith(BASE_URL), {
    timeout: 15000,
  });
  console.error('Logto URL:', page.url());

  await page.waitForSelector('input', {timeout: 10000});
  await page
    .fill('input[name="identifier"]', EMAIL)
    .catch(() => page.fill('input[type="text"]', EMAIL));
  await page.click('button[type="submit"]');

  const pwInput = await page.waitForSelector('input[type="password"]', {
    timeout: 8000,
  });
  await pwInput.fill(PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForURL(`${BASE_URL}/**`, {timeout: 20000});
  console.error('Logged in, URL:', page.url());

  await page.goto(`${BASE_URL}${targetPath}`, {waitUntil: 'networkidle'});
}

// ログイン不要だった場合は domcontentloaded までしか待っていないので、
// 遅延読み込みのコンテンツ (写真など) が揃うまで待ってから撮影する。
await page.waitForLoadState('networkidle');
console.error('Screenshot URL:', page.url());

// 1つ目のビューポート（ログイン済みのページ）をそのまま撮影し、残りは同じ
// セッション（storageState = Cookie）を引き継いだ別コンテキストで撮影する。
// ログインは1回で済む。
const buf = await page.screenshot({fullPage: true});
const firstFile = withSizeSuffix(outPrefix, VIEWPORTS[0].name);
writeFileSync(firstFile, buf);
console.log(firstFile);

const storageState = await context.storageState();
for (const viewport of VIEWPORTS.slice(1)) {
  const extraContext = await browser.newContext({viewport, storageState});
  const extraPage = await extraContext.newPage();
  await extraPage.goto(`${BASE_URL}${targetPath}`, {waitUntil: 'networkidle'});
  const extraBuf = await extraPage.screenshot({fullPage: true});
  const file = withSizeSuffix(outPrefix, viewport.name);
  writeFileSync(file, extraBuf);
  console.log(file);
  await extraContext.close();
}

await browser.close();
