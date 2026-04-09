import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { decodeGmailBody, parseGmailHeaders, extractEmail, extractName, getMessageBody } from '@/lib/gmail';

/**
 * POST /api/gmail/sync
 * Sync Gmail messages to the database
 * 
 * Query params:
 * - maxResults: number of messages to fetch (default: 50)
 * - historyId: fetch only messages after this historyId (for incremental sync)
 */

export async function POST(request: NextRequest) {
  try {
    console.log('[Gmail Sync] Starting sync...');
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('[Gmail Sync] No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Gmail Sync] User:', user.id);

    // Get user's Gmail integration
    const { data: integration, error: integrationError } = await supabase
      .from('channel_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('channel', 'gmail')
      .single();

    if (integrationError || !integration) {
      console.log('[Gmail Sync] No Gmail integration:', integrationError);
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    console.log('[Gmail Sync] Integration found, token expires:', integration.expires_at);

    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const historyId = searchParams.get('historyId');

    let accessToken = integration.access_token;
    console.log('[Gmail Sync] Access token available:', !!accessToken);

    // Check if token needs refresh
    if (integration.expires_at && new Date(integration.expires_at) < new Date()) {
      console.log('[Gmail Sync] Token expired, refreshing...');
      const refreshed = await refreshGmailToken(integration.refresh_token);
      if (refreshed) {
        accessToken = refreshed.access_token;
        console.log('[Gmail Sync] Token refreshed successfully');
        // Update stored token
        await supabase
          .from('channel_integrations')
          .update({
            access_token: refreshed.access_token,
            expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          })
          .eq('id', integration.id);
      } else {
        console.log('[Gmail Sync] Token refresh failed');
        return NextResponse.json({ error: 'Token expired, please reconnect Gmail' }, { status: 401 });
      }
    }

    // Fetch message list
    const listUrl = new URL('https://www.googleapis.com/gmail/v1/users/me/messages');
    listUrl.searchParams.set('maxResults', maxResults.toString());
    listUrl.searchParams.set('labelIds', 'INBOX');
    // Get newest first
    listUrl.searchParams.set('q', 'newer_than:1d'); // Only last 24 hours for auto-sync

    console.log('[Gmail Sync] Fetching from Gmail API...');
    const listResponse = await fetch(listUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listResponse.ok) {
      const error = await listResponse.json();
      console.error('[Gmail Sync] Gmail API error:', error);
      return NextResponse.json({ error: 'Failed to fetch messages', details: error }, { status: 500 });
    }

    const listData = await listResponse.json();
    const messages = listData.messages || [];
    console.log('[Gmail Sync] Found messages:', messages.length);

    const syncedMessages = [];

    // Fetch and store each message
    for (const msg of messages) {
      try {
        // Check if message already exists
        const { data: existing } = await supabase
          .from('messages')
          .select('id')
          .eq('external_id', msg.id)
          .eq('channel', 'gmail')
          .single();

        if (existing) {
          syncedMessages.push({ id: msg.id, status: 'skipped', reason: 'already_exists' });
          continue;
        }

        // Fetch full message
        const msgResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!msgResponse.ok) continue;

        const msgData = await msgResponse.json();
        const headers = parseGmailHeaders(msgData.payload.headers);
        const { text: bodyText } = getMessageBody(msgData.payload);

        const fromEmail = extractEmail(headers.from || '');
        const fromName = extractName(headers.from || '');
        const subject = headers.subject || '(no subject)';
        const date = new Date(parseInt(msgData.internalDate)).toISOString();

        // Find or create contact
        let contactId: string;
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', user.id)
          .eq('email', fromEmail)
          .single();

        if (existingContact) {
          contactId = existingContact.id;
        } else {
          // Create new contact
          const initials = fromName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || fromEmail[0].toUpperCase();

          // Generate Gravatar URL from email
          const gravatarUrl = `https://www.gravatar.com/avatar/${fromEmail.toLowerCase().trim()}?d=mp&s=200`;

          const { data: newContact, error: contactError } = await supabase
            .from('contacts')
            .insert({
              user_id: user.id,
              name: fromName,
              email: fromEmail,
              initials,
              channel: 'gmail',
              avatar_gradient: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`,
              avatar_url: gravatarUrl,
            })
            .select('id')
            .single();

          if (contactError || !newContact) {
            console.error('Failed to create contact:', contactError);
            continue;
          }
          contactId = newContact.id;
        }

        // Find or create conversation (by threadId for Gmail)
        let conversationId: string;
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('external_thread_id', msgData.threadId)
          .eq('channel', 'gmail')
          .single();

        if (existingConversation) {
          conversationId = existingConversation.id;
          // Update conversation last_message_at
          await supabase
            .from('conversations')
            .update({ last_message_at: date })
            .eq('id', conversationId);
        } else {
          const { data: newConversation, error: convError } = await supabase
            .from('conversations')
            .insert({
              user_id: user.id,
              contact_id: contactId,
              channel: 'gmail',
              channel_label: 'Inbox',
              external_thread_id: msgData.threadId,
              subject,
              last_message_at: date,
            })
            .select('id')
            .single();

          if (convError || !newConversation) {
            console.error('Failed to create conversation:', convError);
            continue;
          }
          conversationId = newConversation.id;
        }

        // Store message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            contact_id: contactId,
            channel: 'gmail',
            external_id: msg.id,
            type: 'incoming',
            text: bodyText || msgData.snippet || '(no content)',
            created_at: date,
          });

        if (msgError) {
          console.error('[Gmail Sync] Failed to store message:', msgError);
          syncedMessages.push({ id: msg.id, status: 'error', error: msgError.message });
        } else {
          console.log('[Gmail Sync] Message synced:', msg.id, 'conv:', conversationId);
          syncedMessages.push({ id: msg.id, status: 'synced', conversationId, contactId });
        }

      } catch (err) {
        console.error('[Gmail Sync] Error processing message:', msg.id, err);
        syncedMessages.push({ id: msg.id, status: 'error', error: String(err) });
      }
    }

    const result = {
      success: true,
      synced: syncedMessages.filter(m => m.status === 'synced').length,
      skipped: syncedMessages.filter(m => m.status === 'skipped').length,
      errors: syncedMessages.filter(m => m.status === 'error').length,
      details: syncedMessages,
    };
    console.log('[Gmail Sync] Complete:', result);
    return NextResponse.json(result);

  } catch (err: any) {
    console.error('[Gmail Sync Error]', err);
    console.error('[Gmail Sync Error Stack]', err?.stack);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: err?.message || String(err),
      stack: err?.stack 
    }, { status: 500 });
  }
}

async function refreshGmailToken(refreshToken?: string): Promise<{ access_token: string; expires_in: number } | null> {
  if (!refreshToken) return null;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * GET /api/gmail/sync
 * Get sync status and last sync time
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count Gmail messages
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('channel', 'gmail');

    const { data: lastMessage } = await supabase
      .from('messages')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('channel', 'gmail')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      connected: true,
      messageCount: count || 0,
      lastSync: lastMessage?.created_at || null,
    });

  } catch (err) {
    console.error('[Gmail Sync Status Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
