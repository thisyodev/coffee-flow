import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  if (!session) return NextResponse.json([], { status: 401 });

  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('id, role, can_view_reports, can_manage_products, can_view_analytics, can_manage_campaigns, created_at, user:users(name, email, avatar_url)')
    .order('created_at', { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  if (!session) return NextResponse.json(null, { status: 401 });

  const { email, role } = await request.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // Find user by email
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { error } = await supabaseAdmin
    .from('admin_users')
    .upsert({ id: user.id, role: role ?? 'staff' }, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
