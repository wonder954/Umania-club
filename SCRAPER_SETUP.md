# JRAスクレイパー セットアップガイド

## ✅ 完了した構成

Puppeteerスクレイパーを **Next.jsから完全分離** しました。これによりビルドエラーが解消されます。

## 📁 新しいディレクトリ構造

```
scripts/scraper/          # ← Puppeteerスクレイパー（独立）
├── package.json          # 独自の依存関係
├── jra-scraper.js        # JRAスクレイピングロジック
├── firestore.js          # Firebase Admin SDK
├── scrape.js             # メインスクリプト
├── serviceAccountKey.json  # ← これを配置（手動）
└── README.md

app/api/admin/
└── trigger-scrape/
    └── route.ts          # スクレイパーを外部実行
```

---

## 🔧 セットアップ手順

### 1. スクレイパーの依存関係をインストール

```bash
cd scripts/scraper
npm install
```

これで `puppeteer` と `firebase-admin` がインストールされます。

### 2. Firebase サービスアカウントキーを取得

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクトを選択
3. ⚙️ → **プロジェクトの設定**
4. **サービスアカウント** タブ
5. 「**新しい秘密鍵の生成**」をクリック
6. ダウンロードしたJSONファイルを `serviceAccountKey.json` にリネーム
7. `scripts/scraper/` ディレクトリに配置

### 3. Next.jsプロジェクトルートに戻る

```bash
cd ../..
npm run dev
```

---

## 🚀 使い方

### 方法1: 直接実行（開発時）

```bash
cd scripts/scraper
node scrape.js
```

### 方法2: API経由（推奨）

```bash
# POST リクエスト
curl -X POST http://localhost:3000/api/admin/trigger-scrape

# 認証あり（本番環境）
curl -X POST \
  -H "Authorization: Bearer your-secret-token" \
  https://your-domain.com/api/admin/trigger-scrape
```

---

## 🔐 セキュリティ設定

### 環境変数に認証トークンを追加

`.env.local` に追加：

```bash
ADMIN_TOKEN=your-random-secret-token-here
```

これにより、API Route `/api/admin/trigger-scrape` が保護されます。

---

## 📊 実行結果の例

```json
{
  "success": true,
  "totalRaces": 3,
  "savedRaces": 3,
  "failedRaces": 0,
  "results": [
    {
      "id": "20240121_根岸ステークス",
      "name": "根岸ステークス",
      "horsesCount": 16
    }
  ],
  "duration": "45.23s"
}
```

---

## ✅ Next.jsビルド確認

スクレイパーを分離したので、Next.jsが正常にビルドできます：

```bash
npm run build
```

エラーが出なければ成功です！

---

## 🐛 トラブルシューティング

### Q: `serviceAccountKey.json` が見つからない
A: `scripts/scraper/README.md` の手順に従ってキーを配置してください

### Q: Puppeteerがインストールできない
A: `scripts/scraper/` ディレクトリ内で `npm install` を実行してください

### Q: Next.jsビルドでまだエラーが出る
A: `lib/` 配下にPuppeteer関連のimportがないか確認してください

### Q: APIから実行すると timeout
A: `route.ts` の `timeout` 値を増やすか、直接実行してください

---

## 📝 次のステップ

1. Firebase Console でサービスアカウントキーを取得
2. `scripts/scraper/` に配置
3. `cd scripts/scraper && npm install`
4. `node scrape.js` でテスト実行
5. Next.jsから `/api/admin/trigger-scrape` でAPI実行
6. Firestore Console でデータ確認

---

## 🎯 ベストプラクティス

- ✅ スクレイパーは `scripts/scraper/` に隔離
- ✅ Next.jsから直接importしない
- ✅ 外部プロセスとして実行
- ✅ Firebase Admin SDKで保存
- ❌ `lib/` にPuppeteerをimportしない
- ❌ API Routeで直接Puppeteerを使用しない
