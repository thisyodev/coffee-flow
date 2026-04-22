'use client';

import { useEffect, useState } from 'react';
import { useGuestStore } from '@/store/guestStore';
import { Order } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  picked_up: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
};


export default function OrderHistoryPage() {
  const { sessionId } = useGuestStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const storedSessionId = sessionId || localStorage.getItem('guestSessionId');
      const params = storedSessionId ? `?sessionId=${encodeURIComponent(storedSessionId)}` : '';
      const res = await fetch(`/api/orders/session${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-amber-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/menu" className="text-white hover:text-amber-200">← Menu</a>
          <h1 className="font-semibold">My Orders</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">☕</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Your order history will appear here.</p>
            <a
              href="/menu"
              className="inline-block px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              Browse Menu
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''} from this device</p>

            {orders.map((order) => {
              const isActive = order.status === 'pending' || order.status === 'preparing' || order.status === 'ready';

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-xs text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {format(new Date(order.created_at), 'MMM d, yyyy')} ·{' '}
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">${Number(order.total).toFixed(2)}</span>
                      <a
                        href={`/order-status/${order.id}`}
                        className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                            : 'border border-amber-600 text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        {isActive ? 'Track Order' : 'View Details'}
                      </a>
                    </div>
                  </div>

                  {isActive && (
                    <div className="bg-amber-50 px-4 py-2 border-t border-amber-100">
                      <p className="text-xs text-amber-700 font-medium">
                        {order.status === 'ready' ? '✅ Ready for pickup!' : '⏳ In progress — tap Track to follow along'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
