// Server-only: imports supabaseAdmin — do NOT import this in client components
// Use @/lib/tierUtils for client-safe pure functions
import { supabaseAdmin } from './supabaseAdmin';
import { getTierForPoints, calcPointsEarned } from './tierUtils';
import type { TierName } from './tierUtils';

export { TIER_THRESHOLDS, POINTS_MULTIPLIER, getTierForPoints, getPointsToNextTier, calcPointsEarned } from './tierUtils';
export type { TierName } from './tierUtils';

let tierCache: Record<string, string> | null = null;

async function getTierIdMap(): Promise<Record<string, string>> {
  if (tierCache) return tierCache;
  const { data } = await supabaseAdmin.from('membership_tiers').select('id, name');
  tierCache = Object.fromEntries((data ?? []).map((t) => [t.name, t.id]));
  return tierCache;
}

export async function updateMembershipTier(userId: string): Promise<void> {
  const { data: membership } = await supabaseAdmin
    .from('user_memberships')
    .select('total_points_earned')
    .eq('user_id', userId)
    .single();

  if (!membership) return;

  const tierName = getTierForPoints(membership.total_points_earned);
  const tierIds = await getTierIdMap();
  const tierId = tierIds[tierName];
  if (!tierId) return;

  await supabaseAdmin
    .from('user_memberships')
    .update({ tier_id: tierId, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
}

export async function addPointsForOrder(
  userId: string,
  orderId: string,
  orderTotal: number
): Promise<number> {
  const { data: membership } = await supabaseAdmin
    .from('user_memberships')
    .select('current_points, total_points_earned, tier:membership_tiers(name)')
    .eq('user_id', userId)
    .single();

  const tierName = (membership?.tier as { name: TierName } | null)?.name ?? 'Bronze';
  const pointsEarned = calcPointsEarned(orderTotal, tierName);

  await supabaseAdmin
    .from('user_memberships')
    .update({
      current_points: (membership?.current_points ?? 0) + pointsEarned,
      total_points_earned: (membership?.total_points_earned ?? 0) + pointsEarned,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  await supabaseAdmin
    .from('orders')
    .update({ points_earned: pointsEarned })
    .eq('id', orderId);

  await updateMembershipTier(userId);

  return pointsEarned;
}
