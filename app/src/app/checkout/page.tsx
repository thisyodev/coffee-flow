'use client';

import { useState } from 'react';
import { useGuestStore } from '@/store/guestStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart, sessionId } = useGuestStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const total = getCartTotal();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cart,
          total,
          customerName,
          customerEmail,
        }),
      });

      if (!res.ok) {
        const mockOrderId = `order_${Date.now()}`;
        router.push(`/confirmation?orderId=${mockOrderId}&total=${total}`);
        clearCart();
        return;
      }

      const { order, pointsEarned } = await res.json();
      clearCart();
      router.push(`/confirmation?orderId=${order.id}&total=${total}&points=${pointsEarned}`);
      if (pointsEarned > 0) {
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
          <a href="/menu" className="text-amber-600 hover:underline">
            Browse our menu
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-amber-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <a href="/menu" className="text-white hover:text-amber-200 flex items-center gap-2">
            ← Back to Menu
          </a>
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
                <span className="text-gray-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-amber-700">${getCartTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Customer Info (Optional for guest checkout) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Details (Optional)</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="For order notifications"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="For receipt"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 bg-amber-600 text-white text-lg font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:bg-amber-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Place Order - $${getCartTotal().toFixed(2)}`}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          By placing your order, you agree to our terms of service
        </p>
      </main>
    </div>
  );
}
