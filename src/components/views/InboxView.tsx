'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, PenLine, Brain, Paperclip, Image, Smile, Zap, X, Send, Clock, Plane, ArrowLeft, Mic, Search, SlidersHorizontal, Plus, Star, MoreVertical, Check, CheckCheck, Sparkles, Calendar, RefreshCw, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { messages as mockMessages, inboxStats } from '@/lib/data';
import { getChannelIcon } from '@/lib/icons';
import StatCard from '@/components/StatCard';
import type { Message } from '@/types';

interface InboxViewProps {
  onChatbotAction: (tab: 'agent' | 'negotiate') => void;
  onProfileClick?: (contact: Message) => void;
}

// Helper to strip HTML tags from text
function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
    .replace(/\s+/g, ' ')       // Collapse whitespace
    .replace(/&nbsp;/g, ' ')    // Replace &nbsp; with space
    .replace(/&amp;/g, '&')     // Decode common entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// Helper to detect URLs and convert to clickable links
function linkifyText(text: string): React.ReactNode[] {
  if (!text) return [text];
  
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  const urlRegexClone = new RegExp(urlRegex.source, urlRegex.flags);
  
  while ((match = urlRegexClone.exec(text)) !== null) {
    // Add text before URL
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const url = match[0];
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Add clickable link
    parts.push(
      <a
        key={match.index}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:opacity-80 break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {url.length > 50 ? url.slice(0, 50) + '...' : url}
      </a>
    );
    
    lastIndex = match.index + url.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

// Transform real data to match Message type
function transformConversation(conv: any): Message {
  const contact = conv.contacts || {};
  const lastMsg = conv.last_message_at ? new Date(conv.last_message_at) : new Date();
  const timeStr = formatTimeAgo(lastMsg);
  
  // Generate Gravatar URL from email if no avatar_url
  const avatarUrl = contact.avatar_url || (contact.email ? 
    `https://www.gravatar.com/avatar/${contact.email.toLowerCase().trim()}?d=mp&s=200` : 
    null);
  
  return {
    id: conv.id,
    name: contact.name || contact.email || 'Unknown',
    initials: contact.initials || '?',
    gradient: contact.avatar_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatarUrl,
    preview: conv.subject || 'No preview',
    subject: conv.subject,
    time: timeStr,
    unread: conv.unread || false,
    priority: conv.priority || 'normal',
    channel: conv.channel,
    channelLabel: conv.channel === 'gmail' ? 'Gmail' : conv.channel === 'whatsapp' ? 'WhatsApp' : conv.channel === 'linkedin' ? 'LinkedIn' : conv.channel,
    thread: []
  } as Message;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function InboxView({ onChatbotAction, onProfileClick }: InboxViewProps) {
  const supabase = createClient();
  const [realMessages, setRealMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message>(mockMessages[0]);
  const [filter, setFilter] = useState<string>('all');
  const [inputValue, setInputValue] = useState('');
  const [threadMessages, setThreadMessages] = useState<Message['thread']>(mockMessages[0].thread);
  const [autopilotActive, setAutopilotActive] = useState(false);
  const [autopilotTime, setAutopilotTime] = useState(60);
  const [aiCard, setAiCard] = useState<{ type: string; content: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [editText, setEditText] = useState('');
  const lastAiAction = useRef<string>('');
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autopilotRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real conversations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 500); // Delay to avoid auth race condition
    return () => clearTimeout(timer);
  }, []);

  // Fetch thread when selection changes
  useEffect(() => {
    console.log('[InboxView] Selected message changed:', selectedMessage.id, 'thread length:', selectedMessage.thread?.length);
    if (selectedMessage.id) {
      fetchThreadMessages(String(selectedMessage.id));
    }
  }, [selectedMessage.id]);

  // Auto-sync: Poll for new messages every 30 seconds
  useEffect(() => {
    const syncData = async () => {
      console.log('[InboxView] Auto-sync: Checking for new messages...');
      
      // Trigger Gmail sync in background
      try {
        setIsSyncing(true);
        setSyncError(null);
        const response = await fetch('/api/gmail/sync', { method: 'POST' });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[InboxView] Gmail sync error:', errorData);
          if (errorData.error?.includes('expired') || errorData.error?.includes('401')) {
            setSyncError('Gmail connection expired. Please reconnect in Settings.');
          }
        } else {
          const result = await response.json();
          console.log('[InboxView] Gmail sync result:', result);
        }
      } catch (err) {
        console.error('[InboxView] Gmail sync failed:', err);
      } finally {
        setIsSyncing(false);
      }
      
      // Refresh conversations
      fetchConversations();
      
      // If a conversation is selected, also refresh its thread
      if (selectedMessage.id) {
        fetchThreadMessages(String(selectedMessage.id));
      }
    };

    // Initial sync
    syncData();
    
    const interval = setInterval(syncData, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedMessage.id]);

  // Real-time subscription for new messages on selected conversation
  useEffect(() => {
    if (!selectedMessage.id) return;

    const subscription = supabase
      .channel(`messages:${selectedMessage.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${selectedMessage.id}`
        }, 
        (payload) => {
          console.log('[InboxView] New message received:', payload);
          fetchThreadMessages(String(selectedMessage.id));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedMessage.id]);

  const isFetchingRef = useRef(false);

  const fetchConversations = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn('[InboxView] Auth error:', authError.message);
        return;
      }
      if (!user) {
        console.warn('[InboxView] No user found');
        return;
      }

      console.log('[InboxView] Fetching conversations for user:', user.id);

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          channel,
          subject,
          last_message_at,
          unread,
          priority,
          contacts:contact_id (id, name, initials, avatar_gradient, email, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[InboxView] Supabase error:', error);
        throw error;
      }

      console.log('[InboxView] Fetched conversations:', data?.length || 0);

      const formatted = (data || []).map(transformConversation);
      console.log('[InboxView] Formatted messages:', formatted.length);
      
      setRealMessages(formatted);
      
      if (formatted.length > 0 && !realMessages.length) {
        setSelectedMessage(formatted[0]);
      }
    } catch (err) {
      console.error('[InboxView] Failed to fetch conversations:', err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const fetchThreadMessages = async (conversationId: string) => {
    console.log('[InboxView] Fetching thread for conversation:', conversationId);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('type, text, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[InboxView] Thread fetch error:', error);
        throw error;
      }

      console.log('[InboxView] Fetched thread messages:', data?.length || 0);

      const thread = (data || []).map((msg: any) => ({
        type: msg.type,
        text: msg.text,
        time: formatTimeAgo(new Date(msg.created_at))
      }));

      setSelectedMessage(prev => ({ ...prev, thread }));
      setThreadMessages(thread);
      console.log('[InboxView] Set thread messages:', thread.length);
    } catch (err) {
      console.error('[InboxView] Failed to fetch thread:', err);
    }
  };

  // Use real messages if available, otherwise mock
  const displayMessages = realMessages.length > 0 ? realMessages : mockMessages;

  const filteredMessages = displayMessages.filter(msg => {
    if (filter === 'urgent') return msg.priority === 'urgent';
    if (filter === 'high') return msg.priority === 'high';
    if (filter === 'unread') return msg.unread;
    if (filter === 'starred') return msg.priority === 'urgent' || msg.priority === 'high';
    return true;
  }).filter(msg => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return msg.name.toLowerCase().includes(q) || msg.preview.toLowerCase().includes(q);
  });

  useEffect(() => {
    // Only set from selectedMessage.thread if we don't have fetched data
    // Real messages have empty thread initially, so we fetch separately
    if (selectedMessage.thread && selectedMessage.thread.length > 0) {
      setThreadMessages(selectedMessage.thread);
    }
  }, [selectedMessage.id]); // Only trigger on ID change, not full message change

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  useEffect(() => {
    if (autopilotActive && autopilotTime > 0) {
      autopilotRef.current = setTimeout(() => {
        setAutopilotTime(prev => prev - 1);
      }, 1000);
    } else if (autopilotTime === 0 && autopilotActive) {
      handleSend();
      cancelAutopilot();
    }
    return () => {
      if (autopilotRef.current) clearTimeout(autopilotRef.current);
    };
  }, [autopilotActive, autopilotTime]);

  const handleSend = () => {
    if (!inputValue.trim() && !autopilotActive) return;
    const text = autopilotActive ? inputValue : inputValue.trim();
    if (!text && !autopilotActive) return;

    const newMsg = {
      type: 'outgoing' as const,
      text: text || 'Message sent via Autopilot.',
      time: 'Just now'
    };
    setThreadMessages(prev => [...prev, newMsg]);
    setInputValue('');
  };

  const triggerAutopilot = () => {
    if (!inputValue.trim()) return;
    setAutopilotActive(true);
    setAutopilotTime(60);
  };

  const cancelAutopilot = () => {
    setAutopilotActive(false);
    setAutopilotTime(60);
    if (autopilotRef.current) clearTimeout(autopilotRef.current);
  };

  const handleInlineAi = (action: string) => {
    setAiCard(null);
    setAiLoading(true);
    setIsEditingAi(false);
    lastAiAction.current = action;

    setTimeout(() => {
      if (action === 'summarise') {
        setAiCard({
          type: 'summary',
          content: `Based on the recent thread, ${selectedMessage.name.split(' ')[0]} ${selectedMessage.priority === 'urgent' ? 'is urgently waiting for an update.' : 'is expecting a follow-up.'} The main context is: "${selectedMessage.preview}"`
        });
      } else if (action === 'draft') {
        setAiCard({
          type: 'draft',
          content: `Hi ${selectedMessage.name.split(' ')[0]}, I'm working on the details you requested and will share an update shortly. Would you like a quick call to go over it?`
        });
      }
      setAiLoading(false);
    }, 2000);
  };

  const handleRegenerate = () => {
    if (lastAiAction.current) handleInlineAi(lastAiAction.current);
  };

  const startEditAi = () => {
    if (!aiCard) return;
    setEditText(aiCard.content);
    setIsEditingAi(true);
  };

  const saveEditAi = () => {
    if (!aiCard) return;
    setAiCard({ ...aiCard, content: editText });
    setIsEditingAi(false);
  };

  const sendAiDraft = () => {
    if (!aiCard) return;
    const newMsg = {
      type: 'outgoing' as const,
      text: aiCard.content,
      time: 'Just now'
    };
    setThreadMessages(prev => [...prev, newMsg]);
    setAiCard(null);
  };

  return (
    <div className="animate-fade-in space-y-4 lg:space-y-6">
      {/* Stats Row - hidden on mobile when thread is open */}
      <div className={`${mobileShowThread ? 'hidden lg:grid' : 'flex lg:grid'} gap-3 overflow-x-auto pb-1 snap-x snap-mandatory lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0`}>
        {inboxStats.map((stat, i) => (
          <div key={i} className="min-w-[calc(50%-6px)] snap-start lg:min-w-0">
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0 lg:gap-4 h-[calc(100vh-220px)]">
        
        {/* ═══════════════ MESSAGE LIST PANEL ═══════════════ */}
        <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col ${mobileShowThread ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* List Header */}
          <div className="px-4 lg:px-5 py-3.5 border-b border-slate-100">
            {syncError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="font-medium">⚠️ {syncError}</span>
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
                {isSyncing && (
                  <RefreshCw className="w-4 h-4 text-orange animate-spin" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-orange/10 text-orange' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                >
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar (collapsible) */}
            {showSearch && (
              <div className="mt-3 relative animate-fade-in">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange/30"
                />
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-4 lg:px-5 py-2.5 border-b border-slate-100 flex gap-1 overflow-x-auto">
            {['All', 'Urgent', 'High', 'Unread', 'AI Suggestions'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f === 'AI Suggestions' ? 'all' : f.toLowerCase())}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filter === (f === 'AI Suggestions' ? 'ai' : f.toLowerCase())
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  setAiCard(null);
                  setMobileShowThread(true);
                }}
                className={`w-full flex items-start gap-2.5 lg:gap-3 px-4 lg:px-5 py-5 lg:py-[22px] transition-all text-left relative ${
                  selectedMessage.id === msg.id 
                    ? 'bg-orange/5' 
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Active indicator */}
                {selectedMessage.id === msg.id && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-orange rounded-r-full" />
                )}
                
                {/* Avatar with Channel Badge */}
                <div className="relative flex-shrink-0">
                  {msg.avatarUrl ? (
                    <img
                      src={msg.avatarUrl}
                      alt={msg.initials}
                      className="w-9 h-9 lg:w-10 lg:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm"
                      style={{ background: msg.gradient }}
                    >
                      {msg.initials}
                    </div>
                  )}
                  {/* Channel Icon Badge */}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <span className="w-3 h-3 lg:w-3.5 lg:h-3.5">
                      {getChannelIcon(msg.channel)}
                    </span>
                  </span>
                  {msg.unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-xs lg:text-sm font-semibold truncate ${msg.unread ? 'text-slate-900' : 'text-slate-600'}`}>
                      {msg.name}
                    </span>
                    <span className="text-[10px] lg:text-[11px] text-slate-400 flex-shrink-0">{msg.time}</span>
                  </div>
                  {/* Show subject for Gmail, preview for others */}
                  <p className={`text-[11px] lg:text-xs leading-relaxed truncate ${msg.unread ? 'text-slate-600' : 'text-slate-400'}`}>
                    {msg.channel === 'gmail' && msg.subject ? (
                      <span className="font-medium text-slate-700">{msg.subject}</span>
                    ) : (
                      msg.preview
                    )}
                  </p>
                </div>

                {/* Unread dot */}
                {msg.unread && (
                  <span className="w-2 h-2 bg-orange rounded-full flex-shrink-0 mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════ THREAD PANEL ═══════════════ */}
        <div className={`bg-white rounded-2xl lg:border border-slate-200 overflow-hidden flex flex-col ${mobileShowThread ? 'fixed inset-0 z-50 lg:relative lg:z-auto flex' : 'hidden lg:flex'}`}>
          
          {/* Thread Header */}
          <div className="px-4 lg:px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Back button (mobile) */}
              <button
                onClick={() => setMobileShowThread(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <button
                onClick={() => onProfileClick?.(selectedMessage)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:ring-2 hover:ring-orange/40 transition-all cursor-pointer flex-shrink-0 overflow-hidden"
              >
                {selectedMessage.avatarUrl ? (
                  <img
                    src={selectedMessage.avatarUrl}
                    alt={selectedMessage.initials}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span style={{ background: selectedMessage.gradient }} className="w-full h-full flex items-center justify-center">
                    {selectedMessage.initials}
                  </span>
                )}
              </button>

              {/* Name & info */}
              <button onClick={() => onProfileClick?.(selectedMessage)} className="flex-1 text-left min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{selectedMessage.name}</h3>
                <p className="text-xs text-slate-400 truncate">{selectedMessage.channelLabel} · Last active {selectedMessage.time}</p>
                {selectedMessage.channel === 'gmail' && selectedMessage.subject && (
                  <p className="text-xs font-medium text-slate-700 truncate mt-0.5">{selectedMessage.subject}</p>
                )}
              </button>

              {/* Header actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-orange transition-colors">
                  <Star className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Quick Actions */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto">
              <button 
                onClick={() => handleInlineAi('summarise')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 hover:border-slate-300 transition-all whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5" />
                Summarise
              </button>
              <button 
                onClick={() => handleInlineAi('draft')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 hover:border-slate-300 transition-all whitespace-nowrap"
              >
                <PenLine className="w-3.5 h-3.5" />
                Draft Reply
              </button>
              <button 
                onClick={() => onChatbotAction('agent')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange/5 border border-orange/20 text-orange text-xs font-medium hover:bg-orange/10 transition-all whitespace-nowrap"
              >
                <Brain className="w-3.5 h-3.5" />
                Vibe Check
              </button>
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 hover:border-slate-300 transition-all whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule
              </button>
            </div>
          </div>

          {/* Thread Messages */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-5 py-4 space-y-3" style={{ background: 'linear-gradient(to bottom, #fafafa, #ffffff)' }}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-medium text-slate-400 bg-white px-2">Today</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {threadMessages.map((msg, i) => (
              <div 
                key={i}
                className={`flex animate-msg-fade-in mb-4 ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] lg:max-w-[75%] ${msg.type === 'outgoing' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-3 overflow-hidden ${
                    msg.type === 'outgoing' 
                      ? 'bg-orange text-white rounded-2xl rounded-br-md' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md shadow-sm'
                  }`}>
                    <p className="text-[13px] lg:text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere" style={{ fontFamily: "'Inter', sans-serif", wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {linkifyText(stripHtmlTags(msg.text))}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1.5 px-1 ${msg.type === 'outgoing' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[11px] text-slate-400">{msg.time}</span>
                    {msg.type === 'outgoing' && (
                      <CheckCheck className="w-3.5 h-3.5 text-orange" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* AI Loading State */}
            {aiLoading && (
              <div className="animate-fade-in my-2">
                <div className="bg-gradient-to-br from-slate-50 to-orange/5 border border-orange/20 rounded-2xl p-5 max-w-[90%]">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="TorqeAI" className="w-8 h-8 animate-spin-slow" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">TorqeAI is thinking...</p>
                      <p className="text-xs text-slate-400 mt-0.5 animate-thinking">Generating {lastAiAction.current === 'summarise' ? 'summary' : 'draft reply'}...</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1">
                    <span className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* AI Suggestion Card */}
            {aiCard && !aiLoading && (
              <div className="animate-fade-in my-2">
                <div className="bg-gradient-to-br from-slate-50 to-orange/5 border border-orange/20 rounded-2xl p-4 max-w-[90%]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <img src="/logo.png" alt="TorqeAI" className="w-5 h-5" />
                    <span className="text-xs font-semibold text-slate-900">
                      {aiCard.type === 'summary' ? 'Conversation Summary' : 'AI Draft Reply'}
                    </span>
                    <span className="text-[10px] font-bold text-orange bg-orange/10 px-2 py-0.5 rounded-full ml-auto">TorqeAI</span>
                  </div>

                  {isEditingAi ? (
                    <div className="mb-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange/30 resize-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={saveEditAi} className="px-3 py-1.5 rounded-lg bg-orange text-white text-xs font-semibold hover:bg-orange-500 transition-colors">Save</button>
                        <button onClick={() => setIsEditingAi(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>{aiCard.content}</p>
                  )}

                  {!isEditingAi && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button 
                        onClick={sendAiDraft}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange text-white text-xs font-semibold hover:bg-orange-500 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                      {aiCard.type === 'draft' && (
                        <button 
                          onClick={startEditAi}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}
                      <button 
                        onClick={handleRegenerate}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </button>
                      <button 
                        onClick={() => { setAiCard(null); setIsEditingAi(false); }}
                        className="px-3 py-2 rounded-xl text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors ml-auto"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Inline Suggestions (always visible at bottom) */}
            {!aiCard && !aiLoading && (
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => handleInlineAi('draft')}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-orange/30 hover:bg-orange/5 transition-all text-left group"
                >
                  <Sparkles className="w-4 h-4 text-orange flex-shrink-0" />
                  <span className="text-xs text-slate-600 group-hover:text-slate-800">
                    <strong className="text-slate-800">Suggested Reply:</strong> Hi {selectedMessage.name.split(' ')[0]}, thanks for following up. I&apos;ll get back to you shortly.
                  </span>
                </button>
                <button
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-orange/30 hover:bg-orange/5 transition-all text-left group"
                >
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 group-hover:text-slate-800">
                    Schedule a reminder to follow up if no reply by 5 PM tomorrow.
                  </span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="p-3 lg:p-4 border-t border-slate-100 bg-white">
            {/* Autopilot Bar */}
            {autopilotActive && (
              <div className="flex items-center justify-between bg-orange/5 border border-orange/20 rounded-xl px-3 lg:px-4 py-2.5 mb-3 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <Plane className="w-4 h-4 text-orange" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Autopilot Active</p>
                    <p className="text-[11px] text-slate-500 hidden sm:block">Sending at optimal time</p>
                  </div>
                </div>
                <button 
                  onClick={cancelAutopilot}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange/10 text-orange text-xs font-semibold hover:bg-orange/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {autopilotTime}s
                </button>
              </div>
            )}
            
            {/* Input Row */}
            <div className="flex items-end gap-2">
              {/* Attachment buttons */}
              <div className="flex gap-0.5 pb-1.5">
                <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="hidden sm:block p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Input field */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Write a message..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 pr-11 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange/30 transition-all"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-orange">
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Send button */}
              <button 
                onClick={inputValue.trim() ? handleSend : undefined}
                className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                  inputValue.trim()
                    ? 'bg-orange text-white hover:bg-orange-500 shadow-sm shadow-orange/25'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
