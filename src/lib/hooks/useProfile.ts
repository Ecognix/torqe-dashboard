'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: string | null;
  job_title: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  industry: string | null;
  team_size: string | null;
  primary_channels: string[];
  use_case: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const fetchingRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.warn('[useProfile] No auth user:', authError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('[useProfile] Profile fetch error:', error.message);
      }

      if (data) {
        setProfile({
          ...data,
          email: user.email || data.email || '',
          primary_channels: data.primary_channels || [],
          bio: data.bio ?? null,
          location: data.location ?? null,
          website: data.website ?? null,
        });
      }
    } catch (err) {
      console.error('[useProfile] Unexpected error:', err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();

    // Re-fetch when auth state changes (login, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { error: 'No profile' };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);
    if (error) {
      console.warn('[useProfile] Update error:', error.message);
    } else {
      setProfile(prev => prev ? { ...prev, ...updates } : prev);
    }
    return { error };
  };

  const getInitials = () => {
    if (!profile?.full_name) return '?';
    return profile.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return { profile, loading, fetchProfile, updateProfile, getInitials };
}
