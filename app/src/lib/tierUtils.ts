// Pure tier utility functions — safe to import in client components

export const POINTS_PER_DOLLAR = 100;
export const pointsToDollars = (points: number) => Math.floor(points / POINTS_PER_DOLLAR);
export const dollarsToPoints = (dollars: number) => dollars * POINTS_PER_DOLLAR;

export const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 1000,
  Gold: 5000,
} as const;

export type TierName = keyof typeof TIER_THRESHOLDS;

export const POINTS_MULTIPLIER: Record<TierName, number> = {
  Bronze: 1,
  Silver: 1.5,
  Gold: 2,
};

export function getTierForPoints(points: number): TierName {
  if (points >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (points >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
}

export function getPointsToNextTier(points: number): number | null {
  if (points < TIER_THRESHOLDS.Silver) return TIER_THRESHOLDS.Silver - points;
  if (points < TIER_THRESHOLDS.Gold) return TIER_THRESHOLDS.Gold - points;
  return null;
}

export function calcPointsEarned(orderTotal: number, tierName: TierName): number {
  return Math.floor(orderTotal * POINTS_MULTIPLIER[tierName]);
}
