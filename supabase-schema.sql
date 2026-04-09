-- =============================================
-- TORQE DASHBOARD - SUPABASE DATABASE SCHEMA
-- =============================================
-- Run this SQL in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. CONTACTS
-- =============================================
CREATE TABLE public.contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  initials TEXT,
  avatar_gradient TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  channel TEXT DEFAULT 'whatsapp',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  starred BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. CONVERSATIONS (inbox threads)
-- =============================================
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  channel_label TEXT,
  external_thread_id TEXT,
  subject TEXT,
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread BOOLEAN DEFAULT TRUE,
  unread_count INT DEFAULT 1,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived', 'snoozed')),
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. MESSAGES (individual messages in a conversation)
-- =============================================
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'incoming' CHECK (type IN ('incoming', 'outgoing')),
  text TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  external_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  delivered BOOLEAN DEFAULT TRUE,
  channel TEXT DEFAULT 'whatsapp',
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. DEALS (pipeline)
-- =============================================
CREATE TABLE public.deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. SCHEDULED MESSAGES
-- =============================================
CREATE TABLE public.scheduled_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  text TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. AI CHAT HISTORY
-- =============================================
CREATE TABLE public.ai_chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4o',
  tab TEXT DEFAULT 'agent' CHECK (tab IN ('agent', 'negotiate')),
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. CHANNEL INTEGRATIONS
-- =============================================
CREATE TABLE public.channel_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  webhook_url TEXT,
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_contacts_user ON public.contacts(user_id);
CREATE INDEX idx_conversations_user ON public.conversations(user_id);
CREATE INDEX idx_conversations_contact ON public.conversations(contact_id);
CREATE INDEX idx_conversations_last_msg ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_deals_user ON public.deals(user_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_scheduled_user ON public.scheduled_messages(user_id);
CREATE INDEX idx_ai_chat_user ON public.ai_chat_history(user_id);

-- Unique constraint for channel integrations upsert
CREATE UNIQUE INDEX idx_channel_integrations_user_channel ON public.channel_integrations(user_id, channel);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_integrations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Contacts: users can CRUD their own contacts
CREATE POLICY "Users can view own contacts" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Conversations: users can CRUD their own
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages: users can CRUD messages in their conversations
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);

-- Deals: users can CRUD their own
CREATE POLICY "Users can view own deals" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deals" ON public.deals FOR DELETE USING (auth.uid() = user_id);

-- Scheduled: users can CRUD their own
CREATE POLICY "Users can view own scheduled" ON public.scheduled_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create scheduled" ON public.scheduled_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled" ON public.scheduled_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheduled" ON public.scheduled_messages FOR DELETE USING (auth.uid() = user_id);

-- AI Chat: users can CRUD their own
CREATE POLICY "Users can view own ai chat" ON public.ai_chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create ai chat" ON public.ai_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Channel Integrations: users can CRUD their own
CREATE POLICY "Users can view own integrations" ON public.channel_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create integrations" ON public.channel_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.channel_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.channel_integrations FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.channel_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
