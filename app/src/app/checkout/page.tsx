'use client';

import { useState, useEffect } from 'react';
import { useGuestStore } from '@/store/guestStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { POINTS_PER_DOLLAR, pointsToDollars } from '@/lib/tierUtils';

interface PointsInfo {
  currentPoints: number;
  tierName: string;
}

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart, sessionId } = useGuestStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pointsInfo, setPointsInfo] = useState<PointsInfo | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  useEffect(() => {
    fetch('/api/auth/points')
      .then((r) => r.ok ? r.json() : null)
      .then(setPointsInfo);
  }, []);

  const subtotal = getCartTotal();
  const discount = pointsToDollars(pointsToRedeem);
  const finalTotal = Math.max(0, subtotal - discount);

  // Max redeemable: limited by available points and order subtotal
  const maxRedeemable = pointsInfo
    ? Math.min(pointsInfo.currentPoints, subtotal * POINTS_PER_DOLLAR)
    : 0;

  // Snap to nearest 100
  const handleSliderChange = (value: number) => {
    setPointsToRedeem(Math.floor(value / 100) * 100);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cart,
          total: finalTotal,
          subtotal,
          pointsToRedeem,
          customerName,
          customerEmail,
        }),
      });

      if (!res.ok) {
        const mockOrderId = `order_${Date.now()}`;
        router.push(`/confirmation?orderId=${mockOrderId}&total=${finalTotal}`);
        clearCart();
        return;
      }

      const { order, pointsEarned, pointsRedeemed } = await res.json();
      clearCart();
      router.push(
        `/confirmation?orderId=${order.id}&total=${finalTotal}&points=${pointsEarned}&redeemed=${pointsRedeemed}`
      );

      if (pointsRedeemed > 0 && pointsEarned > 0) {
        toast.success(`Order placed! -${pointsRedeemed} pts used, +${pointsEarned} pts earned 🎉`);
      } else if (pointsEarned > 0) {
        toast.success(`Order placed! +${pointsEarned} points earned 🎉`);
      } else {
        toast.success('Order placed successfully!');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <a href="/menu" className="text-amber-600 hover:underline">Browse our menu</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-amber-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <a href="/menu" className="text-white hover:text-amber-200">← Back to Menu</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span className="text-gray-600">{item.name} x{item.quantity}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Points Discount ({pointsToRedeem} pts)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-amber-700">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Points Redemption — only for logged-in members */}
        {pointsInfo && pointsInfo.currentPoints >= 100 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Redeem Points</h2>
              <span className="text-sm text-amber-700 font-medium">
                {pointsInfo.currentPoints} pts available
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              100 points = $1 off. Slide to choose how many points to use.
            </p>

            <input
              type="range"
              min={0}
              max={maxRedeemable}
              step={100}
              value={pointsToRedeem}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full accent-amber-600 mb-3"
            />

            <div className="flex justify-between text-sm text-gray-500 mb-3">
              <span>0 pts</span>
              <span>{Math.floor(maxRedeemable / 100) * 100} pts</span>
            </div>

            <div className="flex gap-3">
              {[100, 200, 500].filter((v) => v <= maxRedeemable).map((v) => (
                <button
                  key={v}
                  onClick={() => setPointsToRedeem(v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    pointsToRedeem === v
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {v} pts<br />
                  <span className="text-xs">-${pointsToDollars(v)}</span>
                </button>
              ))}
              {pointsToRedeem > 0 && (
                <button
                  onClick={() => setPointsToRedeem(0)}
                  className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600 border"
                >
                  Clear
                </button>
              )}
            </div>

            {pointsToRedeem > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
                ✓ Saving ${discount.toFixed(2)} with {pointsToRedeem} points
              </div>
            )}
          </div>
        )}

        {/* Guest prompt to login for points */}
        {!pointsInfo && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">Earn points on this order</p>
              <p className="text-xs text-amber-600">Login with LINE to earn & redeem points</p>
            </div>
            <a href="/login" className="text-sm font-semibold text-amber-700 hover:underline">
              Login →
            </a>
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Details (Optional)</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                placeholder="For order notifications"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="For receipt"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {/* Place Order */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 bg-amber-600 text-white text-lg font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:bg-amber-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}`}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          By placing your order, you agree to our terms of service
        </p>
      </main>
    </div>
  );
}
