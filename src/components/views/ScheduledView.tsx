'use client';

import { Calendar, Clock, Eye, Trash2, Zap, CheckCircle, Send } from 'lucide-react';
import { getChannelIcon } from '@/lib/icons';
import StatCard from '@/components/StatCard';

const scheduledStats = [
  { label: 'Scheduled Messages', value: '12', change: 'Optimized send times', changeType: 'up' as const },
  { label: 'Pending Approval', value: '5', change: 'Awaiting your review', color: 'text-orange' },
  { label: 'Sent Today', value: '7', change: '+2 from yesterday', changeType: 'up' as const },
  { label: 'Avg Open Rate', value: '94', suffix: '%', change: '+3% vs manual', changeType: 'up' as const },
];

const scheduledMessages = [
  { id: 1, name: 'Priya Mehta', initials: 'PM', gradient: 'bg-gradient-to-br from-blue-500 to-blue-400', channel: 'gmail', sendAt: '9:15 AM', day: 'Today', message: 'Following up on the enterprise pricing discussion we had last week...', status: 'scheduled' },
  { id: 2, name: 'Deepa Krishnan', initials: 'DK', gradient: 'bg-gradient-to-br from-green-500 to-green-400', channel: 'whatsapp', sendAt: '10:30 AM', day: 'Today', message: 'Hi Deepa! Just wanted to follow up on the API webhooks question...', status: 'scheduled' },
  { id: 3, name: 'Rahul Nair', initials: 'RN', gradient: 'bg-gradient-to-br from-orange-500 to-orange-400', channel: 'whatsapp', sendAt: '11:45 AM', day: 'Today', message: 'Hi Rahul, here is the revised timeline with clear milestones...', status: 'scheduled' },
  { id: 4, name: 'Vikram Singh', initials: 'VS', gradient: 'bg-gradient-to-br from-purple-500 to-purple-400', channel: 'linkedin', sendAt: '2:00 PM', day: 'Today', message: 'Hi Vikram, following up on our demo call last Thursday...', status: 'pending' },
  { id: 5, name: 'Neha Gupta', initials: 'NG', gradient: 'bg-gradient-to-br from-pink-500 to-pink-400', channel: 'gmail', sendAt: '9:00 AM', day: 'Tomorrow', message: 'Hi Neha, wanted to check in on the Q2 proposal...', status: 'pending' },
  { id: 6, name: 'Karan Reddy', initials: 'KR', gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-400', channel: 'whatsapp', sendAt: '3:30 PM', day: 'Tomorrow', message: 'Hi Karan, just circling back on the minimum commitment question...', status: 'pending' },
  { id: 7, name: 'Simran Sethi', initials: 'SS', gradient: 'bg-gradient-to-br from-yellow-500 to-yellow-400', channel: 'telegram', sendAt: '4:30 PM', day: 'Tomorrow', message: 'Hi Simran! Here are the case studies I promised...', status: 'pending' },
];

export default function ScheduledView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-orange" />
        <span className="text-xs font-semibold uppercase tracking-wider text-orange">Scheduled Messages</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {scheduledStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Scheduled Messages List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-3 lg:p-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600 flex-shrink-0" />
            <h3 className="font-bold text-slate-900">Smart Queue</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">OPTIMIZED</span>
            <span className="text-xs text-slate-500 hidden sm:inline">Sending at optimal contact times</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {scheduledMessages.map((msg) => (
            <div key={msg.id} className="p-3 lg:p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3 lg:gap-4">
                <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl ${msg.gradient} flex items-center justify-center text-white text-xs lg:text-sm font-bold flex-shrink-0`}>
                  {msg.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-base lg:text-sm text-slate-900">{msg.name}</span>
                    <span className="w-6 h-6 p-1 bg-slate-900 rounded text-white flex items-center justify-center flex-shrink-0">
                      {getChannelIcon(msg.channel)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      msg.status === 'scheduled' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {msg.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm lg:text-sm text-slate-500 truncate">{msg.message}</p>
                  <div className="flex items-center justify-between mt-2 lg:hidden">
                    <div className="text-sm lg:text-xs font-semibold text-orange">{msg.sendAt} · {msg.day}</div>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-orange">{msg.sendAt}</div>
                    <div className="text-xs text-slate-500">{msg.day}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Smart Send */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6">
          <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-orange" />
          </div>
          <h4 className="font-bold text-slate-900 mb-2">Optimal Timing</h4>
          <p className="text-sm text-slate-600">Messages are scheduled to send when each contact is most likely to respond based on their historical engagement patterns.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h4 className="font-bold text-slate-900 mb-2">3x Better Open Rates</h4>
          <p className="text-sm text-slate-600">Smart Send messages have 3x higher open rates compared to manual sends, based on your contact's response patterns.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-purple-500" />
          </div>
          <h4 className="font-bold text-slate-900 mb-2">Auto-pilot Mode</h4>
          <p className="text-sm text-slate-600">Enable Autopilot to automatically send messages after a countdown, or review and approve before sending.</p>
        </div>
      </div>
    </div>
  );
}
