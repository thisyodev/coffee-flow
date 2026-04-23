import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-5xl font-bold text-amber-600 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8 text-sm">
          Looks like this page wandered off. Let&apos;s get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/menu"
            className="px-5 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Browse Menu
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 border border-amber-600 text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
