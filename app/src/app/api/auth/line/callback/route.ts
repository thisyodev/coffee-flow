import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getLineProfile } from '@/lib/lineAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // User denied LINE login
  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=line_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_params`);
  }

  // Verify CSRF state
  const storedState = request.cookies.get('line_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  try {
    // Exchange code for access token
    console.log('[LINE] Exchanging code for token...');
    const tokens = await exchangeCodeForToken(code);
    console.log('[LINE] Token received, expires_in:', tokens.expires_in);

    // Get LINE profile
    console.log('[LINE] Fetching profile...');
    const profile = await getLineProfile(tokens.access_token);
    console.log('[LINE] Profile:', profile.userId, profile.displayName);

    // Upsert user in Supabase
    const { data: user, error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          line_user_id: profile.userId,
          name: profile.displayName,
          avatar_url: profile.pictureUrl ?? null,
          line_access_token: tokens.access_token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'line_user_id' }
      )
      .select('id')
      .single();

    if (upsertError || !user) {
      console.error('User upsert error:', upsertError);
      return NextResponse.redirect(`${appUrl}/login?error=db_error`);
    }

    // Ensure user has a membership record
    const { error: membershipError } = await supabaseAdmin
      .from('user_memberships')
      .upsert(
        { user_id: user.id },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );

    if (membershipError) {
      console.error('Membership upsert error:', membershipError);
    }

    // Set session cookie
    const response = NextResponse.redirect(`${appUrl}/menu`);
    response.cookies.set('line_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    response.cookies.set('line_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    });
    // Clear CSRF state cookie
    response.cookies.delete('line_oauth_state');

    return response;
  } catch (err) {
    console.error('[LINE] Callback error:', err instanceof Error ? err.message : err);
    return NextResponse.redirect(`${appUrl}/login?error=auth_failed`);
  }
}
