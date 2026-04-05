'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, PenLine, Brain, Paperclip, Image, Smile, Zap, X, Send, Clock, Plane, ArrowLeft } from 'lucide-react';
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
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autopilotRef = useRef<NodeJS.Timeout | null>(null);

  const filteredMessages = messages.filter(msg => {
    if (filter === 'urgent') return msg.priority === 'urgent';
    if (filter === 'high') return msg.priority === 'high';
    if (filter === 'unread') return msg.unread;
    return true;
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
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inboxStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 h-[calc(100vh-220px)] lg:h-[calc(100vh-220px)]">
        {/* Message List */}
        <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col ${mobileShowThread ? 'hidden lg:flex' : 'flex'}`}>
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 flex gap-2 flex-wrap">
            {['All', 'Urgent', 'High', 'Unread'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f.toLowerCase())}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f.toLowerCase()
                    ? 'bg-orange text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  setAiCard(null);
                  setMobileShowThread(true);
                }}
                className={`w-full flex items-start gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${
                  selectedMessage.id === msg.id ? 'bg-orange/5 border-l-4 border-l-orange' : ''
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: msg.gradient }}
                >
                  {msg.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold text-sm ${msg.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                      {msg.name}
                    </span>
                    <span className="text-xs text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{msg.preview}</p>
                </div>
                <div className="flex flex-col items-end justify-between h-full flex-shrink-0">
                  {msg.unread && (
                    <span className="w-2 h-2 bg-orange rounded-full" />
                  )}
                  <span className="w-7 h-7 p-1.5 bg-slate-900 rounded text-white mt-6 flex items-center justify-center flex-shrink-0">
                    {getChannelIcon(msg.channel)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread Panel */}
        <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col ${mobileShowThread ? 'flex' : 'hidden lg:flex'}`}>
          {/* Thread Header */}
          <div className="p-3 lg:p-4 border-b border-slate-100 flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => setMobileShowThread(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onProfileClick?.(selectedMessage)}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-orange/50 transition-all cursor-pointer flex-shrink-0"
              style={{ background: selectedMessage.gradient }}
            >
              {selectedMessage.initials}
            </button>
            <button onClick={() => onProfileClick?.(selectedMessage)} className="flex-1 text-left hover:opacity-80 transition-opacity min-w-0">
              <h3 className="font-bold text-slate-900 text-sm lg:text-base truncate">{selectedMessage.name}</h3>
              <p className="text-xs text-slate-500 truncate">{selectedMessage.channelLabel} - Last active {selectedMessage.time}</p>
            </button>
            <div className="flex gap-1.5 lg:gap-2 flex-shrink-0">
              <button 
                onClick={() => handleInlineAi('summarise')}
                className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Summarise</span>
              </button>
              <button 
                onClick={() => handleInlineAi('draft')}
                className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Draft</span>
              </button>
              <button 
                onClick={() => onChatbotAction('agent')}
                className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 rounded-full bg-orange/10 text-orange text-xs font-medium hover:bg-orange/20 transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vibe</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {threadMessages.map((msg, i) => (
              <div 
                key={i}
                className={`flex animate-msg-fade-in ${
                  msg.type === 'outgoing' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="flex flex-col">
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.type === 'outgoing' 
                      ? 'bg-orange text-white rounded-tr-sm' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <p className={`text-xs mt-1 ${msg.type === 'outgoing' ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {/* AI Card */}
            {aiCard && (
              <div className="max-w-[85%] animate-fade-in">
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 inline-block">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-700">
                      {aiCard.type === 'summary' ? 'Conversation Summary' : 'AI Draft Reply'}
                    </span>
                  </div>
                  <p className="text-sm text-purple-800 leading-relaxed mb-4">{aiCard.content}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={sendAiDraft}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                    <button 
                      onClick={() => setAiCard(null)}
                      className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="p-3 lg:p-4 border-t border-slate-100">
            {/* Autopilot Bar */}
            {autopilotActive && (
              <div className="flex items-center justify-between bg-purple-100 border border-purple-200 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 mb-3 animate-fade-in">
                <div className="flex items-center gap-2 lg:gap-3">
                  <Plane className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-purple-700">Autopilot Active</p>
                    <p className="text-xs text-purple-500 hidden sm:block">Sending at optimal time</p>
                  </div>
                </div>
                <button 
                  onClick={cancelAutopilot}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-purple-200 text-purple-700 text-xs font-medium hover:bg-purple-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {autopilotTime}s
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden sm:flex gap-1">
                <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                  <Image className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 rounded-full px-4 lg:px-5 py-2.5 lg:py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange/50"
              />
              <button 
                onClick={triggerAutopilot}
                disabled={!inputValue.trim() || autopilotActive}
                className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2.5 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Smart Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
