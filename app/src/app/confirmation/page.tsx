'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const total = parseFloat(searchParams.get('total') || '0');
  const pointsEarned = parseInt(searchParams.get('points') || '0');
  const pointsRedeemed = parseInt(searchParams.get('redeemed') || '0');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [orderDate, setOrderDate] = useState<string | null>(null);

  useEffect(() => {
    setOrderNumber(Math.floor(Math.random() * 9000) + 1000);
    setOrderDate(new Date().toLocaleString());
  }, []);

  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${orderNumber}`,
  });

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No order found</h2>
          <a href="/menu" className="text-amber-600 hover:underline">
            Start a new order
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-green-500 text-white py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
          <p className="text-green-100">Thank you for your order</p>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 -mt-6">
        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-2xl font-bold text-gray-800">#{orderNumber ?? '...'}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="text-gray-800">{orderDate ?? '...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="text-green-600 font-medium">Confirmed</span>
            </div>
            {pointsRedeemed > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Points Used</span>
                <span className="font-medium">-{pointsRedeemed} pts (-${(pointsRedeemed / 100).toFixed(2)})</span>
              </div>
            )}
            {pointsEarned > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Points Earned</span>
                <span className="font-medium">+{pointsEarned} pts</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t">
              <span className="text-gray-800 font-medium">Total Paid</span>
              <span className="text-xl font-bold text-amber-700">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <div className="text-4xl mb-2">☕</div>
            <h3 className="font-semibold text-gray-800">Estimated Wait Time</h3>
            <p className="text-2xl font-bold text-amber-700">5-10 min</p>
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Receipt</h2>

          <div ref={receiptRef} className="bg-gray-50 p-4 rounded-lg text-sm">
            <div className="text-center border-b pb-3 mb-3">
              <h3 className="font-bold text-lg">Coffee Flow</h3>
              <p className="text-gray-500">123 Coffee Street</p>
              <p className="text-gray-500">Order #{orderNumber ?? '...'}</p>
              <p className="text-gray-500">{orderDate}</p>
            </div>
            <div className="border-b pb-3 mb-3">
              <p className="text-center text-gray-600">Thank you for your order!</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">Total: ${total.toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="w-full mt-4 py-3 border-2 border-amber-600 text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <a
            href={`/order-status/${orderId}`}
            className="flex-1 px-6 py-3 border-2 border-amber-600 text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors text-center"
          >
            Track Order
          </a>
          <a
            href="/menu"
            className="flex-1 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors text-center"
          >
            Order Again
          </a>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
