import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/messages?conversation_id=xxx - Get messages for a conversation
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark messages as read
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('type', 'incoming')
    .eq('read', false);

  // Update conversation unread status
  await supabase
    .from('conversations')
    .update({ unread: false, unread_count: 0 })
    .eq('id', conversationId);

  return NextResponse.json(data);
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { conversation_id, text, type, channel, ai_generated } = body;

  if (!conversation_id || !text) {
    return NextResponse.json({ error: 'conversation_id and text are required' }, { status: 400 });
  }

  // Insert message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      user_id: user.id,
      type: type || 'outgoing',
      text,
      channel: channel || 'whatsapp',
      ai_generated: ai_generated || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update conversation's last message
  await supabase
    .from('conversations')
    .update({
      last_message_preview: text.substring(0, 100),
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversation_id);

  return NextResponse.json(message, { status: 201 });
}
