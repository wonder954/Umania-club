# Firebase Admin SDK Service Account Key

このディレクトリに `serviceAccountKey.json` を配置してください。

## 取得方法

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクトを選択
3. ⚙️ → プロジェクトの設定
4. サービスアカウント タブ
5. 「新しい秘密鍵の生成」をクリック
6. ダウンロードしたファイルを `serviceAccountKey.json` にリネーム
7. このディレクトリに配置

## セキュリティ

**重要**: このファイルは絶対にGitにコミットしないでください！
`.gitignore` に追加済みです。

```
scripts/scraper/serviceAccountKey.json
```
