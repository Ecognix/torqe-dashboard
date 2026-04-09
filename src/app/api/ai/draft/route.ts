import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ 
      error: 'OpenAI API key not configured',
      fallback: true 
    }, { status: 503 });
  }

  const body = await request.json();
  const { conversation_id, messages, contact_name, channel, tone } = body;

  // Fetch messages if conversation_id provided
  let messageTexts = messages;
  if (conversation_id && !messages) {
    const { data } = await supabase
      .from('messages')
      .select('type, text, created_at')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });
    
    messageTexts = data?.map(m => `${m.type === 'incoming' ? contact_name || 'Contact' : 'You'}: ${m.text}`) || [];
  }

  const toneInstruction = tone 
    ? `Write in a ${tone} tone.` 
    : 'Write in a professional, warm, and concise tone.';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `You are a CRM assistant that drafts reply messages for sales professionals. ${toneInstruction} Keep the reply concise (under 80 words), natural, and appropriate for ${channel || 'chat'}. Do not include greetings like "Dear" for WhatsApp/chat channels. Do not use HTML tags - output plain text only.`
        },
        { 
          role: 'user', 
          content: `Draft a reply to ${contact_name || 'the contact'} based on this conversation:\n\n${Array.isArray(messageTexts) ? messageTexts.join('\n') : messageTexts || 'No prior messages - draft an introduction.'}` 
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const draft = completion.choices[0]?.message?.content || 'Could not generate draft.';

    return NextResponse.json({ draft });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Draft generation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
