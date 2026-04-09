import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPTS = {
  agent: `You are TorqeAI, an AI-powered CRM assistant for sales professionals. You help with:
- Summarising conversations
- Drafting replies matched to the user's tone
- Scheduling follow-ups
- Analysing contact engagement
- Smart send timing recommendations
- Vibe checks (mood/objection analysis)
- Tone rewrites

Be concise, professional, and actionable. Use bullet points and bold text (HTML <strong> tags) for key information. Always provide specific, data-driven recommendations when possible.`,

  negotiate: `You are a Negotiation Coach AI, helping sales professionals close more deals. You help with:
- Counter-offer strategies and pricing recommendations
- Close likelihood scoring with key signals
- Negotiation tactics (BATNA, anchoring, framing)
- Deal analysis and risk assessment
- Objection handling scripts
- Competitive positioning

Be strategic, data-driven, and specific. Use HTML formatting (<strong>, <br>, bullet points) for clear presentation. Always provide multiple options with pros/cons.`
};

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if OpenAI key is configured
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ 
      error: 'OpenAI API key not configured',
      fallback: true,
      message: 'AI features require an OpenAI API key. Add OPENAI_API_KEY to your .env.local file.'
    }, { status: 503 });
  }

  const body = await request.json();
  const { message, tab, conversation_context, model } = body;

  const systemPrompt = SYSTEM_PROMPTS[tab as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.agent;
  
  // Build context-aware prompt
  let contextPrompt = systemPrompt;
  if (conversation_context) {
    contextPrompt += `\n\nCurrent conversation context:\n- Contact: ${conversation_context.contact_name}\n- Channel: ${conversation_context.channel}\n- Priority: ${conversation_context.priority}\n- Recent messages: ${conversation_context.recent_messages || 'No recent messages'}`;
  }

  // Get recent chat history for context
  const { data: history } = await supabase
    .from('ai_chat_history')
    .select('role, content')
    .eq('user_id', user.id)
    .eq('tab', tab || 'agent')
    .order('created_at', { ascending: false })
    .limit(10);

  const chatHistory = (history || []).reverse().map(h => ({
    role: h.role as 'user' | 'assistant',
    content: h.content,
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o',
      messages: [
        { role: 'system', content: contextPrompt },
        ...chatHistory,
        { role: 'user', content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'I could not generate a response.';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Save to chat history
    await supabase.from('ai_chat_history').insert([
      { user_id: user.id, role: 'user', content: message, tab: tab || 'agent', model: model || 'gpt-4o' },
      { user_id: user.id, role: 'assistant', content: reply, tab: tab || 'agent', model: model || 'gpt-4o', tokens_used: tokensUsed },
    ]);

    return NextResponse.json({
      reply,
      tokens_used: tokensUsed,
      model: model || 'gpt-4o',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'AI request failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
