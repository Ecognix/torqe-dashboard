-- Fix messages table to handle both UUID and integer conversation IDs

-- Step 1: Drop foreign key constraint
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- Step 2: Drop foreign key to profiles
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

-- Step 3: Change column types to TEXT
ALTER TABLE public.messages 
ALTER COLUMN conversation_id TYPE TEXT,
ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON public.messages(conversation_id);

-- Step 5: Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_messages_user_id 
ON public.messages(user_id);
