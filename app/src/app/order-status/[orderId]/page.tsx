'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Order, OrderItem, Product } from '@/types';
import { formatDistanceToNow } from 'date-fns';

type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[];
};

const STATUS_STEPS = ['pending', 'preparing', 'ready', 'picked_up'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Received',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '📋',
  preparing: '☕',
  ready: '✅',
  picked_up: '🎉',
  cancelled: '❌',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: 'We\'ve received your order and will start preparing it shortly.',
  preparing: 'Your order is being prepared by our baristas.',
  ready: 'Your order is ready! Please come to the counter.',
  picked_up: 'Enjoy your order! Thank you for visiting Coffee Flow.',
  cancelled: 'This order has been cancelled.',
};

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}`);
    if (!res.ok) {
      setError('Order not found');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrder(data as OrderWithItems);
    setQueuePosition(data.kds_queue_position ?? null);
    setLastUpdated(new Date());
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();

    // Real-time: re-fetch via API when order changes
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        () => fetchOrder()
      )
      .subscribe();

    // Polling fallback every 30 seconds
    const interval = setInterval(fetchOrder, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [fetchOrder, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find this order.</p>
          <a href="/menu" className="text-amber-600 hover:underline">Back to Menu</a>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-amber-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/menu" className="text-white hover:text-amber-200">← Menu</a>
          <a href="/orders" className="text-white hover:text-amber-200 text-sm">My Orders</a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Status Hero */}
        <div className={`rounded-xl p-8 text-center mb-6 ${isCancelled ? 'bg-red-50' : 'bg-white'} shadow-md`}>
          <div className="text-5xl mb-3">{STATUS_ICONS[order.status] || '☕'}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {STATUS_LABELS[order.status] || order.status}
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            {STATUS_DESCRIPTIONS[order.status]}
          </p>
          <div className="text-xs text-gray-400">
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
        </div>

        {/* Queue position */}
        {queuePosition && order?.status !== 'picked_up' && order?.status !== 'cancelled' && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-gray-600">Queue position</span>
            <span className="text-2xl font-bold text-amber-700">#{queuePosition}</span>
          </div>
        )}

        {/* Progress Steps */}
        {!isCancelled && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isActive = index === currentStepIndex;

                return (
                  <div key={step} className="flex-1 flex flex-col items-center">
                    {/* Connector line before */}
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div className={`flex-1 h-1 ${index <= currentStepIndex ? 'bg-amber-500' : 'bg-gray-200'}`} />
                      )}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                          isActive
                            ? 'bg-amber-600 text-white ring-4 ring-amber-200'
                            : isCompleted
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted && !isActive ? '✓' : index + 1}
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-1 ${index < currentStepIndex ? 'bg-amber-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center leading-tight ${isActive ? 'text-amber-700 font-semibold' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="text-gray-700 font-mono text-xs">{orderId.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Placed</span>
              <span className="text-gray-700">
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>Total</span>
              <span className="text-amber-700">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Items</h2>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.product?.name || 'Item'} × {item.quantity}
                  </span>
                  <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href="/orders"
            className="flex-1 py-3 border-2 border-amber-600 text-amber-600 text-center font-medium rounded-lg hover:bg-amber-50 transition-colors"
          >
            View All Orders
          </a>
          <a
            href="/menu"
            className="flex-1 py-3 bg-amber-600 text-white text-center font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Order Again
          </a>
        </div>
      </main>
    </div>
  );
}
