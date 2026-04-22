import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error || !data) {
    return NextResponse.json(null, { status: 404 });
  }

  // Also fetch queue position
  const { data: kds } = await supabaseAdmin
    .from('kds_orders')
    .select('queue_position, status')
    .eq('order_id', orderId)
    .maybeSingle();

  return NextResponse.json({ ...data, kds_queue_position: kds?.queue_position ?? null });
}
