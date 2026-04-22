'use client';

import { useEffect, useState } from 'react';

export interface KdsOrder {
  id: string;
  order_id: string;
  status: 'pending' | 'preparing' | 'ready' | 'picked_up';
  queue_position: number | null;
  created_at: string;
  order: {
    id: string;
    total: number;
    order_items: {
      id: string;
      quantity: number;
      price: number;
      product: { name: string } | null;
    }[];
  };
}

interface KdsOrderCardProps {
  kdsOrder: KdsOrder;
  onStatusChange: (kdsId: string, newStatus: KdsOrder['status']) => void;
}

const STATUS_NEXT: Record<string, KdsOrder['status'] | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'picked_up',
  picked_up: null,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Picked Up',
  picked_up: '',
};

const CARD_COLORS: Record<string, string> = {
  pending: 'border-yellow-400 bg-yellow-50',
  preparing: 'border-blue-400 bg-blue-50',
  ready: 'border-green-400 bg-green-50',
  picked_up: 'border-gray-300 bg-gray-50',
};

const BUTTON_COLORS: Record<string, string> = {
  pending: 'bg-blue-600 hover:bg-blue-700',
  preparing: 'bg-green-600 hover:bg-green-700',
  ready: 'bg-gray-600 hover:bg-gray-700',
  picked_up: '',
};

function useElapsedTime(createdAt: string) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calc = () => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return { mins, secs, elapsed };
}

export default function KdsOrderCard({ kdsOrder, onStatusChange }: KdsOrderCardProps) {
  const { mins, secs, elapsed } = useElapsedTime(kdsOrder.created_at);
  const nextStatus = STATUS_NEXT[kdsOrder.status];
  const isUrgent = elapsed > 600 && kdsOrder.status !== 'picked_up'; // > 10 min

  return (
    <div className={`border-2 rounded-xl p-4 transition-all ${CARD_COLORS[kdsOrder.status]} ${isUrgent ? 'ring-2 ring-red-400 animate-pulse' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-lg font-bold text-gray-800">
            #{kdsOrder.order.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
        {/* Timer */}
        <div className={`text-right ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
          <p className="text-xl font-mono font-bold">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
          {isUrgent && <p className="text-xs">⚠️ Urgent</p>}
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-1 mb-4">
        {kdsOrder.order.order_items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span className="font-medium text-gray-800">
              {item.quantity}× {item.product?.name ?? 'Item'}
            </span>
            <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {kdsOrder.status}
        </span>
        {nextStatus && (
          <button
            onClick={() => onStatusChange(kdsOrder.id, nextStatus)}
            className={`text-sm text-white font-medium px-4 py-1.5 rounded-lg transition-colors ${BUTTON_COLORS[kdsOrder.status]}`}
          >
            {STATUS_LABELS[kdsOrder.status]}
          </button>
        )}
      </div>
    </div>
  );
}
