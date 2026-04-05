'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Search, TrendingUp, Bell, Settings, Sparkles, MessageSquare, User, BarChart3, Calendar } from 'lucide-react';
import NotificationPopup from './NotificationPopup';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onChatbotToggle: (tab: 'agent' | 'negotiate') => void;
  chatbotTab: 'agent' | 'negotiate';
  onNotificationClick: () => void;
  onSettingsClick: () => void;
}

interface AiSuggestion {
  icon: 'contact' | 'message' | 'deal' | 'schedule' | 'ai';
  label: string;
  subtitle: string;
}

const aiSuggestionSets: Record<string, AiSuggestion[]> = {
  '': [
    { icon: 'ai', label: 'Show urgent conversations', subtitle: 'AI — 7 urgent threads need attention' },
    { icon: 'contact', label: 'Rahul Nair', subtitle: 'WhatsApp · Last active 3m ago' },
    { icon: 'deal', label: 'Deals closing this week', subtitle: 'AI — 3 deals worth ₹12L closing soon' },
    { icon: 'schedule', label: 'Pending follow-ups', subtitle: 'AI — 5 follow-ups awaiting approval' },
  ],
  'rahul': [
    { icon: 'contact', label: 'Rahul Nair', subtitle: 'WhatsApp · Urgent priority' },
    { icon: 'message', label: 'Latest message from Rahul', subtitle: '"I\'ve been waiting for the revised timeline..."' },
    { icon: 'ai', label: 'Summarise Rahul\'s thread', subtitle: 'AI — Generate instant summary' },
    { icon: 'deal', label: 'Rahul\'s deal — ₹6L', subtitle: 'AI — 67% close probability' },
  ],
  'priya': [
    { icon: 'contact', label: 'Priya Mehta', subtitle: 'Gmail · High priority' },
    { icon: 'message', label: 'Enterprise pricing inquiry', subtitle: '"Could you share the enterprise pricing breakdown?"' },
    { icon: 'ai', label: 'Draft reply for Priya', subtitle: 'AI — Generate pricing response' },
  ],
  'deal': [
    { icon: 'deal', label: 'Active deals overview', subtitle: 'AI — 8 deals in negotiation, ₹24L total' },
    { icon: 'ai', label: 'Best deal to close today', subtitle: 'AI — Rahul Nair ₹6L (67% probability)' },
    { icon: 'deal', label: 'Counter-offers pending', subtitle: 'AI — 3 counter-offers need review' },
  ],
  'urgent': [
    { icon: 'ai', label: 'All urgent threads', subtitle: 'AI — 7 conversations need immediate action' },
    { icon: 'contact', label: 'Rahul Nair — Urgent', subtitle: 'Waiting for revised timeline' },
    { icon: 'contact', label: 'Deepa Krishnan — Urgent', subtitle: 'Voice note about API webhooks' },
    { icon: 'contact', label: 'Meera Sharma — Urgent', subtitle: 'Contract expires tomorrow' },
  ],
  'follow': [
    { icon: 'schedule', label: 'Pending follow-ups', subtitle: 'AI — 5 scheduled, 3 overdue' },
    { icon: 'ai', label: 'Auto-generate follow-ups', subtitle: 'AI — Create follow-ups for silent threads' },
    { icon: 'schedule', label: 'Smart send queue', subtitle: '12 messages optimised for best time' },
  ],
};

const placeholderTexts = [
  'Search with AI...',
  'Try "urgent messages"',
  'Try "Rahul Nair deal"',
  'Try "pending follow-ups"',
  'Try "deals closing this week"',
];

function getSuggestionIcon(icon: string) {
  switch (icon) {
    case 'contact': return <User className="w-4 h-4" />;
    case 'message': return <MessageSquare className="w-4 h-4" />;
    case 'deal': return <BarChart3 className="w-4 h-4" />;
    case 'schedule': return <Calendar className="w-4 h-4" />;
    case 'ai': return <Sparkles className="w-4 h-4" />;
    default: return <Search className="w-4 h-4" />;
  }
}

function matchSuggestions(query: string): AiSuggestion[] {
  const q = query.toLowerCase().trim();
  if (!q) return aiSuggestionSets[''] || [];
  for (const key of Object.keys(aiSuggestionSets)) {
    if (key && q.includes(key)) return aiSuggestionSets[key];
  }
  return [
    { icon: 'ai', label: `Search for "${query}"`, subtitle: 'AI — Searching across all conversations & contacts' },
    { icon: 'ai', label: `Ask TorqeAI about "${query}"`, subtitle: 'AI — Get smart insights' },
  ];
}

export default function Header({ title, onMenuClick, onChatbotToggle, chatbotTab, onNotificationClick, onSettingsClick }: HeaderProps) {
  const [notificationPopupOpen, setNotificationPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [isTypingPlaceholder, setIsTypingPlaceholder] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  // Animated placeholder typing effect
  useEffect(() => {
    const target = placeholderTexts[placeholderIndex];
    if (isTypingPlaceholder) {
      if (typedPlaceholder.length < target.length) {
        const timer = setTimeout(() => {
          setTypedPlaceholder(target.slice(0, typedPlaceholder.length + 1));
        }, 60);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setIsTypingPlaceholder(false), 2000);
        return () => clearTimeout(timer);
      }
    } else {
      if (typedPlaceholder.length > 0) {
        const timer = setTimeout(() => {
          setTypedPlaceholder(typedPlaceholder.slice(0, -1));
        }, 30);
        return () => clearTimeout(timer);
      } else {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
        setIsTypingPlaceholder(true);
      }
    }
  }, [typedPlaceholder, isTypingPlaceholder, placeholderIndex]);

  // AI search with delay
  useEffect(() => {
    if (searchFocused) {
      setIsAiSearching(true);
      const timer = setTimeout(() => {
        setSuggestions(matchSuggestions(searchQuery));
        setIsAiSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchFocused]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setNotificationPopupOpen(!notificationPopupOpen);
  };

  const handleViewAll = () => {
    setNotificationPopupOpen(false);
    onNotificationClick();
  };

  const handleSuggestionClick = (suggestion: AiSuggestion) => {
    setSearchQuery(suggestion.label);
    setSearchFocused(false);
  };

  return (
    <header className="relative h-14 min-h-[56px] lg:h-16 lg:min-h-[64px] border-b border-slate-200 bg-white flex items-center px-3 lg:px-6 gap-2 lg:gap-4 sticky top-0 z-40">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <h1 className="hidden md:block text-lg font-bold text-slate-900 whitespace-nowrap">{title}</h1>

      {/* Smart AI Search */}
      <div className="flex-1 max-w-lg ml-0 md:ml-4" ref={searchRef}>
        <div className="relative">
          {/* Search icon or spinning logo */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
            {isAiSearching && searchFocused ? (
              <img src="/logo.png" alt="" className="w-6 h-6 animate-spin-slow" />
            ) : (
              <img src="/logo.png" alt="" className="w-6 h-6" />
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder={searchFocused ? 'Ask TorqeAI anything...' : typedPlaceholder}
            className={`w-full border rounded-full py-2 lg:py-2.5 pl-11 lg:pl-12 pr-4 text-sm text-slate-900 focus:outline-none transition-all ${
              searchFocused
                ? 'bg-white border-slate-300 shadow-lg shadow-slate-200/50'
                : 'bg-white border-slate-200 placeholder:text-slate-400'
            }`}
          />
          {searchFocused && !searchQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">
              AI-Powered
            </span>
          )}

          {/* Suggestions dropdown */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <img src="/logo.png" alt="" className={`w-4 h-4 ${isAiSearching ? 'animate-spin-slow' : ''}`} />
                <span className="text-xs font-semibold text-slate-500">
                  {isAiSearching ? 'TorqeAI is searching...' : searchQuery ? `Results for "${searchQuery}"` : 'TorqeAI Suggestions'}
                </span>
              </div>

              {/* Suggestions */}
              <div className="max-h-[280px] overflow-y-auto">
                {isAiSearching ? (
                  <div className="flex items-center justify-center py-6 gap-3">
                    <img src="/logo.png" alt="" className="w-6 h-6 animate-spin-slow" />
                    <span className="text-sm text-slate-400 animate-thinking">Searching...</span>
                  </div>
                ) : (
                  suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        s.icon === 'ai' ? 'bg-orange/10 text-orange' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {getSuggestionIcon(s.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{s.label}</p>
                        <p className="text-xs text-slate-400 truncate">{s.subtitle}</p>
                      </div>
                      {s.icon === 'ai' && (
                        <span className="text-[10px] font-bold text-orange bg-orange/10 px-2 py-0.5 rounded-full flex-shrink-0">AI</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button 
          onClick={() => onChatbotToggle('agent')}
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
            chatbotTab === 'agent'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="TorqeAI"
        >
          <img src="/logo.png" alt="TorqeAI" className="w-[18px] h-[18px]" style={chatbotTab === 'agent' ? { filter: 'brightness(0) invert(1)' } : {}} />
          <span className="text-xs font-semibold hidden lg:inline">TorqeAI</span>
        </button>
        
        <button 
          onClick={() => onChatbotToggle('negotiate')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
            chatbotTab === 'negotiate'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Negotiation Coach"
        >
          <TrendingUp size={18} />
          <span className="text-xs font-semibold hidden lg:inline">Negotiation Coach</span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-0.5 lg:mx-1 hidden sm:block" />

        {/* Notification Button with Popup */}
        <div className="relative">
          <button 
            onClick={handleNotificationClick}
            className="relative p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-slate-900 rounded-full" />
          </button>
          
          <NotificationPopup
            isOpen={notificationPopupOpen}
            onClose={() => setNotificationPopupOpen(false)}
            onViewAll={handleViewAll}
          />
        </div>

        {/* Settings Button */}
        <button 
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
          title="Settings"
        >
          <Settings className="w-4.5 h-4.5" size={18} />
        </button>
      </div>
    </header>
  );
}
