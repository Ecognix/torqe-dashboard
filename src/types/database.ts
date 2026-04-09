export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  initials: string | null;
  avatar_gradient: string;
  channel: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  starred: boolean;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  contact_id: string;
  channel: string;
  channel_label: string | null;
  subject: string | null;
  last_message_preview: string | null;
  last_message_at: string;
  unread: boolean;
  unread_count: number;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'open' | 'closed' | 'archived' | 'snoozed';
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  contact?: Contact;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  type: 'incoming' | 'outgoing';
  text: string;
  media_url: string | null;
  media_type: string | null;
  read: boolean;
  delivered: boolean;
  channel: string;
  ai_generated: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  contact_id: string | null;
  title: string;
  value: number;
  currency: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Joined
  contact?: Contact;
}

export interface ScheduledMessage {
  id: string;
  user_id: string;
  contact_id: string | null;
  conversation_id: string | null;
  channel: string;
  text: string;
  scheduled_at: string;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface AiChatMessage {
  id: string;
  user_id: string;
  conversation_id: string | null;
  role: 'user' | 'assistant';
  content: string;
  model: string;
  tab: 'agent' | 'negotiate';
  tokens_used: number;
  created_at: string;
}

export interface ChannelIntegration {
  id: string;
  user_id: string;
  channel: string;
  access_token?: string | null;
  refresh_token?: string | null;
  config?: {
    provider?: string;
    external_id?: string;
    external_email?: string;
    external_phone?: string;
    [key: string]: any;
  };
  active: boolean;
  connected_at?: string;
  updated_at?: string;
}
