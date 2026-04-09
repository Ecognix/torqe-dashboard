import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET - WhatsApp webhook verification (Meta requires this)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'torqe_whatsapp_verify';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST - Receive incoming WhatsApp messages
export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    // Meta WhatsApp Cloud API webhook payload structure
    const entries = body.entry || [];
    
    for (const entry of entries) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        if (change.field !== 'messages') continue;
        
        const value = change.value;
        const messages = value.messages || [];
        const contacts = value.contacts || [];
        
        for (const msg of messages) {
          const from = msg.from; // Phone number
          const text = msg.text?.body || '';
          const timestamp = msg.timestamp;
          const contactName = contacts.find((c: { wa_id: string }) => c.wa_id === from)?.profile?.name || from;

          // TODO: Match phone number to existing contact in DB
          // TODO: Create or find conversation
          // TODO: Insert message into messages table
          
          console.log(`[WhatsApp Webhook] Message from ${contactName} (${from}): ${text}`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[WhatsApp Webhook Error]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
