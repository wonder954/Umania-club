/**
 * distance の正規化（"2000m" → 2000 など）
 * saveRaceData / saveRaceToFirestore の両方から使える
 */

export function normalizeDistance(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return raw;

  const num = parseInt(String(raw).replace(/m/i, '').trim(), 10);
  return Number.isFinite(num) ? num : null;
}