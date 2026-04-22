import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('kds_orders')
    .select(`
      id, order_id, status, queue_position, created_at,
      order:orders (
        id, total,
        order_items (
          id, quantity, price,
          product:products ( name )
        )
      )
    `)
    .in('status', ['pending', 'preparing', 'ready'])
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[KDS] Fetch error:', error.message);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function PATCH(request: NextRequest) {
  const { kdsId, orderId, newStatus } = await request.json();

  const kdsUpdate: Record<string, unknown> = {
    status: newStatus,
    ...(newStatus === 'ready'     ? { prepared_at:  new Date().toISOString() } : {}),
    ...(newStatus === 'picked_up' ? { picked_up_at: new Date().toISOString() } : {}),
  };

  const [kdsResult, orderResult] = await Promise.all([
    supabaseAdmin.from('kds_orders').update(kdsUpdate).eq('id', kdsId),
    supabaseAdmin.from('orders').update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', orderId),
  ]);

  if (kdsResult.error) {
    console.error('[KDS] Update error:', kdsResult.error.message);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
