import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('line_user_id')?.value;
  if (!userId) return NextResponse.json([], { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, created_at, total, points_earned, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json([], { status: 500 });

  return NextResponse.json(data);
}
