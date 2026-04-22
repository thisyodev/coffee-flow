'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Range = '1d' | '7d' | '30d' | '90d';

interface Analytics {
  summary: {
    periodRevenue: number;
    periodOrders: number;
    allTimeRevenue: number;
    allTimeOrders: number;
    newUsers: number;
    avgOrderValue: number;
  };
  dailyStats: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; category: string; qty: number; revenue: number }[];
}

const RANGE_LABELS: Record<Range, string> = {
  '1d': 'Today', '7d': '7 Days', '30d': '30 Days', '90d': '90 Days',
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [range, setRange] = useState<Range>('7d');
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState<'revenue' | 'orders'>('revenue');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [range]);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Date', 'Revenue', 'Orders'],
      ...data.dailyStats.map((d) => [d.date, d.revenue, d.orders]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coffee-flow-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm">Sales performance overview</p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                range === r ? 'bg-amber-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border text-gray-600 hover:bg-gray-50 ml-2"
          >
            ↓ CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { label: `Revenue (${RANGE_LABELS[range]})`, value: `$${data.summary.periodRevenue.toFixed(2)}`, color: 'text-amber-600' },
              { label: `Orders (${RANGE_LABELS[range]})`, value: data.summary.periodOrders, color: 'text-blue-600' },
              { label: 'Avg Order Value', value: `$${data.summary.avgOrderValue.toFixed(2)}`, color: 'text-green-600' },
              { label: 'New Members', value: data.summary.newUsers, color: 'text-purple-600' },
              { label: 'All-time Revenue', value: `$${data.summary.allTimeRevenue.toFixed(2)}`, color: 'text-gray-700' },
              { label: 'All-time Orders', value: data.summary.allTimeOrders, color: 'text-gray-700' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Daily Performance</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChart('revenue')}
                  className={`px-3 py-1 rounded text-sm ${chart === 'revenue' ? 'bg-amber-100 text-amber-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChart('orders')}
                  className={`px-3 py-1 rounded text-sm ${chart === 'orders' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Orders
                </button>
              </div>
            </div>
            {data.dailyStats.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.dailyStats} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => chart === 'revenue' ? [`$${value}`, 'Revenue'] : [value, 'Orders']}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                  <Bar
                    dataKey={chart}
                    fill={chart === 'revenue' ? '#d97706' : '#3b82f6'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Top Products</h2>
            {data.topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((p, i) => {
                  const maxQty = data.topProducts[0].qty;
                  return (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800">{p.name}</span>
                          <span className="text-gray-500">{p.qty} sold · ${p.revenue.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-amber-500"
                            style={{ width: `${(p.qty / maxQty) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
