'use client';

import { useEffect, useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number | null;
  discount_code: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  segment: { name: string } | null;
}

interface Segment { id: string; name: string; count: number; description: string; }

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', description: '', discount_percentage: '', discount_code: '',
    start_date: '', end_date: '', segment_id: '',
  });

  const fetchData = async () => {
    const [c, s] = await Promise.all([
      fetch('/api/admin/campaigns').then((r) => r.json()),
      fetch('/api/admin/segments').then((r) => r.json()),
    ]);
    setCampaigns(Array.isArray(c) ? c : []);
    setSegments(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        discount_percentage: form.discount_percentage ? Number(form.discount_percentage) : null,
        segment_id: form.segment_id || null,
      }),
    });
    setShowForm(false);
    setForm({ name: '', description: '', discount_percentage: '', discount_code: '', start_date: '', end_date: '', segment_id: '' });
    fetchData();
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await fetch('/api/admin/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active }),
    });
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, is_active } : c));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Campaigns</h1>
          <p className="text-gray-500 text-sm">Manage promotions and LINE messaging</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
        >
          + New Campaign
        </button>
      </div>

      {/* Segments overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {segments.map((seg) => (
          <div key={seg.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{seg.name}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{seg.count}</p>
            <p className="text-xs text-gray-400 mt-1">{seg.description}</p>
          </div>
        ))}
      </div>

      {/* Campaign list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Campaign', 'Segment', 'Discount', 'Dates', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No campaigns yet</td></tr>
              ) : campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{c.name}</p>
                    {c.description && <p className="text-gray-400 text-xs">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.segment?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.discount_percentage ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {c.discount_percentage}% off
                      </span>
                    ) : '—'}
                    {c.discount_code && <p className="text-xs text-gray-400 mt-0.5">{c.discount_code}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.start_date ? new Date(c.start_date).toLocaleDateString() : '—'}
                    {c.end_date ? ` → ${new Date(c.end_date).toLocaleDateString()}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c.id, !c.is_active)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        c.is_active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create campaign modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">New Campaign</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Campaign name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <input placeholder="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Discount %" value={form.discount_percentage}
                  onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <input placeholder="Discount code" value={form.discount_code}
                  onChange={(e) => setForm({ ...form, discount_code: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Start date</label>
                  <input type="date" value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">End date</label>
                  <input type="date" value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
              </div>
              <select value={form.segment_id}
                onChange={(e) => setForm({ ...form, segment_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">All members</option>
                {segments.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.count})</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
