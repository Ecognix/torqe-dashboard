'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, Video, Phone, MapPin, Sparkles, Plus, Filter, X, Check } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  duration: string;
  type: 'call' | 'meeting' | 'follow-up' | 'demo' | 'ai-suggested';
  contact?: string;
  channel?: string;
  color: string;
  aiInsight?: string;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const defaultEvents: CalendarEvent[] = [
  { id: 1, title: 'Follow-up call with Rahul Nair', time: '10:00 AM', duration: '30 min', type: 'call', contact: 'Rahul Nair', channel: 'WhatsApp', color: 'bg-orange', aiInsight: 'High urgency — Rahul has been waiting 2 days for timeline update' },
  { id: 2, title: 'Product demo for Priya Mehta', time: '11:30 AM', duration: '45 min', type: 'demo', contact: 'Priya Mehta', channel: 'Gmail', color: 'bg-blue-500', aiInsight: 'Enterprise buyer evaluating for 50+ team — prepare pricing tiers' },
  { id: 3, title: 'Team standup', time: '2:00 PM', duration: '15 min', type: 'meeting', color: 'bg-purple-500' },
  { id: 4, title: 'Negotiation review — Deepa Krishnan', time: '3:30 PM', duration: '30 min', type: 'call', contact: 'Deepa Krishnan', channel: 'WhatsApp', color: 'bg-green-500', aiInsight: 'Board meeting Friday — decision expected this week' },
  { id: 5, title: 'Contract renewal — Meera Sharma', time: '4:30 PM', duration: '20 min', type: 'follow-up', contact: 'Meera Sharma', channel: 'Gmail', color: 'bg-red-500', aiInsight: 'URGENT: Contract expires tomorrow — send renewal terms ASAP' },
];

const aiSuggestedEvents: CalendarEvent[] = [
  { id: 101, title: 'Best time to message Vikram Singh', time: '10:15 AM', duration: '—', type: 'ai-suggested', contact: 'Vikram Singh', channel: 'LinkedIn', color: 'bg-slate-900', aiInsight: '89% response rate in morning window. He usually responds within 2 hours.' },
  { id: 102, title: 'Follow-up window for Karan Reddy', time: '2:30 PM', duration: '—', type: 'ai-suggested', contact: 'Karan Reddy', channel: 'WhatsApp', color: 'bg-slate-900', aiInsight: 'Silent for 4h — optimal re-engagement time based on past patterns.' },
  { id: 103, title: 'Send case studies to Simran Sethi', time: '5:00 PM', duration: '—', type: 'ai-suggested', contact: 'Simran Sethi', channel: 'Telegram', color: 'bg-slate-900', aiInsight: 'She requested case studies 5h ago. Evening send has 72% open rate.' },
];

const calendarStats = [
  { label: 'Today\'s Events', value: '5', sub: '2 calls, 1 demo, 2 follow-ups' },
  { label: 'AI Suggestions', value: '3', sub: 'Optimal send times & follow-ups' },
  { label: 'This Week', value: '18', sub: '6 calls, 4 demos, 8 follow-ups' },
  { label: 'Completion Rate', value: '94%', sub: '+6% with AI scheduling' },
];

const eventTypeColors: Record<string, string> = {
  call: 'bg-orange',
  demo: 'bg-blue-500',
  meeting: 'bg-purple-500',
  'follow-up': 'bg-green-500',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(now.getDate());
  const [aiLoading, setAiLoading] = useState(true);
  const [revealedAiCards, setRevealedAiCards] = useState(0);
  const [typedInsights, setTypedInsights] = useState<Record<number, string>>({});
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);
  const [dismissedAi, setDismissedAi] = useState<number[]>([]);
  const [scheduledAi, setScheduledAi] = useState<number[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  // New event form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('30 min');
  const [newType, setNewType] = useState<'call' | 'meeting' | 'follow-up' | 'demo'>('call');
  const [newContact, setNewContact] = useState('');
  const [newChannel, setNewChannel] = useState('');

  // AI loading and staggered reveal
  useEffect(() => {
    const timer = setTimeout(() => setAiLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const visibleAi = aiSuggestedEvents.filter(e => !dismissedAi.includes(e.id));
    if (!aiLoading && revealedAiCards < visibleAi.length) {
      const timer = setTimeout(() => setRevealedAiCards(prev => prev + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [aiLoading, revealedAiCards, dismissedAi]);

  // Typewriter effect for AI insights
  useEffect(() => {
    const visibleAi = aiSuggestedEvents.filter(e => !dismissedAi.includes(e.id));
    visibleAi.forEach((event, i) => {
      if (i < revealedAiCards && event.aiInsight) {
        const currentTyped = typedInsights[event.id] || '';
        if (currentTyped.length < event.aiInsight.length) {
          const timer = setTimeout(() => {
            setTypedInsights(prev => ({
              ...prev,
              [event.id]: event.aiInsight!.slice(0, currentTyped.length + 1),
            }));
          }, 18);
          return () => clearTimeout(timer);
        }
      }
    });
  }, [revealedAiCards, typedInsights, dismissedAi]);

  // Close filter on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const eventDays = [today, today + 1, today + 3, today + 5, today + 7];
  const aiDays = [today, today + 2, today + 4];

  const filteredEvents = activeFilters.length === 0
    ? events
    : events.filter(e => activeFilters.includes(e.type));

  const toggleFilter = (type: string) => {
    setActiveFilters(prev =>
      prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    );
  };

  const handleNewEvent = () => {
    if (!newTitle.trim() || !newTime.trim()) return;
    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: newTitle,
      time: newTime,
      duration: newDuration,
      type: newType,
      contact: newContact || undefined,
      channel: newChannel || undefined,
      color: eventTypeColors[newType] || 'bg-slate-500',
    };
    setEvents(prev => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
    setNewTitle('');
    setNewTime('');
    setNewDuration('30 min');
    setNewType('call');
    setNewContact('');
    setNewChannel('');
    setShowNewEvent(false);
  };

  const handleDismissAi = (id: number) => {
    setDismissedAi(prev => [...prev, id]);
  };

  const handleScheduleAi = (event: CalendarEvent) => {
    setScheduledAi(prev => [...prev, event.id]);
    const newEvent: CalendarEvent = {
      ...event,
      type: 'follow-up',
      color: 'bg-green-500',
      duration: '15 min',
    };
    setEvents(prev => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const visibleAiEvents = aiSuggestedEvents.filter(e => !dismissedAi.includes(e.id) && !scheduledAi.includes(e.id));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {calendarStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-5">
            <p className="text-[10px] lg:text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-xl lg:text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-[10px] lg:text-xs text-slate-400 mt-1 truncate">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <h2 className="text-base lg:text-lg font-bold text-slate-900">{monthNames[currentMonth]} {currentYear}</h2>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeFilters.length > 0 ? 'bg-orange/10 text-orange' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-10 animate-scale-in overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 px-2 py-1">Event Type</p>
                    </div>
                    {(['call', 'demo', 'meeting', 'follow-up'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => toggleFilter(type)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          activeFilters.includes(type) ? 'bg-slate-900 border-slate-900' : 'border-slate-300'
                        }`}>
                          {activeFilters.includes(type) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`w-2 h-2 rounded-full ${eventTypeColors[type]}`} />
                        <span className="text-sm text-slate-700 capitalize">{type.replace('-', ' ')}</span>
                      </button>
                    ))}
                    {activeFilters.length > 0 && (
                      <div className="p-2 border-t border-slate-100">
                        <button
                          onClick={() => setActiveFilters([])}
                          className="w-full text-xs text-slate-500 hover:text-slate-700 py-1 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* New Event */}
              <button
                onClick={() => setShowNewEvent(true)}
                className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Event</span>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = isCurrentMonth && day === today;
              const isSelected = isCurrentMonth && day === selectedDate;
              const hasEvent = isCurrentMonth && eventDays.includes(day);
              const hasAi = isCurrentMonth && aiDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : isToday
                        ? 'bg-orange/10 text-orange font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                  {(hasEvent || hasAi) && (
                    <div className="flex gap-0.5 mt-0.5">
                      {hasEvent && <span className="w-1 h-1 rounded-full bg-orange" />}
                      {hasAi && <span className="w-1 h-1 rounded-full bg-slate-900" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-orange" /> Events
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-900" /> AI Suggested
            </div>
          </div>
        </div>

        {/* Right panel — Today's schedule */}
        <div className="space-y-4">
          {/* Today's events */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Today&apos;s Schedule</h3>
              <p className="text-xs text-slate-400 mt-0.5">{filteredEvents.length} events {activeFilters.length > 0 ? '(filtered)' : 'planned'}</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No events match your filter</div>
              ) : (
                filteredEvents.map(event => (
                  <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-full min-h-[40px] rounded-full ${event.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" /> {event.time} · {event.duration}
                          </span>
                        </div>
                        {event.contact && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <Users className="w-3 h-3" /> {event.contact}{event.channel ? ` via ${event.channel}` : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {event.type === 'call' && <Phone className="w-4 h-4 text-slate-400" />}
                        {event.type === 'demo' && <Video className="w-4 h-4 text-slate-400" />}
                        {event.type === 'meeting' && <Users className="w-4 h-4 text-slate-400" />}
                        {event.type === 'follow-up' && <MapPin className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Suggested time slots */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <img src="/logo.png" alt="" className={`w-5 h-5 ${aiLoading ? 'animate-spin-slow' : ''}`} />
              <div>
                <h3 className="text-sm font-bold text-slate-900">TorqeAI Suggestions</h3>
                <p className="text-xs text-slate-400">Optimal times based on contact patterns</p>
              </div>
            </div>

            {aiLoading ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="relative">
                  <img src="/logo.png" alt="" className="w-10 h-10 animate-spin-slow" />
                  <div className="absolute inset-0 rounded-full animate-ai-glow" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-medium text-slate-500 animate-thinking">Analysing schedules...</p>
                  <p className="text-xs text-slate-400">Scanning contact patterns & optimal windows</p>
                </div>
                <div className="flex gap-3 mt-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-orange/40 animate-shimmer" style={{ animationDelay: `${i * 300}ms` }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : visibleAiEvents.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-400">All suggestions handled</p>
                <p className="text-xs text-slate-300 mt-1">New suggestions will appear as patterns emerge</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleAiEvents.slice(0, revealedAiCards).map((event, i) => (
                  <div
                    key={event.id}
                    className="p-4 hover:bg-slate-50 transition-colors animate-ai-card-in animate-shimmer"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0 animate-ai-glow">
                        <Sparkles className="w-4 h-4 text-orange" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{event.time} · {event.channel}</p>
                        {event.aiInsight && (
                          <p className="text-xs text-orange mt-1.5 leading-relaxed">
                            {typedInsights[event.id] || ''}
                            {(typedInsights[event.id] || '').length < event.aiInsight.length && (
                              <span className="inline-block w-0.5 h-3 bg-orange animate-pulse ml-0.5 align-middle" />
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 ml-11">
                      <button
                        onClick={() => handleScheduleAi(event)}
                        className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                      >
                        Schedule
                      </button>
                      <button
                        onClick={() => handleDismissAi(event.id)}
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      {showNewEvent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setShowNewEvent(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">New Event</h3>
              <button onClick={() => setShowNewEvent(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Event Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Follow-up call with client"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Time *</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Duration</label>
                  <select
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                  >
                    <option>15 min</option>
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['call', 'demo', 'meeting', 'follow-up'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={`px-2 py-2 rounded-xl text-xs font-medium transition-all capitalize ${
                        newType === type
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Contact</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={e => setNewContact(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Channel</label>
                  <select
                    value={newChannel}
                    onChange={e => setNewChannel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-300 focus:bg-white transition-all"
                  >
                    <option value="">None</option>
                    <option>WhatsApp</option>
                    <option>Gmail</option>
                    <option>LinkedIn</option>
                    <option>Slack</option>
                    <option>Instagram</option>
                    <option>Telegram</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
              <button
                onClick={() => setShowNewEvent(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewEvent}
                disabled={!newTitle.trim() || !newTime.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
