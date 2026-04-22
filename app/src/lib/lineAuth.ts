export const LINE_AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize';
export const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
export const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

export function getLineAuthUrl(state: string): string {
  const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID!;
  const redirectUri = getRedirectUri();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state,
  });

  return `${LINE_AUTH_URL}?${params.toString()}`;
}

export function getRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/api/auth/line/callback`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token?: string;
}> {
  const response = await fetch(LINE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: process.env.LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`LINE token exchange failed: ${response.status}`);
  }

  return response.json();
}

export async function getLineProfile(accessToken: string): Promise<{
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}> {
  const response = await fetch(LINE_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`LINE profile fetch failed: ${response.status}`);
  }

  return response.json();
}

export async function refreshLineToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch(LINE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`LINE token refresh failed: ${response.status}`);
  }

  return response.json();
}
