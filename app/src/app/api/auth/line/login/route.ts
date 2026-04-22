import { NextResponse } from 'next/server';
import { getLineAuthUrl } from '@/lib/lineAuth';

export async function GET() {
  // Random state to prevent CSRF
  const state = Math.random().toString(36).substring(2, 18);

  const authUrl = getLineAuthUrl(state);
  console.log('[LINE] Redirecting to auth URL:', authUrl);

  const response = NextResponse.redirect(authUrl);
  // Store state in cookie to verify on callback
  response.cookies.set('line_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}
