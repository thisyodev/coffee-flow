'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface StaffMember {
  id: string;
  role: string;
  can_view_reports: boolean;
  can_view_analytics: boolean;
  can_manage_products: boolean;
  can_manage_campaigns: boolean;
  created_at: string;
  user: { name: string | null; email: string | null; avatar_url: string | null } | null;
}

const ROLE_COLORS: Record<string, string> = {
  admin:   'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  staff:   'bg-blue-100 text-blue-700',
  customer:'bg-gray-100 text-gray-600',
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    const res = await fetch('/api/admin/staff');
    if (res.ok) setStaff(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) { setError(data.error); return; }
    setEmail('');
    fetchStaff();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <p className="text-gray-500 text-sm">Manage admin users and permissions</p>
      </div>

      {/* Add staff form */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Add Staff Member</h2>
        <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
          <input
            type="email" required placeholder="user@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-48 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={adding}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Staff list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Member', 'Role', 'Permissions', 'Added'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12">
                <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">No staff members yet</td></tr>
            ) : staff.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.user?.avatar_url ? (
                      <Image src={s.user.avatar_url} alt="" width={32} height={32} className="rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                        {s.user?.name?.[0] ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{s.user?.name ?? 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">{s.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[s.role] ?? ROLE_COLORS.staff}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs space-y-0.5">
                  {s.can_view_analytics && <p>✓ Analytics</p>}
                  {s.can_view_reports && <p>✓ Reports</p>}
                  {s.can_manage_products && <p>✓ Products</p>}
                  {s.can_manage_campaigns && <p>✓ Campaigns</p>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
