import { NextRequest, NextResponse } from 'next/server';

// POST - Slack Events API webhook
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Slack URL verification challenge
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge });
  }

  try {
    const event = body.event;
    
    if (event?.type === 'message' && !event.bot_id) {
      const { user: slackUserId, text, channel, ts } = event;

      // TODO: Look up Slack user info via Slack API
      // TODO: Match to contact in DB
      // TODO: Create/find conversation and insert message
      
      console.log(`[Slack Webhook] Message from ${slackUserId} in ${channel}: ${text}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Slack Webhook Error]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
