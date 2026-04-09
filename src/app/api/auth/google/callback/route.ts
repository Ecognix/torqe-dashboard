import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Use environment variables for production
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

console.log('🔴 GOOGLE OAuth ENV CHECK 🔴');
console.log('ENV CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'NOT SET');
console.log('USING CLIENT_ID:', GOOGLE_CLIENT_ID);

/**
 * Google OAuth Callback for Gmail integration
 * 
 * Environment variables needed:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET  
 * - GOOGLE_REDIRECT_URI (should be /api/auth/google/callback)
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Contains user ID and channel type
  const error = searchParams.get('error');

  if (error) {
    console.error('[Google OAuth Error]', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=google_auth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=missing_params`);
  }

  try {
    // Decode state to get user ID and channel
    const { userId, channel } = JSON.parse(Buffer.from(state, 'base64').toString());
    
    if (!userId || !channel) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for tokens
    const clientId = GOOGLE_CLIENT_ID;
    const clientSecret = GOOGLE_CLIENT_SECRET;
    const redirectUri = GOOGLE_REDIRECT_URI;
    
    console.log('🔴 USING ENV VALUES');
    console.log('client_id:', clientId);
    console.log('client_secret length:', clientSecret.length);
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[Google Token Error]', JSON.stringify(tokens));
      throw new Error(`Token exchange failed: ${tokens.error_description || tokens.error || JSON.stringify(tokens)}`);
    }

    console.log('[Google OAuth] Tokens received, fetching user info...');

    // Store tokens in database
    const supabase = createServerSupabaseClient();
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    if (!userInfoResponse.ok) {
      const userInfoErr = await userInfoResponse.text();
      console.error('[Google User Info Error]', userInfoErr);
      throw new Error('Failed to fetch user info from Google');
    }
    
    const userInfo = await userInfoResponse.json();
    console.log('[Google OAuth] User info received:', userInfo.email);

    // Store integration
    const { error: dbError } = await supabase
      .from('channel_integrations')
      .upsert({
        user_id: userId,
        channel: channel,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        active: true,
        updated_at: new Date().toISOString(),
        config: {
          provider: 'google',
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          external_id: userInfo.id,
          external_email: userInfo.email,
        }
      }, {
        onConflict: 'user_id,channel',
      });

    if (dbError) {
      console.error('[DB Error]', JSON.stringify(dbError));
      throw new Error(`Database error: ${dbError.message || dbError.code || 'Unknown'}`);
    }
    
    console.log('[Google OAuth] Integration stored successfully');

    // Setup Gmail push notifications (Pub/Sub) if this is Gmail
    if (channel === 'gmail' && tokens.refresh_token) {
      await setupGmailWatch(tokens.access_token, userInfo.email);
    }

    // Trigger initial sync to fetch existing emails
    if (channel === 'gmail') {
      const syncUrl = new URL('/api/gmail/sync', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      syncUrl.searchParams.set('maxResults', '50');
      
      fetch(syncUrl.toString(), {
        method: 'POST',
        headers: { 'X-Internal-Request': 'oauth-callback' },
      }).catch(err => {
        console.error('[Gmail OAuth] Failed to trigger initial sync:', err);
      });
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?view=settings&success=${channel}_connected`);

  } catch (err: any) {
    console.error('[Google Callback Error]', err);
    console.error('[Error Details]', err.message, err.code, err.details);
    const errorMsg = err.message || 'auth_failed';
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?view=settings&error=${encodeURIComponent(errorMsg)}`);
  }
}

async function setupGmailWatch(accessToken: string, email: string) {
  try {
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/watch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicName: process.env.GOOGLE_PUBSUB_TOPIC,
        labelIds: ['INBOX'],
      }),
    });

    if (!response.ok) {
      console.warn('[Gmail Watch Setup Failed]', await response.text());
    } else {
      console.log('[Gmail Watch] Setup successful for', email);
    }
  } catch (err) {
    console.warn('[Gmail Watch Error]', err);
  }
}
