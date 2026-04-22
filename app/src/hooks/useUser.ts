'use client';

import { useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  line_user_id: string | null;
  user_memberships: {
    current_points: number;
    total_points_earned: number;
    tier: { name: string; badge_color: string } | null;
  }[] | null;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    setUser(null);
    window.location.href = '/menu';
  };

  const membership = user?.user_memberships?.[0] ?? null;

  return { user, loading, logout, membership };
}
