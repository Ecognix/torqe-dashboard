-- Fix messages table - handle RLS policies

-- Step 1: Drop RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;

-- Step 2: Drop foreign key constraints
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_contact_id_fkey;

-- Step 3: Change column types to TEXT
ALTER TABLE public.messages 
ALTER COLUMN conversation_id TYPE TEXT,
ALTER COLUMN user_id TYPE TEXT,
ALTER COLUMN contact_id TYPE TEXT;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON public.messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_user_id 
ON public.messages(user_id);

-- Step 5: Recreate RLS policies with TEXT type
CREATE POLICY "Users can view own messages" 
ON public.messages FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own messages" 
ON public.messages FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own messages" 
ON public.messages FOR DELETE 
USING (auth.uid()::text = user_id);
