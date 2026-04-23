'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LineLoginButton from '@/components/LineLoginButton';

const ERROR_MESSAGES: Record<string, string> = {
  line_denied: 'LINE login was cancelled.',
  missing_params: 'Invalid login request. Please try again.',
  invalid_state: 'Security check failed. Please try again.',
  db_error: 'Could not save your account. Please try again.',
  auth_failed: 'Login failed. Please try again.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get('error');
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-amber-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-4">
          <a href="/menu" className="text-white hover:text-amber-200">← Back to Menu</a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">☕</div>
            <h1 className="text-3xl font-bold text-gray-800">Coffee Flow</h1>
            <p className="text-gray-500 mt-2">Sign in to earn points & rewards</p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {errorMessage}
            </div>
          )}

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
              Member Login
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Connect with LINE to access your loyalty points, order history, and exclusive rewards.
            </p>

            <LineLoginButton />

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-3">Don&apos;t want to sign in?</p>
              <a
                href="/menu"
                className="text-sm text-amber-600 hover:underline font-medium"
              >
                Continue as Guest
              </a>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Member Benefits</h3>
            <ul className="space-y-3">
              {[
                { icon: '⭐', text: 'Earn points on every order' },
                { icon: '🏆', text: 'Bronze, Silver & Gold tiers' },
                { icon: '🎁', text: 'Exclusive discounts & free drinks' },
                { icon: '📱', text: 'Order status via LINE notifications' },
              ].map((benefit) => (
                <li key={benefit.text} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">{benefit.icon}</span>
                  {benefit.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginContent />
    </Suspense>
  );
}
