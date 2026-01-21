# Umania-club 環境変数設定ガイド

## Firebase設定が必要です

現在、Firebase の設定が完了していないため、投稿機能が動作しません。
以下の手順で設定を完了させてください。

## 設定手順

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: umania-club）
4. Google Analyticsは任意（スキップ可）

### 2. Webアプリの追加

1. プロジェクトのホーム画面で「ウェブ」アイコン（</>）をクリック
2. アプリのニックネームを入力（例: Umania Web App）
3. 「アプリを登録」をクリック
4. 表示されるFirebase SDKの設定値をメモ

### 3. Firestoreの有効化

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. **テストモード**で開始（開発用）
4. ロケーションは「asia-northeast1（東京）」を推奨

### 4. Authenticationの有効化

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「匿名」を有効化（トグルをON）
4. （オプション）「Google」も有効化

### 5. 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を記述：

\`\`\`bash
NEXT_PUBLIC_FIREBASE_API_KEY=あなたのAPIキー
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=あなたのプロジェクトID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=あなたのプロジェクトID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=あなたのプロジェクトID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=あなたの送信者ID
NEXT_PUBLIC_FIREBASE_APP_ID=あなたのアプリID
\`\`\`

**重要**: `.env.local` ファイルは `.gitignore` に含まれており、Gitにコミットされません。

### 6. 開発サーバーの再起動

\`\`\`bash
# サーバーを停止（Ctrl+C）
# 再度起動
npm run dev
\`\`\`

## 設定完了の確認

ブラウザのコンソールに以下のログが表示されれば成功です：
- `Firebase App Initialized: true`

エラーが出る場合：
- `.env.local` のキーが正しいか確認
- Firebaseプロジェクトの設定を見直す
- ブラウザをリロード

## 参考リンク

- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Next.js環境変数](https://nextjs.org/docs/basic-features/environment-variables)
