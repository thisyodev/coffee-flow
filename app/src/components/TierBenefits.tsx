import MembershipBadge from './MembershipBadge';
import { TIER_THRESHOLDS, getPointsToNextTier } from '@/lib/tierUtils';

const TIER_BENEFITS: Record<string, string[]> = {
  Bronze: ['1 point per $1 spent', 'Order history access'],
  Silver: ['1.5 points per $1 spent', '5% discount on orders', 'Priority support'],
  Gold:   ['2 points per $1 spent', '10% discount on orders', 'Free drink every month', 'VIP priority'],
};

interface TierBenefitsProps {
  currentTier: string;
  currentPoints: number;
  totalPoints: number;
}

export default function TierBenefits({ currentTier, currentPoints, totalPoints }: TierBenefitsProps) {
  const pointsToNext = getPointsToNextTier(totalPoints);
  const nextTier = currentTier === 'Bronze' ? 'Silver' : currentTier === 'Silver' ? 'Gold' : null;

  const progressMax = currentTier === 'Bronze'
    ? TIER_THRESHOLDS.Silver
    : currentTier === 'Silver'
    ? TIER_THRESHOLDS.Gold - TIER_THRESHOLDS.Silver
    : 1;

  const progressVal = currentTier === 'Bronze'
    ? totalPoints
    : currentTier === 'Silver'
    ? totalPoints - TIER_THRESHOLDS.Silver
    : progressMax;

  const progressPct = Math.min(100, Math.round((progressVal / progressMax) * 100));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Current tier */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Your Tier</p>
          <MembershipBadge tier={currentTier} size="lg" />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Available Points</p>
          <p className="text-2xl font-bold text-amber-700">{currentPoints.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && pointsToNext !== null && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{currentTier}</span>
            <span>{nextTier} in {pointsToNext.toLocaleString()} pts</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor: currentTier === 'Bronze' ? '#C0C0C0' : '#FFD700',
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{progressPct}% to {nextTier}</p>
        </div>
      )}

      {currentTier === 'Gold' && (
        <div className="bg-yellow-50 rounded-lg px-4 py-2 mb-4 text-center text-sm text-yellow-700 font-medium">
          🏆 You&apos;re at the highest tier!
        </div>
      )}

      {/* Benefits list */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Your Benefits</p>
        <ul className="space-y-2">
          {(TIER_BENEFITS[currentTier] ?? []).map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-green-500 font-bold">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
