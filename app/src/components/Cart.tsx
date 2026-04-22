'use client';

import { useGuestStore } from '@/store/guestStore';
import Image from 'next/image';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useGuestStore();

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-gray-500">Your cart is empty</p>
        <p className="text-sm text-gray-400 mt-1">Add some delicious coffee!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Order</h2>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.productId} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
            {item.image_url ? (
              <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-xs">☕</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
              <p className="text-sm text-amber-700">${(item.price * item.quantity).toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                -
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-700"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeFromCart(item.productId)}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-xl font-bold text-gray-800">${getCartTotal().toFixed(2)}</span>
        </div>

        <a
          href="/checkout"
          className="block w-full py-3 bg-amber-600 text-white text-center rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          Proceed to Checkout
        </a>
      </div>
    </div>
  );
}
