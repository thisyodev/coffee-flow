import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('line_user_id')?.value;
  if (!userId) return NextResponse.json(null, { status: 401 });

  const { data } = await supabaseAdmin
    .from('user_memberships')
    .select('current_points, tier:membership_tiers(name)')
    .eq('user_id', userId)
    .single();

  if (!data) return NextResponse.json(null, { status: 404 });

  return NextResponse.json({
    currentPoints: data.current_points ?? 0,
    tierName: (data.tier as unknown as { name: string } | null)?.name ?? 'Bronze',
  });
}
