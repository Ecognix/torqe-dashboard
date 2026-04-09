import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/conversations - List conversations with contact info
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'open';
  const priority = searchParams.get('priority');
  const unread = searchParams.get('unread');

  let query = supabase
    .from('conversations')
    .select('*, contact:contacts(*)')
    .eq('status', status)
    .order('last_message_at', { ascending: false });

  if (priority) {
    query = query.eq('priority', priority);
  }
  if (unread === 'true') {
    query = query.eq('unread', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/conversations - Create a conversation
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { contact_id, channel, subject, priority } = body;

  // Get contact for channel_label
  const { data: contact } = await supabase
    .from('contacts')
    .select('name, channel')
    .eq('id', contact_id)
    .single();

  const channelLabels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    gmail: 'Gmail',
    linkedin: 'LinkedIn',
    slack: 'Slack',
    instagram: 'Instagram',
    telegram: 'Telegram',
  };

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      contact_id,
      channel: channel || contact?.channel || 'whatsapp',
      channel_label: channelLabels[channel || contact?.channel || 'whatsapp'] || channel,
      subject: subject || null,
      priority: priority || 'normal',
    })
    .select('*, contact:contacts(*)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
