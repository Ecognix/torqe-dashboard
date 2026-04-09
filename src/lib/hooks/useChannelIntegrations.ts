'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ChannelIntegration {
  id: string;
  channel: string;
  active: boolean;
  access_token?: string;
  refresh_token?: string;
  config?: {
    provider?: string;
    external_email?: string;
    external_phone?: string;
    external_id?: string;
    [key: string]: any;
  };
  connected_at?: string;
  updated_at?: string;
}

const CHANNEL_CONFIG: Record<string, { 
  name: string; 
  icon: string;
  color: string;
  authUrl: string;
  scopes: string[];
}> = {
  gmail: {
    name: 'Gmail',
    icon: 'gmail',
    color: '#EA4335',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
  },
  whatsapp: {
    name: 'WhatsApp Business',
    icon: 'whatsapp',
    color: '#25D366',
    authUrl: '', // WhatsApp uses manual token setup, not OAuth flow
    scopes: [],
  },
};

export function useChannelIntegrations() {
  const [integrations, setIntegrations] = useState<ChannelIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchIntegrations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('channel_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false });

      if (error) {
        console.error('[useChannelIntegrations] Fetch error:', error);
      } else {
        setIntegrations(data || []);
      }
    } catch (err) {
      console.error('[useChannelIntegrations] Error:', err);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const isConnected = (channel: string) => {
    return integrations.some(i => i.channel === channel && i.active);
  };

  const getIntegration = (channel: string) => {
    return integrations.find(i => i.channel === channel);
  };

  const connectGoogle = async (channel: 'gmail') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('[connectGoogle] Using client_id:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 30) + '...');

    const state = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      channel,
      nonce: Math.random().toString(36).substring(2),
    })).toString('base64');

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/api/auth/google/callback`,
      response_type: 'code',
      scope: CHANNEL_CONFIG[channel].scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    const authUrl = `${CHANNEL_CONFIG[channel].authUrl}?${params}`;
    console.log('[connectGoogle] Redirecting to:', authUrl.substring(0, 100) + '...');
    window.location.href = authUrl;
  };

  const connectLinkedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const state = Buffer.from(JSON.stringify({ 
      userId: user.id,
      nonce: Math.random().toString(36).substring(2),
    })).toString('base64');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/api/auth/linkedin/callback`,
      scope: CHANNEL_CONFIG.linkedin.scopes.join(' '),
      state,
    });

    window.location.href = `${CHANNEL_CONFIG.linkedin.authUrl}?${params}`;
  };

  const connectWhatsApp = async (credentials: {
    phoneNumberId: string;
    businessAccountId: string;
    accessToken: string;
    phoneNumber?: string;
  }) => {
    const response = await fetch('/api/auth/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to connect WhatsApp');
    }

    await fetchIntegrations();
    return result;
  };

  const disconnect = async (channel: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('channel_integrations')
      .delete()
      .eq('user_id', user.id)
      .eq('channel', channel);

    if (error) {
      throw new Error(error.message);
    }

    setIntegrations(prev => prev.filter(i => i.channel !== channel));
  };

  return {
    integrations,
    loading,
    fetchIntegrations,
    isConnected,
    getIntegration,
    connectGoogle,
    connectLinkedIn,
    connectWhatsApp,
    disconnect,
    CHANNEL_CONFIG,
  };
}
