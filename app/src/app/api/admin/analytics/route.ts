import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  if (!session) return NextResponse.json(null, { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '7d';

  const daysMap: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[range] ?? 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [ordersRes, itemsRes, totalRes, usersRes] = await Promise.all([
    // Daily order counts
    supabaseAdmin
      .from('orders')
      .select('created_at, total, status')
      .gte('created_at', since)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true }),

    // Top products
    supabaseAdmin
      .from('order_items')
      .select('quantity, price, product:products(name, category)')
      .gte('created_at', since),

    // All-time totals
    supabaseAdmin
      .from('orders')
      .select('total')
      .neq('status', 'cancelled'),

    // New users
    supabaseAdmin
      .from('users')
      .select('id')
      .gte('created_at', since),
  ]);

  const orders = ordersRes.data ?? [];
  const items = itemsRes.data ?? [];
  const allOrders = totalRes.data ?? [];
  const newUsers = usersRes.data ?? [];

  // Revenue by day
  const revenueByDay: Record<string, number> = {};
  const ordersByDay: Record<string, number> = {};
  for (const o of orders) {
    const day = o.created_at.slice(0, 10);
    revenueByDay[day] = (revenueByDay[day] ?? 0) + Number(o.total);
    ordersByDay[day] = (ordersByDay[day] ?? 0) + 1;
  }

  const dailyStats = Object.keys(revenueByDay).sort().map((date) => ({
    date,
    revenue: Math.round(revenueByDay[date] * 100) / 100,
    orders: ordersByDay[date] ?? 0,
  }));

  // Top products
  const productMap: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  for (const item of items) {
    const p = item.product as unknown as { name: string; category: string } | null;
    if (!p) continue;
    if (!productMap[p.name]) productMap[p.name] = { name: p.name, category: p.category, qty: 0, revenue: 0 };
    productMap[p.name].qty += item.quantity;
    productMap[p.name].revenue += item.quantity * Number(item.price);
  }
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  const periodRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const allTimeRevenue = allOrders.reduce((s, o) => s + Number(o.total), 0);

  return NextResponse.json({
    summary: {
      periodRevenue: Math.round(periodRevenue * 100) / 100,
      periodOrders: orders.length,
      allTimeRevenue: Math.round(allTimeRevenue * 100) / 100,
      allTimeOrders: allOrders.length,
      newUsers: newUsers.length,
      avgOrderValue: orders.length ? Math.round((periodRevenue / orders.length) * 100) / 100 : 0,
    },
    dailyStats,
    topProducts,
  });
}
