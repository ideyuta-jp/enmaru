@AGENTS.md

# PR Workflow

PR作成後は必ず以下を実施すること。

## 1. Slack通知

PRを作成したら、下記チャンネルに新規スレッドで投稿する。
- **チャンネル**: C07GLRQS477
- **メンション**: `<@UFU54AXQX>`（Slack の書式。`@` を忘れずに）
- **内容**: 確認依頼・対象IssueのNo.・PRリンク

## 2. Before/After スクリーンショット

UIに変更がある場合、PR作成時にスクリーンショットを撮影してPRコメントに掲載すること。

- **ログイン不要のページ**: Playwright（`/Users/user/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`）で自動撮影する
- **ログインが必要なページ**: テスト用アカウントが提供されていれば自動撮影、なければ手動撮影を依頼する旨をPRコメントに明記する
- スクリーンショットは `docs/screenshots/pr-{番号}/` にコミットして raw.githubusercontent.com のURLでPRコメントに埋め込む
