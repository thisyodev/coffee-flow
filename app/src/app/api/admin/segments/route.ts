import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  if (!session) return NextResponse.json(null, { status: 401 });

  // Auto-compute segments from real data
  const [bronze, silver, gold, inactive] = await Promise.all([
    supabaseAdmin.from('user_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('tier:membership_tiers.name', 'Bronze'),
    supabaseAdmin.from('user_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('tier:membership_tiers.name', 'Silver'),
    supabaseAdmin.from('user_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('tier:membership_tiers.name', 'Gold'),
    supabaseAdmin.from('users')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const segments = [
    { id: 'bronze', name: 'Bronze Members', count: bronze.count ?? 0, description: 'Members with Bronze tier' },
    { id: 'silver', name: 'Silver Members', count: silver.count ?? 0, description: 'Members with Silver tier (1000+ pts)' },
    { id: 'gold',   name: 'Gold Members',   count: gold.count ?? 0,   description: 'Members with Gold tier (5000+ pts)' },
    { id: 'inactive', name: 'Inactive (30d)', count: inactive.count ?? 0, description: 'Members who joined 30+ days ago' },
  ];

  return NextResponse.json(segments);
}
