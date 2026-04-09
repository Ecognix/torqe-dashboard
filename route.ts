import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!openai) {
    return NextResponse.json({ 
      error: 'OpenAI API key not configured',
      fallback: true 
    }, { status: 503 });
  }

  const body = await request.json();
  const { conversation_id, messages, contact_name, channel } = body;

  // If conversation_id provided, fetch messages from DB
  let messageTexts = messages;
  if (conversation_id && !messages) {
    const { data } = await supabase
      .from('messages')
      .select('type, text, created_at')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });
    
    messageTexts = data?.map(m => `${m.type === 'incoming' ? contact_name || 'Contact' : 'You'}: ${m.text}`) || [];
  }

  if (!messageTexts || messageTexts.length === 0) {
    return NextResponse.json({ error: 'No messages to summarise' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are a CRM assistant. Summarise the following conversation concisely. Highlight: key topics, action items, sentiment, and recommended next steps. Use HTML formatting with <strong> tags for emphasis. Keep it under 150 words.' 
        },
        { 
          role: 'user', 
          content: `Summarise this ${channel || 'chat'} conversation with ${contact_name || 'the contact'}:\n\n${Array.isArray(messageTexts) ? messageTexts.join('\n') : messageTexts}` 
        },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    const summary = completion.choices[0]?.message?.content || 'Could not generate summary.';

    // Save summary to conversation if conversation_id provided
    if (conversation_id) {
      await supabase
        .from('conversations')
        .update({ ai_summary: summary })
        .eq('id', conversation_id);
    }

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Summarisation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
