import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  if (!session) return NextResponse.json([], { status: 401 });

  const { data } = await supabaseAdmin
    .from('campaigns')
    .select('*, segment:customer_segments(name)')
    .order('created_at', { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  if (!session) return NextResponse.json(null, { status: 401 });

  const body = await request.json();
  const { name, description, discount_percentage, discount_code, start_date, end_date, segment_id } = body;

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .insert({ name, description, discount_percentage, discount_code, start_date, end_date, segment_id, is_active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  if (!session) return NextResponse.json(null, { status: 401 });

  const { id, is_active } = await request.json();
  const { error } = await supabaseAdmin
    .from('campaigns')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
