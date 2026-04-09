-- Drop ALL RLS policies on messages first
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;

-- Drop foreign key constraints
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_contact_id_fkey;

-- Change column types to TEXT
ALTER TABLE public.messages 
ALTER COLUMN conversation_id TYPE TEXT,
ALTER COLUMN user_id TYPE TEXT,
ALTER COLUMN contact_id TYPE TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON public.messages(conversation_id);

-- Recreate RLS policies
CREATE POLICY "Users can view own messages" 
ON public.messages FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own messages" 
ON public.messages FOR UPDATE 
USING (auth.uid()::text = user_id);
