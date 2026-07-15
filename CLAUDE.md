@AGENTS.md

# 開発ルール・ワークフロー

## 担当範囲

- **Yoshika (yoppii12)**: Issue作成・実装・PR作成まで
- **yutaide**: レビュー・マージ・Issueクローズ
- YoshikaはPR作成後にマージ操作を行わない。マージ・Issueクローズは yutaide が行う。

## 作業フロー

1. **Issue を立てる**（作業前に必ず。Issueなしでのブランチ作成はしない）
2. **`dev` ブランチから作業ブランチを切る**（`main` からではなく必ず `dev` から）
3. **実装・コミット**
4. **動作確認を Yoshika が実施してから PR を作成する**（確認前の PR 作成は禁止）
5. **PR作成後、Slack で yutaide にレビュー依頼**

> `dev` への直接 push は絶対禁止。スコープ外の変更（依存関係更新・`.gitignore`・CLAUDE.md 等）も必ず PR 経由でマージする。

## 作業開始前の確認（必須）

会話を再開したとき、または新しいブランチ作成・実装を始めるときは、必ず devブランチの最新状態を確認する。

```bash
git fetch origin dev
git log HEAD..origin/dev --oneline
```

差分がある場合はリベースが必要かどうかをユーザーに伝える。

## ブランチ切り替え前の確認（必須）

追跡ファイル（既存ファイルへの変更）が未コミットの状態でブランチを切り替えると変更が消える。

- ブランチ切り替え前は必ず `git status` で未コミット変更を確認する
- 追跡ファイルに変更を加えたらすぐ WIP コミットする（`git commit -m "wip: ..."` でよい）
- どうしてもコミットできない場合は `git stash push -u -m "説明"` でスタッシュしてから切り替える

## PR 作成ルール

### PRのbody

PR作成時は body に以下を必ず含める：

- **Context**: なぜこの変更が必要か、調査で判明したこと
- **変更ファイル一覧**: 各ファイルの変更内容
- **Summary / Test plan**
- **Closes #XX**（対応IssueのNo.）

### PRのスコープ

PRには対象Issueに直接関係する変更のみを含める。`.gitignore` の修正・依存関係の更新・リファクタなどスコープ外の変更は別PRで対応する。

## PR作成後のワークフロー（必須）

### 1. Slack通知

PRを作成したら、下記チャンネルに新規スレッドで投稿する。

- **チャンネル**: C07GLRQS477
- **メンション**: `<@UFU54AXQX>`（`@` を忘れずに）
- **内容**: 確認依頼・対象IssueのNo.・PRリンク

### 2. Before/After スクリーンショット

UIに変更がある場合、PR作成時にスクリーンショットを撮影してPRコメントに掲載すること。

- **撮影スクリプト**: `scripts/screenshot.mjs`（`.gitignore` 済み・コミット不可）
  ```bash
  PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH" node scripts/screenshot.mjs /path/to/page after.png
  ```
  - テストアカウント: `korehasuteakananndesuyo@gmail.com` / `8822jkyHY`
- スクリーンショットはリポジトリのツリーに含めない
- imgBB の無料 API で画像をアップロードして URL を取得し、PRコメントに埋め込む：
  ```bash
  URL=$(curl -s -X POST "https://api.imgbb.com/1/upload" \
    --form "key=$(cat .imgbb-key)" \
    --form "image=@/path/to/image.png" | \
    python3 -c "import sys,json; print(json.load(sys.stdin)['data']['url'])")
  ```

## ドキュメント同期ルール

動作確認中に細かな修正（UI調整・スタイル変更など）を行った場合は、必ず以下を同期させる：

- Issue の説明文を更新する
- PR の body を更新する（`gh pr edit <number> --body "..."` 等）

コードを修正した直後に都度実施すること（PR作成時にまとめてではなく）。

## セキュリティ

### MOCK_AUTH の扱い

`src/server/auth.ts` に追加した `MOCK_AUTH` による認証バイパスコードはフロントエンド動作確認専用の一時的な抜け道。コミット前に必ず削除すること。`.env.local` の `MOCK_AUTH` 行も同様。

## GitHub・ツール

- GitHub とのやり取りには `gh` コマンドを使用する（このリポジトリは GitHub）
- Issueタイトルは英語・簡潔に記述する（本文は日本語でOK）
