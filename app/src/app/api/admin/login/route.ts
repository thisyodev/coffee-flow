import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  // Verify user exists in admin_users with matching Supabase auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Check admin_users table for role
  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('role, can_view_reports, can_view_analytics, can_manage_products, can_manage_campaigns')
    .eq('id', authData.user.id)
    .single();

  if (adminError || !adminUser) {
    return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 });
  }

  const sessionPayload = JSON.stringify({
    userId: authData.user.id,
    email: authData.user.email,
    role: adminUser.role,
    permissions: {
      canViewReports: adminUser.can_view_reports,
      canViewAnalytics: adminUser.can_view_analytics,
      canManageProducts: adminUser.can_manage_products,
      canManageCampaigns: adminUser.can_manage_campaigns,
    },
  });

  const response = NextResponse.json({ success: true, role: adminUser.role });
  response.cookies.set('admin_session', Buffer.from(sessionPayload).toString('base64'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
