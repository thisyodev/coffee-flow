import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { addPointsForOrder } from '@/lib/membership';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionId, cart, total, customerName, customerEmail } = body;

  if (!cart?.length || !total) {
    return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
  }

  // Get logged-in user from cookie
  const userId = request.cookies.get('line_user_id')?.value ?? null;

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      session_id: sessionId,
      user_id: userId,
      total,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('[Orders] Insert error:', orderError?.message);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  // Insert order items
  const orderItems = cart.map((item: { productId: string; quantity: number; price: number }) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price,
  }));

  await supabaseAdmin.from('order_items').insert(orderItems);

  // Auto-create KDS entry
  const { data: existingKds } = await supabaseAdmin
    .from('kds_orders')
    .select('id')
    .eq('order_id', order.id)
    .maybeSingle();

  if (!existingKds) {
    const { data: queueData } = await supabaseAdmin
      .from('kds_orders')
      .select('queue_position')
      .in('status', ['pending', 'preparing'])
      .order('queue_position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPosition = (queueData?.queue_position ?? 0) + 1;

    await supabaseAdmin.from('kds_orders').insert({
      order_id: order.id,
      status: 'pending',
      queue_position: nextPosition,
    });
  }

  // Award points if user is logged in
  let pointsEarned = 0;
  if (userId) {
    pointsEarned = await addPointsForOrder(userId, order.id, total);
  }

  return NextResponse.json({ order, pointsEarned });
}
