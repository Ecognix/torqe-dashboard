import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * LinkedIn OAuth Callback
 * 
 * Environment variables needed:
 * - LINKEDIN_CLIENT_ID
 * - LINKEDIN_CLIENT_SECRET
 * - LINKEDIN_REDIRECT_URI
 * 
 * LinkedIn API scopes needed: r_liteprofile, r_emailaddress, w_member_social
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('[LinkedIn OAuth Error]', error, errorDescription);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=linkedin_auth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=missing_params`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());
    
    if (!userId) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[LinkedIn Token Error]', tokens);
      throw new Error(tokens.error_description || 'Failed to exchange code');
    }

    // Fetch LinkedIn profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileResponse.json();

    // Fetch email
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const emailData = await emailResponse.json();
    const email = emailData.elements?.[0]?.['handle~']?.emailAddress;

    // Store integration
    const supabase = createServerSupabaseClient();
    const { error: dbError } = await supabase
      .from('channel_integrations')
      .upsert({
        user_id: userId,
        channel: 'linkedin',
        access_token: tokens.access_token,
        active: true,
        config: {
          provider: 'linkedin',
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          external_id: profile.id,
          external_email: email,
          firstName: profile.localizedFirstName,
          lastName: profile.localizedLastName,
          vanityName: profile.vanityName,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,channel',
      });

    if (dbError) {
      console.error('[DB Error]', dbError);
      throw dbError;
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?success=linkedin_connected`);

  } catch (err) {
    console.error('[LinkedIn Callback Error]', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=auth_failed`);
  }
}
