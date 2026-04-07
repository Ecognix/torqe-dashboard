 'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, FileText, ArrowRight, Pencil, Smile, Zap, Star, Bot, TrendingUp, Mic, Plus, ChevronDown } from 'lucide-react';

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tab: 'agent' | 'negotiate';
  onTabChange: (tab: 'agent' | 'negotiate') => void;
  selectedMessageId?: number;
}

interface ChatMessage {
  role: 'bot' | 'user';
  name?: string;
  avatar?: string;
  text: string;
  time: string;
  isAction?: boolean;
}

const initialAgentMessages: ChatMessage[] = [
  { role: 'bot', name: 'TorqeAI', avatar: 'agent', text: "Hi Arjun! I'm your Torqe AI Agent. I can help you with your inbox, draft replies, summarise conversations, and manage follow-ups. What would you like me to do?", time: 'Just now' },
  { role: 'bot', name: 'TorqeAI', avatar: 'agent', text: '<strong>Quick tip:</strong> Use the action buttons above to run AI tools on your current conversation. Or just ask me anything!', time: 'Just now' }
];

const initialNegotiateMessages: ChatMessage[] = [
  { role: 'bot', name: 'Negotiation Coach', avatar: 'coach', text: "I'm your Negotiation Coach. I can analyse live deals, suggest counter-offers, coach you on negotiation tactics, and help you close more deals. Which deal would you like to work on?", time: 'Just now' },
  { role: 'bot', name: 'Negotiation Coach', avatar: 'coach', text: '<strong>Active deals:</strong> You have 8 deals in negotiation. Rahul Nair\'s deal (₹6L) has the highest close probability at 67%. Want me to analyse it?', time: 'Just now' }
];

export default function ChatbotPanel({ isOpen, onClose, tab, onTabChange }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialAgentMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('TorqeAI Pro');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'agent' | 'negotiate'>(tab);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(tab);
    setMessages(tab === 'agent' ? initialAgentMessages : initialNegotiateMessages);
  }, [tab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    if (showModelDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelDropdown]);

  const generateBotResponse = (userText: string, currentTab: 'agent' | 'negotiate'): string => {
    const lower = userText.toLowerCase();

    if (currentTab === 'agent') {
      if (lower.includes('summar')) {
        return `<strong>Summary of Rahul Nair's conversation:</strong><br><br>• Contact via WhatsApp<br>• Priority level: <strong>URGENT</strong><br>• Last message: "I've been waiting for the revised timeline — when can we expect it?"<br>• Sentiment: Urgency and frustration detected`;
      } else if (lower.includes('draft') || lower.includes('reply')) {
        return `<strong>Draft reply for Rahul:</strong><br><br>"Hi Rahul! Thanks for reaching out. I wanted to personally follow up on your message. I've reviewed everything on my end and have the details ready for you. Would you prefer a quick call or should I send everything over in a message?"<br><br><em>Tone: Professional & Warm</em>`;
      } else if (lower.includes('follow') || lower.includes('remind')) {
        return `<strong>Follow-up scheduled:</strong><br><br>I've queued a follow-up message for <strong>Rahul Nair</strong> optimised for their most active time. It'll be sent via <strong>WhatsApp</strong> at the next optimal window.<br><br><strong>Draft:</strong> "Hey Rahul, just wanted to check in — did you get a chance to review my last message?"`;
      } else if (lower.includes('help') || lower.includes('what can')) {
        return '<strong>Here\'s what I can do:</strong><br><br><strong>Summarise</strong> — Get a quick summary of any conversation<br><strong>Draft Reply</strong> — AI-generated response matched to your tone<br><strong>Follow-up</strong> — Schedule smart follow-ups after silence<br><strong>Smart Send</strong> — Send at the optimal time for each contact<br><strong>Vibe Check</strong> — Get a mood/objection analysis before calls<br><strong>Tone Rewrite</strong> — Rewrite messages in different tones<br><br>Just click the buttons above or ask me directly!';
      } else {
        return `Got it! I'm analysing your request regarding "<em>${userText}</em>" in the context of your conversation with <strong>Rahul Nair</strong>.<br><br>Based on the current thread, I'd recommend addressing their main concern directly and following up with specific details. Want me to draft a response or take a specific action?`;
      }
    } else {
      if (lower.includes('counter') || lower.includes('offer') || lower.includes('price')) {
        return '<strong>Counter-Offer Analysis:</strong><br><br>Based on Rahul\'s anchoring at ₹4.5L against your ₹6L proposal:<br><br><strong>Recommended:</strong> ₹5.4L (-10%) — Position as "early adopter rate" with free onboarding<br><strong>Conservative:</strong> ₹5.7L (-5%) — Add extra quarter of premium support<br><strong>Aggressive:</strong> ₹4.8L (-20%) — Only if deal is slipping, require 2-year commitment<br><br>At ₹5.4L, close probability increases from 67% to ~78%';
      } else if (lower.includes('close') || lower.includes('score') || lower.includes('likelihood')) {
        return '<strong>Close Likelihood: 67%</strong><br><br>Key signals:<br>• <strong>Engagement:</strong> High — responding within hours<br>• <strong>Objections:</strong> 2 open (pricing + timeline)<br>• <strong>Timeline:</strong> Decision expected this week<br>• <strong>Trend:</strong> Positive — stopped pushing back on price, asking about ROI<br><br><strong>Tip:</strong> Share a case study from his industry to push past 75%';
      } else if (lower.includes('strateg') || lower.includes('tactic') || lower.includes('tip')) {
        return '<strong>Negotiation Strategy for this deal:</strong><br><br>1. <strong>Feel, Felt, Found:</strong> "I understand your concern. Other companies in your space felt the same way, but found that the ROI justified the investment within Q1."<br><br>2. <strong>Quarterly billing:</strong> Offer to break annual fee into quarterly — reduces risk perception without cutting price<br><br>3. <strong>Urgency play:</strong> Free onboarding (₹50K value) if signed by Friday<br><br><strong>Avoid:</strong> Don\'t discount more than 15%. He wants value, not cheapness.';
      } else {
        return `Analysing your question: "<em>${userText}</em>"<br><br>In the context of the current deal with Rahul (₹6L enterprise plan), I'd suggest maintaining your value position. The buyer is showing positive engagement signals — this is not the time to make concessions unless strategically necessary.<br><br>Want me to prepare a specific counter-offer or analyse a different aspect?`;
      }
    }
  };

  const handleTabChange = (newTab: 'agent' | 'negotiate') => {
    setActiveTab(newTab);
    onTabChange(newTab);
    setMessages(newTab === 'agent' ? initialAgentMessages : initialNegotiateMessages);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input, time: 'Just now' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botResponse: ChatMessage = {
        role: 'bot',
        name: activeTab === 'agent' ? 'TorqeAI' : 'Negotiation Coach',
        avatar: activeTab === 'agent' ? 'agent' : 'coach',
        text: generateBotResponse(input, activeTab),
        time: 'Just now'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 2500 + Math.random() * 1000);
  };

  const handleAction = (action: string) => {
    const actionResponses: Record<string, { user: string; bot: string }> = {
      summarise: {
        user: `Summarise my conversation with Rahul Nair`,
        bot: `<strong>Conversation Summary — Rahul Nair</strong><br><br><strong>Channel:</strong> WhatsApp<br><strong>Priority:</strong> URGENT<br><strong>Messages exchanged:</strong> 4<br><strong>Last activity:</strong> 3 min ago<br><br><strong>Key points:</strong><br>• Latest message: "I've been waiting for the revised timeline — when can we expect it?"<br>• Needs immediate attention — frustration signals detected<br>• Recommended next action: Send a direct response acknowledging the delay`
      },
      followup: {
        user: `Create a follow-up for Rahul Nair`,
        bot: `<strong>Follow-up Draft Ready</strong><br><br><strong>To:</strong> Rahul Nair via WhatsApp<br><strong>Optimal send time:</strong> Tomorrow, 10:30 AM<br><br><strong>Draft message:</strong><br>"Hi Rahul! Just wanted to circle back on our last conversation. I have some updates that I think you'll find valuable. When would be a good time to connect?"<br><br><em>Click Approve & Send to queue this message.</em>`
      },
      smartsend: {
        user: `What's the best time to message Rahul Nair?`,
        bot: `<strong>Smart Send Analysis — Rahul Nair</strong><br><br>Based on Rahul's response patterns:<br><br><strong>Best time:</strong> 10:15 AM – 11:30 AM (weekdays)<br><strong>Good:</strong> 2:00 PM – 3:30 PM<br><strong>Avoid:</strong> After 6:00 PM and weekends<br><br><strong>Response rate:</strong> 89% within 2 hours when sent in the morning window<br><strong>Preferred channel:</strong> WhatsApp<br><br>I can schedule your message to send at the optimal time automatically.`
      },
      draft: {
        user: `Draft a reply to Rahul Nair`,
        bot: `<strong>AI Draft Reply — Rahul Nair</strong><br><br>"Hi Rahul! Thanks for your message. I've been reviewing everything and wanted to get back to you with a comprehensive response.<br><br>I understand the urgency here and want to assure you this is my top priority. I'm preparing the details right now and will have everything ready for you within the hour.<br><br>Looking forward to hearing from you!"<br><br><em>Tone: Professional & Responsive</em>`
      },
      vibecheck: {
        user: `Vibe check on Rahul Nair`,
        bot: `<strong>Vibe Check — Rahul Nair</strong><br><br><strong>Mood:</strong> Frustrated — tone is direct and expectant. Minimal pleasantries. Mentioned "waiting" twice.<br><br><strong>Objections:</strong> Concerned about speed of delivery. Expects immediate action.<br><br><strong>Best Angle:</strong> Lead with urgency acknowledgment and immediate next steps. No fluff.<br><br><strong>Energy match:</strong> Be responsive, concise, and action-oriented`
      },
      tone: {
        user: `Rewrite my last message to Rahul Nair in different tones`,
        bot: `<strong>Tone Rewrite Options</strong><br><br><strong>Professional:</strong><br>"Dear Rahul, thank you for your continued patience. I've prepared a comprehensive update that addresses your key concerns. Shall we schedule a brief call to review?"<br><br><strong>Casual:</strong><br>"Hey Rahul! Got everything sorted out on my end. Want to hop on a quick call and go through it together?"<br><br><strong>Assertive:</strong><br>"Rahul, I have the full breakdown ready. Let's lock in a time today to review and move forward decisively."<br><br><strong>Warm:</strong><br>"Hi Rahul! I really appreciate you reaching out. I've put extra care into preparing this — I think you'll feel great about what we've got. When can we chat?"`
      }
    };

    const response = actionResponses[action];
    if (!response) return;

    const userMessage: ChatMessage = { role: 'user', text: response.user, time: 'Just now' };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: ChatMessage = {
        role: 'bot',
        name: activeTab === 'agent' ? 'TorqeAI' : 'Negotiation Coach',
        avatar: activeTab === 'agent' ? 'agent' : 'coach',
        text: response.bot,
        time: 'Just now',
        isAction: true
      };
      setMessages(prev => [...prev, botMessage]);
    }, 2000 + Math.random() * 800);
  };

  const renderAvatar = (avatar?: string) => {
    if (avatar === 'agent') {
      return <img src="/logo.png" alt="TorqeAI" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />;
    }
    if (avatar === 'coach') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between p-2.5 lg:p-4 border-b border-slate-200">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => handleTabChange('agent')}
            className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
              activeTab === 'agent'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <img src="/logo.png" alt="TorqeAI" className="w-4 h-4 lg:w-5 lg:h-5" style={activeTab === 'agent' ? { filter: 'brightness(0) invert(1)' } : {}} />
            TorqeAI
          </button>
          <button
            onClick={() => handleTabChange('negotiate')}
            className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
              activeTab === 'negotiate'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            Negotiation Coach
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* AI Tool Action Buttons */}
      <div className="flex gap-1.5 lg:gap-2 p-2 lg:p-3 border-b border-slate-100 overflow-x-auto bg-slate-50">
        <button onClick={() => handleAction('summarise')} className="flex items-center gap-1 lg:gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white text-slate-600 text-[11px] lg:text-xs font-medium hover:bg-slate-100 whitespace-nowrap transition-all border border-slate-200">
          <FileText className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          Summarise
        </button>
        <button onClick={() => handleAction('followup')} className="flex items-center gap-1 lg:gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white text-slate-600 text-[11px] lg:text-xs font-medium hover:bg-slate-100 whitespace-nowrap transition-all border border-slate-200">
          <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          Follow-up
        </button>
        <button onClick={() => handleAction('smartsend')} className="flex items-center gap-1 lg:gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white text-slate-600 text-[11px] lg:text-xs font-medium hover:bg-slate-100 whitespace-nowrap transition-all border border-slate-200">
          <Zap className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          Smart Send
        </button>
        <button onClick={() => handleAction('draft')} className="flex items-center gap-1 lg:gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white text-slate-600 text-[11px] lg:text-xs font-medium hover:bg-slate-100 whitespace-nowrap transition-all border border-slate-200">
          <Pencil className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          Draft
        </button>
        <button onClick={() => handleAction('vibecheck')} className="flex items-center gap-1 lg:gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white text-slate-600 text-[11px] lg:text-xs font-medium hover:bg-slate-100 whitespace-nowrap transition-all border border-slate-200">
          <Smile className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          Vibe
        </button>
        <button onClick={() => handleAction('tone')} className="flex items-center gap-1 lg:gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white text-slate-600 text-[11px] lg:text-xs font-medium hover:bg-slate-100 whitespace-nowrap transition-all border border-slate-200">
          <Star className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          Tone
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 lg:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'bot' && (
              msg.avatar === 'agent' ? (
                <div className="w-7 h-7 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0">
                  <img src="/logo.png" alt="TorqeAI" className="w-6 h-6 lg:w-9 lg:h-9" />
                </div>
              ) : (
                <div className="w-7 h-7 lg:w-10 lg:h-10 flex items-center justify-center text-slate-900 flex-shrink-0">
                  {renderAvatar(msg.avatar)}
                </div>
              )
            )}
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 lg:px-4 lg:py-3 ${
              msg.role === 'bot'
                ? 'text-slate-800 rounded-tl-sm'
                : 'bg-orange text-white rounded-tr-sm'
            } ${msg.isAction ? 'border border-slate-200' : ''}`}>
              {msg.role === 'bot' && (
                <p className="font-bold mb-0.5 lg:mb-1 text-xs lg:text-sm text-slate-900">
                  {msg.name}
                </p>
              )}
              <p className="text-xs lg:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text }} />
              <p className={`text-[10px] lg:text-xs mt-1 ${msg.role === 'bot' ? 'text-slate-400' : 'text-orange-200'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="TorqeAI" className="w-9 h-9 animate-spin-slow" />
            </div>
            <span className="text-sm font-medium text-slate-500 animate-thinking">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Model Selector + Input */}
      <div className="p-3 lg:p-4 border-t border-slate-200 space-y-2">
        {/* AI Model Selector */}
        <div className="relative" ref={modelRef}>
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <img src="/logo.png" alt="" className="w-3.5 h-3.5" />
            {selectedModel}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showModelDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden animate-scale-in">
              {['TorqeAI Pro', 'TorqeAI Lite', 'GPT-4o', 'Claude Sonnet'].map((model) => (
                <button
                  key={model}
                  onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                    selectedModel === model ? 'bg-orange/5 text-orange font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <img src="/logo.png" alt="" className="w-4 h-4" />
                  {model}
                  {selectedModel === model && <span className="ml-auto text-orange text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Row */}
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={activeTab === 'agent' ? 'Ask Torqe anything...' : 'Ask about deal strategy...'}
              className="w-full bg-slate-100 rounded-full px-4 pr-11 py-3 lg:py-3 text-base lg:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange/50"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-orange">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleSend}
            className="p-3 rounded-full bg-orange text-white hover:bg-orange-500 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
