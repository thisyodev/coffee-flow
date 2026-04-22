'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AdminSession {
  email: string;
  role: string;
}

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/staff',     label: 'Staff',     icon: '👥' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: '📣' },
  { href: '/kds',             label: 'KDS',       icon: '🍳', external: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    fetch('/api/admin/me')
      .then((r) => r.ok ? r.json() : null)
      .then(setSession);
  }, [pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-gray-700">
          <p className="font-bold text-amber-400">☕ Coffee Flow</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.external && <span className="ml-auto text-xs text-gray-500">↗</span>}
            </a>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700">
          {session && (
            <p className="text-xs text-gray-400 mb-2 truncate">{session.email}</p>
          )}
          <button
            onClick={logout}
            className="w-full text-sm text-gray-400 hover:text-white py-1.5 transition-colors text-left"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
