'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import MembershipBadge from '@/components/MembershipBadge';
import TierBenefits from '@/components/TierBenefits';
import { TIER_THRESHOLDS } from '@/lib/tierUtils';

interface OrderHistory {
  id: string;
  created_at: string;
  total: number;
  points_earned: number;
  status: string;
}

export default function LoyaltyPage() {
  const { user, loading, membership } = useUser();
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders/history')
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">☕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Members Only</h2>
          <p className="text-gray-500 mb-6">Sign in with LINE to view your loyalty dashboard.</p>
          <a href="/login" className="inline-block px-6 py-3 bg-[#06C755] text-white font-semibold rounded-lg hover:bg-[#05b34c]">
            Login with LINE
          </a>
        </div>
      </div>
    );
  }

  const tierName = membership?.tier?.name ?? 'Bronze';
  const currentPoints = membership?.current_points ?? 0;
  const totalPoints = membership?.total_points_earned ?? 0;

  const tiers = ['Bronze', 'Silver', 'Gold'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-amber-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/menu" className="text-white hover:text-amber-200">← Menu</a>
          <h1 className="font-semibold">Loyalty</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Profile card */}
        <div className="bg-amber-700 text-white rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt={user.name ?? ''} width={56} height={56} className="rounded-full border-2 border-white/40" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-2xl font-bold">
                {user.name?.[0] ?? '?'}
              </div>
            )}
            <div>
              <p className="font-bold text-lg">{user.name}</p>
              <MembershipBadge tier={tierName} size="sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded-lg py-2">
              <p className="text-xl font-bold">{currentPoints.toLocaleString()}</p>
              <p className="text-xs text-amber-200">Available</p>
            </div>
            <div className="bg-white/10 rounded-lg py-2">
              <p className="text-xl font-bold">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-amber-200">Total Earned</p>
            </div>
            <div className="bg-white/10 rounded-lg py-2">
              <p className="text-xl font-bold">{orders.length}</p>
              <p className="text-xs text-amber-200">Orders</p>
            </div>
          </div>
        </div>

        {/* Tier benefits + progress */}
        <TierBenefits
          currentTier={tierName}
          currentPoints={currentPoints}
          totalPoints={totalPoints}
        />

        {/* Tier roadmap */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Tier Roadmap</p>
          <div className="space-y-3">
            {tiers.map((tier) => {
              const threshold = TIER_THRESHOLDS[tier as keyof typeof TIER_THRESHOLDS];
              const isActive = tier === tierName;
              const isUnlocked = totalPoints >= threshold;
              return (
                <div key={tier} className={`flex items-center justify-between p-3 rounded-lg ${isActive ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${isUnlocked ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {isUnlocked ? '✓' : '○'}
                    </span>
                    <MembershipBadge tier={tier} size="sm" />
                  </div>
                  <span className="text-xs text-gray-500">{threshold.toLocaleString()} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Points history */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Recent Orders & Points</p>
          {ordersLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No orders yet — start earning points!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      ${Number(order.total).toFixed(2)} order
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${order.points_earned > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {order.points_earned > 0 ? `+${order.points_earned} pts` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
