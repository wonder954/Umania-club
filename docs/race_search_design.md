# レース検索コンポーネント実装計画 (Draft)

## 1. UI / UX 構成案

### 配置
スマホ利用を想定し、**「ヘッダー直下」または「ページ上部の目立つ位置」**に「レースを検索する」ボタンまたはアコーディオンを配置し、タップで検索フォームを展開する形式を推奨します。常時表示すると画面を占有しすぎるためです。

### 検索フロー (3ステップ選択)
ドロップダウンを用いた絞り込み式UIを採用します。

1.  **Select Year**: [ 2026 ▼ ]
    *   デフォルトは現在の年(2026)
2.  **Select Month**: [ 2月 ▼ ]
     *   デフォルトは現在の月、または「選択なし」
     *   年を変えたらリセット
3.  **Radio/List Race**: [ 東京新聞杯 (2/8) ... ▼ ]
    *   年・月が確定した時点で該当レース一覧を表示
    *   リストからタップで決定

### 画面遷移
レースを選択した瞬間に、以下の挙動を選択できます：
*   **案A (モーダル展開)**: 今回の要件に近い。詳細をその場でModal表示。
*   **案B (ページ遷移)**: `/races/{id}` へ遷移。

今回は **案A (モーダル)** をベースとしつつ、将来的に案Bにも対応できる設計とします。

---

## 2. コンポーネント構成案

`components/search/` ディレクトリを新設し、以下のように分割します。

### `components/common/Select.tsx` (新規作成)
汎用的なセレクトボックス（Tailwindスタイリング済み）。
```tsx
type Props = {
  label?: string;
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (val: string | number) => void;
};
```

### `components/search/RaceSearchForm.tsx`
検索のメインコンテナ。状態管理（Year/Month/Raceの選択状態）を担当。
*   Props: `races: Race[]` (全データを受け取る)
*   State: `selectedYear`, `selectedMonth`

### `components/search/RaceResultList.tsx`
絞り込まれたレース一覧を表示するコンポーネント。
*   Props: `filteredRaces: Race[]`, `onSelect: (race: Race) => void`

### `components/search/RaceSearchSection.tsx`
`app/page.tsx` 等に配置するラッパー。モーダル制御などもここで行う。

---

## 3. データ処理ロジック

### フィルタリング
クライアントサイドで `Race[]` をフィルタします。

```typescript
// util hook or helper logic
const filteredRaces = useMemo(() => {
  return allRaces.filter(race => {
    const d = new Date(race.date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    
    if (selectedYear && y !== selectedYear) return false;
    if (selectedMonth && m !== selectedMonth) return false;
    
    // 詳細ID(10桁)があるものだけ表示という要件
    if (!/^\d{10}$/.test(race.id)) return false; 
    
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date)); // 日付順
}, [allRaces, selectedYear, selectedMonth]);
```

---

## 4. 将来の拡張性 (DB導入時)

現在の `RaceSearchForm` は `races` を Props で受け取っていますが、これを「データ取得層」と「UI層」に分離しておきます。

### 推奨設計: Container / Presentational パターン

*   **Logic (Hook)**: `useRaceSearch(allRaces)`
    *   フィルタロジックをここに閉じ込める。
    *   将来 DB になったら、この Hook の中身を「APIを叩いて検索結果を取得する」ロジックに差し替えるだけで UI はそのまま使える。
    *   もしくは `useSWR` / `react-query` で `/api/races?year=...` を叩く形に移行しやすい。

### コード例
```tsx
// useRaceSearch.ts
export function useRaceSearch(initialRaces: Race[]) {
  // 現状: クライアントサイドフィルタ
  // 将来: ここで API フェッチなどに変更可能
  const [conditions, setConditions] = useState({...});
  
  const results = useMemo(() => { ... }, [conditions]);
  
  return { conditions, setConditions, results };
}
```

---

## 具体的な実装ステップ

1.  `components/common/Select.tsx` の実装 (UIパーツ)
2.  `hooks/useRaceSearch.ts` の実装 (ロジック)
3.  `components/search/RaceSearchForm.tsx` の実装 (UI組み立て)
4.  `app/page.tsx` への配置と `RaceCard` モーダル連携

この設計で進めることを推奨します。
