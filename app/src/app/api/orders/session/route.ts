import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const userId = request.cookies.get('line_user_id')?.value;

  if (!sessionId && !userId) {
    return NextResponse.json([], { status: 200 });
  }

  let query = supabaseAdmin
    .from('orders')
    .select('id, created_at, total, points_earned, status, session_id, user_id')
    .order('created_at', { ascending: false })
    .limit(20);

  if (userId) {
    // Logged-in: show orders by user_id OR session_id (covers orders placed before login)
    query = query.or(`user_id.eq.${userId},session_id.eq.${sessionId ?? ''}`);
  } else {
    query = query.eq('session_id', sessionId!);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Orders/Session] Error:', error.message);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
