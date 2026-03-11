# Umania-club

競馬ファンのための予想投稿 × SNSシェア × コミュニティアプリ  
Built with Next.js, Firebase, and ❤️

cd scripts/scraper
npx tsx run-weekly.ts    # 月〜木
npx tsx run-friday.ts    # 金曜
firebase deploy --only firestore:rules
npx tsx scripts/run-weekly.ts


## Features
- SNSシェア画像生成
- レースデータ自動取得（スクレイピング）

## 今後の計画
今のアプリに必要な課題一覧（完全版）

🔐 ユーザー機能
- 投稿の永続化
- 的中履歴の保存
🏇 データ基盤
- run-friday の完全自動化
- scraper の安定化
- レースデータのキャッシュ・インデックス化

- Firestore 本番プロジェクト作成
- .env を本番用に
- デプロイ（最後）
-　UIキットの作成

グループ機能

A. グループ作成画面の UI を作る
（名前入力 → 作成 → 招待リンク生成）
B. 招待リンクページ（invite page）を作る
（URL → コード入力 → 参加）
C. 投稿フォームに「グループ限定」を追加する
D. 投稿一覧でグループ投稿をフィルタリングする
E. 投稿詳細に「LINE共有」ボタンを追加する

かなりここ苦労しました
firebaseのルールの権限の部分だよね

グループの投稿表示がない。デフォルトアイコン、名無し問題。招待リンクページの参加ボタンが押せない。