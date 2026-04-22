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
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
