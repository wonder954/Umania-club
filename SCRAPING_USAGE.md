# JRAスクレイピング機能 使い方ガイド

## 概要

完全無料構成のJRAスクレイピングシステムです。手動でAPIを叩くことで、JRAの重賞レース情報をFirestoreに保存できます。

## セットアップ

### 1. 依存関係インストール

```bash
npm install puppeteer
```

### 2. 環境変数設定（オプション）

`.env.local` に追加：

```bash
# 管理APIの保護（本番環境推奨）
ADMIN_TOKEN=your-secret-token-here

# Base URL（本番環境のみ）
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 使い方

### スクレイピング実行

#### 方法1: ブラウザでアクセス

```
http://localhost:3000/api/admin/update-races
```

#### 方法2: curlコマンド

```bash
# 認証なし（開発環境）
curl http://localhost:3000/api/admin/update-races

# 認証あり（本番環境）
curl -H "Authorization: Bearer your-secret-token-here" \
  https://your-domain.com/api/admin/update-races
```

#### 方法3: Postman / Insomnia

- Method: `GET`
- URL: `http://localhost:3000/api/admin/update-races`
- Headers: `Authorization: Bearer your-secret-token-here` (本番のみ)

### レスポンス例

```json
{
  "success": true,
  "message": "Successfully scraped and saved 3 races",
  "races": [
    {
      "id": "20240121_根岸ステークス",
      "name": "根岸ステークス",
      "date": "2024-01-21",
      "course": "東京",
      "horsesCount": 16
    }
  ],
  "duration": 45231
}
```

## API エンドポイント

### 1. レース一覧取得

```
GET /api/races
```

レスポンス: `RaceDetail[]`

### 2. レース詳細取得

```
GET /api/races/{raceId}
```

レスポンス: `RaceDetail`

### 3. スクレイピング実行（管理者専用）

```
GET /api/admin/update-races
```

Headers: `Authorization: Bearer {ADMIN_TOKEN}` (本番のみ)

## データ構造

### RaceDetail

```typescript
{
  id: string;
  name: string;
  date: string;
  course: string;
  distance: number;
  grade: string;
  hasNumbers: boolean;
  horses: Horse[];
  updatedAt?: Date;
}
```

### Horse

```typescript
{
  id: string;
  name: string;
  jockey: string;
  frame: number | null;    // 枠番（確定後のみ）
  number: number | null;   // 馬番（確定後のみ）
  odds: number | null;     // オッズ（確定後のみ）
}
```

## 実行タイミング

JRA公式の更新タイミングに合わせて手動実行：

| 曜日 | 時刻 | 内容 |
|-----|-----|-----|
| 木曜 | 16:30以降 | 馬番号なし出馬表 |
| 金曜 | 10:30以降 | 土曜重賞の馬番号あり |
| 土曜 | 10:30以降 | 日曜重賞の馬番号あり |

## トラブルシューティング

### Puppeteerがインストールできない

```bash
# プロキシ設定
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port

# または直接Chromiumをスキップ
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer
```

### タイムアウトエラー

`lib/scraper.ts` の `timeout` 値を増やす：

```typescript
await page.goto(url, {
  waitUntil: 'networkidle0',
  timeout: 60000, // 30000 → 60000
});
```

### Vercelでデプロイ時のエラー

Vercel環境では以下が必要：

```bash
npm install @sparticuz/chromium puppeteer-core
```

`lib/scraper.ts` が自動的にVercel環境を検出して `@sparticuz/chromium` を使用します。

### JRAサイトの構造変更

JRAのHTMLが変わった場合、`lib/scraper.ts` 内のセレクタを更新：

```typescript
// 例：レースリンクのセレクタ変更
const raceLinks = document.querySelectorAll('新しいセレクタ');
```

## セキュリティ

### 本番環境での保護

**必ず `ADMIN_TOKEN` を設定してください：**

```bash
# .env.local
ADMIN_TOKEN=ランダムな長い文字列
```

認証なしで公開すると、誰でもスクレイピングを実行できてしまいます。

### Firestore セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /races/{raceId} {
      // 読み取りは誰でも可能
      allow read: if true;
      
      // 書き込みは認証済みユーザーのみ
      allow write: if request.auth != null;
    }
  }
}
```

## コスト

**完全無料**（Firebase無料枠内）

- Firestore読み書き: 50k/日まで無料
- Puppeteer実行: サーバー負荷のみ
- Vercel: Hobbyプランで十分

## 次のステップ

1. スクレイピングを実行してデータ取得
2. レース一覧ページでFirestoreデータを表示
3. レース詳細ページで馬情報を表示
4. 定期実行したい場合はGitHub Actionsなどを検討
