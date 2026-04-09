import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST - Gmail push notification webhook
// Gmail uses Pub/Sub to push notifications when new emails arrive
export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    // Google Pub/Sub sends base64-encoded data
    const data = body.message?.data;
    if (!data) {
      return NextResponse.json({ error: 'No data' }, { status: 400 });
    }

    const decoded = JSON.parse(Buffer.from(data, 'base64').toString());
    const { emailAddress, historyId } = decoded;

    console.log(`[Gmail Webhook] New activity for ${emailAddress}, historyId: ${historyId}`);

    // Find the user by email address
    const supabase = createServerSupabaseClient();
    const { data: integration, error: integrationError } = await supabase
      .from('channel_integrations')
      .select('user_id, access_token, refresh_token')
      .eq('channel', 'gmail')
      .eq('external_email', emailAddress)
      .single();

    if (integrationError || !integration) {
      console.error('[Gmail Webhook] No integration found for', emailAddress);
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Trigger sync by making internal request to sync endpoint
    // This runs async so webhook responds immediately
    const syncUrl = new URL('/api/gmail/sync', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    syncUrl.searchParams.set('maxResults', '10'); // Only fetch newest messages

    fetch(syncUrl.toString(), {
      method: 'POST',
      headers: {
        'X-Internal-Request': 'webhook',
      },
    }).catch(err => {
      console.error('[Gmail Webhook] Failed to trigger sync:', err);
    });

    return NextResponse.json({ status: 'ok', triggered: true });
  } catch (error) {
    console.error('[Gmail Webhook Error]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
