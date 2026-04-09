-- Add avatar_url column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update existing contacts with Gravatar URL based on email
UPDATE public.contacts 
SET avatar_url = 'https://www.gravatar.com/avatar/' || MD5(LOWER(email)) || '?d=mp&s=200'
WHERE email IS NOT NULL AND avatar_url IS NULL;
