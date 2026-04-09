import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/deals - List all deals
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get('stage');

  let query = supabase
    .from('deals')
    .select('*, contact:contacts(id, name, company, initials, avatar_gradient)')
    .order('updated_at', { ascending: false });

  if (stage) {
    query = query.eq('stage', stage);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/deals - Create a deal
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, value, currency, stage, probability, contact_id, expected_close_date, notes, tags } = body;

  const { data, error } = await supabase
    .from('deals')
    .insert({
      user_id: user.id,
      title,
      value: value || 0,
      currency: currency || 'INR',
      stage: stage || 'lead',
      probability: probability || 0,
      contact_id: contact_id || null,
      expected_close_date: expected_close_date || null,
      notes: notes || null,
      tags: tags || [],
    })
    .select('*, contact:contacts(id, name, company, initials, avatar_gradient)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
