'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import KdsOrderCard, { KdsOrder } from '@/components/KdsOrderCard';

const COLUMNS: { status: KdsOrder['status']; label: string; color: string }[] = [
  { status: 'pending',   label: '📋 New Orders', color: 'bg-yellow-100 border-yellow-300' },
  { status: 'preparing', label: '☕ Preparing',   color: 'bg-blue-100 border-blue-300' },
  { status: 'ready',     label: '✅ Ready',       color: 'bg-green-100 border-green-300' },
];

export default function KdsPage() {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/kds');
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  const handleStatusChange = async (kdsId: string, newStatus: KdsOrder['status']) => {
    const kdsOrder = orders.find((o) => o.id === kdsId);
    if (!kdsOrder) return;

    // Optimistic update
    setOrders((prev) =>
      newStatus === 'picked_up'
        ? prev.filter((o) => o.id !== kdsId)
        : prev.map((o) => o.id === kdsId ? { ...o, status: newStatus } : o)
    );

    await fetch('/api/kds', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kdsId, orderId: kdsOrder.order_id, newStatus }),
    });
  };

  useEffect(() => {
    fetchOrders();

    // Real-time: trigger re-fetch via API when kds_orders changes
    const channel = supabase
      .channel('kds-live')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'kds_orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const getColumn = (status: KdsOrder['status']) =>
    orders.filter((o) => o.status === status);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <h1 className="text-xl font-bold">Kitchen Display</h1>
              <p className="text-xs text-gray-400">Coffee Flow KDS</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-xs text-gray-400">
              <p>Updated {lastUpdated.toLocaleTimeString()}</p>
              <p>{orders.length} active order{orders.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLUMNS.map(({ status, label, color }) => {
              const col = getColumn(status);
              return (
                <div key={status} className={`border rounded-xl p-4 ${color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-800">{label}</h2>
                    <span className="bg-white text-gray-700 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                      {col.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {col.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">No orders</div>
                    ) : (
                      col.map((order) => (
                        <KdsOrderCard
                          key={order.id}
                          kdsOrder={order}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
