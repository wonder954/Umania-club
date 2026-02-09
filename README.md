# Umania-club

競馬ファンのための予想投稿 × SNSシェア × コミュニティアプリ  
Built with Next.js, Firebase, and ❤️

cd scripts/scraper
npx tsx run-weekly.ts    # 月〜木
npx tsx run-friday.ts    # 金曜

## Features
- 印・買い目・コメントの投稿
- レースごとの掲示板
- SNSシェア画像生成
- レースデータ自動取得（スクレイピング）

## 今後の計画
今のアプリに必要な課題一覧（完全版）

🔐 ユーザー機能
- ログイン
- 投稿の永続化
- 的中履歴の保存
🏇 データ基盤
- run-friday の完全自動化
- scraper の安定化
- レースデータのキャッシュ・インデックス化
