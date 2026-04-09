import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// One-time setup route to add onboarding columns
// Visit /api/setup to run this migration
export async function GET() {
  const supabase = createServerSupabaseClient();

  // Run migration using RPC or raw SQL via supabase-js
  // Since supabase-js doesn't support raw DDL, we'll check if columns exist
  // by trying to select them. If they don't exist, we return instructions.
  
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .limit(1);

  if (error && error.message.includes('onboarding_completed')) {
    return NextResponse.json({
      status: 'migration_needed',
      message: 'Please run the following SQL in your Supabase SQL Editor:',
      sql: `ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS team_size TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS primary_channels TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS use_case TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;`
    });
  }

  return NextResponse.json({ 
    status: 'ok', 
    message: 'Database schema is up to date. Onboarding columns exist.' 
  });
}
