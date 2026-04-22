import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('line_user_id')?.value;

  if (!userId) {
    return NextResponse.json(null, { status: 401 });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select(`
      id,
      name,
      avatar_url,
      line_user_id,
      user_memberships (
        current_points,
        total_points_earned,
        tier:membership_tiers ( name, badge_color )
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !user) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('line_user_id');
  response.cookies.delete('line_access_token');
  return response;
}
