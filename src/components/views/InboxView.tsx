'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, PenLine, Brain, Paperclip, Image, Smile, Zap, X, Send, Clock, Plane, ArrowLeft, Mic, Search, SlidersHorizontal, Plus, Star, MoreVertical, Check, CheckCheck, Sparkles, Calendar, RefreshCw, Pencil } from 'lucide-react';
import { messages, inboxStats } from '@/lib/data';
import { getChannelIcon } from '@/lib/icons';
import StatCard from '@/components/StatCard';
import type { Message } from '@/types';

interface InboxViewProps {
  onChatbotAction: (tab: 'agent' | 'negotiate') => void;
  onProfileClick?: (contact: Message) => void;
}

export default function InboxView({ onChatbotAction, onProfileClick }: InboxViewProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message>(messages[0]);
  const [filter, setFilter] = useState<string>('all');
  const [inputValue, setInputValue] = useState('');
  const [threadMessages, setThreadMessages] = useState<Message['thread']>(messages[0].thread);
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autopilotRef = useRef<NodeJS.Timeout | null>(null);

  const filteredMessages = messages.filter(msg => {
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
    setThreadMessages(selectedMessage.thread);
  }, [selectedMessage]);

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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
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
                
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm"
                    style={{ background: msg.gradient }}
                  >
                    {msg.initials}
                  </div>
                  {msg.unread && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs lg:text-sm font-semibold truncate ${msg.unread ? 'text-slate-900' : 'text-slate-600'}`}>
                        {msg.name}
                      </span>
                      <span className="w-[18px] h-[18px] lg:w-5 lg:h-5 flex items-center justify-center text-slate-900 flex-shrink-0">
                        {getChannelIcon(msg.channel)}
                      </span>
                    </div>
                    <span className="text-[10px] lg:text-[11px] text-slate-400 flex-shrink-0">{msg.time}</span>
                  </div>
                  <p className={`text-[11px] lg:text-xs leading-relaxed truncate ${msg.unread ? 'text-slate-600' : 'text-slate-400'}`}>
                    {msg.preview}
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
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:ring-2 hover:ring-orange/40 transition-all cursor-pointer flex-shrink-0"
                style={{ background: selectedMessage.gradient }}
              >
                {selectedMessage.initials}
              </button>

              {/* Name & info */}
              <button onClick={() => onProfileClick?.(selectedMessage)} className="flex-1 text-left min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{selectedMessage.name}</h3>
                <p className="text-xs text-slate-400 truncate">{selectedMessage.channelLabel} · Last active {selectedMessage.time}</p>
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
                className={`flex animate-msg-fade-in ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] lg:max-w-[70%] ${msg.type === 'outgoing' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-2.5 ${
                    msg.type === 'outgoing' 
                      ? 'bg-orange text-white rounded-2xl rounded-br-md' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md shadow-sm'
                  }`}>
                    <p className="text-[13px] lg:text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{msg.text}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-1 ${msg.type === 'outgoing' ? 'flex-row-reverse' : ''}`}>
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
