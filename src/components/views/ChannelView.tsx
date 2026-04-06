'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Send, Sparkles, Clock, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { getChannelIcon } from '@/lib/icons';

interface ChannelViewProps {
  channel: 'whatsapp' | 'gmail' | 'linkedin' | 'slack' | 'instagram' | 'telegram';
}

interface ChannelContact {
  id: number;
  name: string;
  initials: string;
  gradient: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  direction: 'in' | 'out';
  status: 'active' | 'waiting' | 'resolved';
}

interface ChannelStat {
  label: string;
  value: string;
  sub: string;
}

const channelMeta: Record<string, { label: string; color: string; description: string; profileUrl: string }> = {
  whatsapp: { label: 'WhatsApp', color: 'from-green-500 to-green-600', description: 'Business messaging via WhatsApp API', profileUrl: 'https://business.whatsapp.com' },
  gmail: { label: 'Gmail', color: 'from-red-500 to-red-600', description: 'Email conversations via Gmail integration', profileUrl: 'https://mail.google.com' },
  linkedin: { label: 'LinkedIn', color: 'from-blue-600 to-blue-700', description: 'Professional networking messages', profileUrl: 'https://linkedin.com' },
  slack: { label: 'Slack', color: 'from-purple-500 to-purple-600', description: 'Team collaboration & client channels', profileUrl: 'https://slack.com' },
  instagram: { label: 'Instagram', color: 'from-pink-500 to-orange-400', description: 'Direct messages & story replies', profileUrl: 'https://instagram.com' },
  telegram: { label: 'Telegram', color: 'from-sky-400 to-sky-500', description: 'Secure messaging & group channels', profileUrl: 'https://telegram.org' },
};

const channelContacts: Record<string, ChannelContact[]> = {
  whatsapp: [
    { id: 0, name: 'Rahul Nair', initials: 'RN', gradient: 'linear-gradient(135deg,#f97316,#fb923c)', lastMessage: "I've been waiting for the revised timeline — when can we expect it?", time: '3m ago', unread: true, direction: 'in', status: 'waiting' },
    { id: 2, name: 'Deepa Krishnan', initials: 'DK', gradient: 'linear-gradient(135deg,#22c55e,#4ade80)', lastMessage: '🎤 Voice Note (1:24) — about API webhooks and board meeting', time: '32m ago', unread: true, direction: 'in', status: 'active' },
    { id: 6, name: 'Karan Reddy', initials: 'KR', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', lastMessage: "What's the minimum commitment?", time: '4h ago', unread: false, direction: 'in', status: 'waiting' },
  ],
  gmail: [
    { id: 1, name: 'Priya Mehta', initials: 'PM', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', lastMessage: 'Could you share the enterprise pricing breakdown?', time: '18m ago', unread: true, direction: 'in', status: 'active' },
    { id: 4, name: 'Neha Gupta', initials: 'NG', gradient: 'linear-gradient(135deg,#ec4899,#f472b6)', lastMessage: 'Will get back to you on the proposal by Thursday.', time: '2h ago', unread: false, direction: 'in', status: 'waiting' },
    { id: 9, name: 'Meera Sharma', initials: 'MS', gradient: 'linear-gradient(135deg,#ef4444,#f87171)', lastMessage: 'URGENT: Contract expires tomorrow — need renewal terms ASAP', time: '7h ago', unread: true, direction: 'in', status: 'waiting' },
  ],
  linkedin: [
    { id: 3, name: 'Vikram Singh', initials: 'VS', gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', lastMessage: 'Let me check with my team and circle back.', time: '1h ago', unread: false, direction: 'in', status: 'waiting' },
  ],
  slack: [
    { id: 5, name: 'Amit Rao', initials: 'AR', gradient: 'linear-gradient(135deg,#e01e5a,#f472b6)', lastMessage: 'Can we sync on the integration timeline tomorrow?', time: '3h ago', unread: true, direction: 'in', status: 'active' },
  ],
  instagram: [
    { id: 8, name: 'Anil Patel', initials: 'AP', gradient: 'linear-gradient(135deg,#e1306c,#f77737)', lastMessage: 'Saw your product demo reel. Looks interesting!', time: '6h ago', unread: false, direction: 'in', status: 'active' },
  ],
  telegram: [
    { id: 7, name: 'Simran Sethi', initials: 'SS', gradient: 'linear-gradient(135deg,#eab308,#facc15)', lastMessage: 'Can you send me the case studies you mentioned?', time: '5h ago', unread: true, direction: 'in', status: 'waiting' },
  ],
};

const channelStats: Record<string, ChannelStat[]> = {
  whatsapp: [
    { label: 'Total Conversations', value: '847', sub: '+23 today' },
    { label: 'Avg Response Time', value: '2.3 min', sub: '-15% faster with AI' },
    { label: 'Active Threads', value: '12', sub: '3 urgent' },
    { label: 'Messages Today', value: '156', sub: '89 inbound, 67 outbound' },
  ],
  gmail: [
    { label: 'Total Emails', value: '1,234', sub: '+18 today' },
    { label: 'Avg Response Time', value: '8.5 min', sub: '-22% faster with AI' },
    { label: 'Unread Threads', value: '7', sub: '2 urgent' },
    { label: 'Emails Today', value: '42', sub: '28 inbound, 14 outbound' },
  ],
  linkedin: [
    { label: 'Connections', value: '523', sub: '+12 this week' },
    { label: 'Avg Response Time', value: '4.1 min', sub: 'Within business hours' },
    { label: 'Active Threads', value: '4', sub: '1 high priority' },
    { label: 'Messages Today', value: '8', sub: '5 inbound, 3 outbound' },
  ],
  slack: [
    { label: 'Channels Active', value: '6', sub: '2 client channels' },
    { label: 'Avg Response Time', value: '1.8 min', sub: 'Fastest channel' },
    { label: 'Active Threads', value: '3', sub: '1 integration related' },
    { label: 'Messages Today', value: '34', sub: '19 inbound, 15 outbound' },
  ],
  instagram: [
    { label: 'DM Conversations', value: '89', sub: '+5 this week' },
    { label: 'Avg Response Time', value: '12 min', sub: 'Story replies included' },
    { label: 'Active Threads', value: '2', sub: '0 urgent' },
    { label: 'Messages Today', value: '6', sub: '4 inbound, 2 outbound' },
  ],
  telegram: [
    { label: 'Total Chats', value: '167', sub: '+8 this week' },
    { label: 'Avg Response Time', value: '3.5 min', sub: '-10% with AI' },
    { label: 'Active Threads', value: '3', sub: '1 awaiting reply' },
    { label: 'Messages Today', value: '11', sub: '7 inbound, 4 outbound' },
  ],
};

const aiInsights: Record<string, string[]> = {
  whatsapp: [
    'Rahul Nair has escalated tone — recommend priority response within 30 min',
    'Deepa Krishnan\'s voice note contains decision-making signals about quarterly commitment',
    'Karan Reddy is in consideration phase — best re-engage at 2:30 PM today',
  ],
  gmail: [
    'Priya Mehta is evaluating competitors — send pricing within 1 hour for best conversion',
    'Meera Sharma\'s contract expires tomorrow — flag for immediate legal review',
    'Neha Gupta typically responds Thursdays — prepare proposal follow-up for then',
  ],
  linkedin: [
    'Vikram Singh\'s team is in evaluation mode — 89% chance of morning response',
    'Consider connecting with Vikram\'s colleague Anita Desai for multi-threaded deal',
  ],
  slack: [
    'Amit Rao prefers async communication — send detailed message rather than scheduling call',
    'Integration timeline discussion may benefit from shared Loom video',
  ],
  instagram: [
    'Anil Patel engaged with 3 product posts this week — warm lead for B2B pitch',
    'Recommend sending a personalised DM with B2B-specific demo link',
  ],
  telegram: [
    'Simran Sethi opens messages within 15 min — optimal send time is 5:00 PM',
    'She responded positively to competitor comparison — include in case studies',
  ],
};

export default function ChannelView({ channel }: ChannelViewProps) {
  const meta = channelMeta[channel];
  const contacts = channelContacts[channel] || [];
  const stats = channelStats[channel] || [];
  const insights = aiInsights[channel] || [];
  const [aiLoading, setAiLoading] = useState(true);
  const [revealedInsights, setRevealedInsights] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'waiting'>('all');

  useEffect(() => {
    setAiLoading(true);
    setRevealedInsights(0);
    const timer = setTimeout(() => setAiLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [channel]);

  useEffect(() => {
    if (!aiLoading && revealedInsights < insights.length) {
      const timer = setTimeout(() => setRevealedInsights(prev => prev + 1), 400);
      return () => clearTimeout(timer);
    }
  }, [aiLoading, revealedInsights, insights.length]);

  const filteredContacts = contacts.filter(c => {
    if (selectedFilter === 'unread' && !c.unread) return false;
    if (selectedFilter === 'waiting' && c.status !== 'waiting') return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Channel header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white flex-shrink-0`}>
            <span className="w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center">
              {getChannelIcon(channel)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base lg:text-lg font-bold text-slate-900">{meta.label}</h2>
            <p className="text-xs lg:text-sm text-slate-500 truncate">{meta.description}</p>
          </div>
          <a
            href={meta.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open {meta.label}</span>
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-5">
            <p className="text-xs lg:text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-xl lg:text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs lg:text-xs text-slate-400 mt-1 truncate">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Conversations list */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Search & Filter */}
          <div className="p-3 lg:p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${meta.label} conversations...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-base lg:text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'unread', 'waiting'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-3 py-2 lg:py-1.5 rounded-full text-sm lg:text-xs font-medium transition-all ${
                    selectedFilter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact list */}
          <div className="divide-y divide-slate-100">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No conversations found</div>
            ) : (
              filteredContacts.map(contact => (
                <div key={contact.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: contact.gradient }}
                    >
                      {contact.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-base lg:text-sm font-semibold ${contact.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                          {contact.name}
                        </span>
                        <span className="text-sm lg:text-xs text-slate-400">{contact.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {contact.direction === 'out' ? (
                          <ArrowUpRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        )}
                        <p className={`text-sm truncate ${contact.unread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                          {contact.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {contact.unread && <span className="w-2 h-2 bg-orange rounded-full" />}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        contact.status === 'active' ? 'bg-green-50 text-green-600'
                          : contact.status === 'waiting' ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {contact.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Insights panel */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-fit">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <img src="/logo.png" alt="" className={`w-5 h-5 ${aiLoading ? 'animate-spin-slow' : ''}`} />
            <div>
              <h3 className="text-sm font-bold text-slate-900">TorqeAI Insights</h3>
              <p className="text-xs text-slate-400">{meta.label} intelligence</p>
            </div>
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <img src="/logo.png" alt="" className="w-8 h-8 animate-spin-slow" />
              <p className="text-sm text-slate-400 animate-thinking">Analysing {meta.label} data...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {insights.slice(0, revealedInsights).map((insight, i) => (
                <div key={i} className="p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange" />
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                  </div>
                </div>
              ))}
              {revealedInsights >= insights.length && (
                <div className="p-4 animate-fade-in">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                    Ask TorqeAI about {meta.label}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
