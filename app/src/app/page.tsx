import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <span className="text-6xl">☕</span>
        </div>

        <h1 className="text-5xl font-bold text-amber-800 mb-4">
          Coffee Flow
        </h1>

        <p className="text-xl text-amber-700 mb-8 max-w-lg mx-auto">
          Your favorite coffee, just a tap away. Order ahead, earn rewards, and skip the line.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/menu"
            className="px-8 py-4 bg-amber-600 text-white text-lg font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-lg"
          >
            Order Now →
          </Link>

          <Link
            href="/login"
            className="px-8 py-4 bg-white text-amber-700 text-lg font-semibold rounded-lg hover:bg-amber-50 transition-colors shadow border border-amber-200"
          >
            Sign In / Join
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-semibold text-gray-800 mb-2">Earn Rewards</h3>
              <p className="text-gray-600 text-sm">Join our loyalty program and earn points with every order</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-2">Skip the Line</h3>
              <p className="text-gray-600 text-sm">Order ahead and pick up your coffee when it's ready</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-800 mb-2">Easy Tracking</h3>
              <p className="text-gray-600 text-sm">Get real-time updates on your order status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-amber-800 text-amber-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>© 2026 Coffee Flow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
