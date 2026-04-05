export interface Message {
  id: number;
  name: string;
  initials: string;
  channel: 'whatsapp' | 'gmail' | 'linkedin' | 'slack' | 'instagram' | 'telegram';
  channelLabel: string;
  priority: 'urgent' | 'high' | 'normal';
  time: string;
  preview: string;
  unread: boolean;
  gradient: string;
  thread: ThreadMessage[];
}

export interface ThreadMessage {
  type: 'incoming' | 'outgoing';
  text: string;
  time: string;
}

export interface StatCard {
  label: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down';
  color?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  view: string;
}

export interface Channel {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}
