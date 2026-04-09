import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * WhatsApp Business API Connection
 * 
 * WhatsApp uses a different flow than OAuth - you need:
 * 1. Meta Business Account
 * 2. WhatsApp Business Account  
 * 3. Phone number registered with WhatsApp Business API
 * 
 * This endpoint stores the WhatsApp Business credentials
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      phoneNumberId, // WhatsApp Business phone number ID
      businessAccountId, // WABA ID
      accessToken, // Permanent access token
      phoneNumber, // The actual phone number
    } = body;

    if (!phoneNumberId || !businessAccountId || !accessToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate token by calling WhatsApp API
    const validationResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!validationResponse.ok) {
      const error = await validationResponse.json();
      return NextResponse.json({ 
        error: 'Invalid WhatsApp credentials',
        details: error 
      }, { status: 400 });
    }

    const phoneData = await validationResponse.json();

    // Store integration
    const { error: dbError } = await supabase
      .from('channel_integrations')
      .upsert({
        user_id: user.id,
        channel: 'whatsapp',
        access_token: accessToken,
        active: true,
        config: {
          provider: 'meta',
          external_id: phoneNumberId,
          external_account_id: businessAccountId,
          external_phone: phoneNumber || phoneData.display_phone_number,
          phoneNumberId,
          businessAccountId,
          verifiedName: phoneData.verified_name,
          qualityRating: phoneData.quality_rating,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,channel',
      });

    if (dbError) {
      console.error('[DB Error]', dbError);
      return NextResponse.json({ error: 'Failed to store integration' }, { status: 500 });
    }

    // Register webhook (optional - requires app configuration in Meta dashboard)
    // This would be done in the Meta App Dashboard instead

    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp connected',
      phoneNumber: phoneData.display_phone_number,
      qualityRating: phoneData.quality_rating,
    });

  } catch (err) {
    console.error('[WhatsApp Connect Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Check WhatsApp connection status and fetch phone numbers from Meta
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: integration, error } = await supabase
      .from('channel_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('channel', 'whatsapp')
      .single();

    if (error || !integration) {
      return NextResponse.json({ connected: false });
    }

    // Verify token is still valid
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${integration.external_id}`,
        {
          headers: { Authorization: `Bearer ${integration.access_token}` },
        }
      );

      if (!response.ok) {
        // Token expired or invalid
        await supabase
          .from('channel_integrations')
          .update({ connected: false })
          .eq('id', integration.id);

        return NextResponse.json({ 
          connected: false,
          error: 'Token expired',
        });
      }

      const phoneData = await response.json();

      return NextResponse.json({
        connected: true,
        phoneNumber: phoneData.display_phone_number,
        verifiedName: phoneData.verified_name,
        qualityRating: phoneData.quality_rating,
      });

    } catch (err) {
      return NextResponse.json({ 
        connected: integration.connected,
        phoneNumber: integration.external_phone,
      });
    }

  } catch (err) {
    console.error('[WhatsApp Status Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
