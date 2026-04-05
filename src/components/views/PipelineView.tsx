'use client';

import { Clock, Eye, Send, TrendingUp, Ghost, ShieldAlert } from 'lucide-react';
import { pipelineStats } from '@/lib/data';
import { getChannelIcon } from '@/lib/icons';
import StatCard from '@/components/StatCard';

const ghostFollowups = [
  { name: 'Vikram Singh', initials: 'VS', gradient: 'bg-gradient-to-br from-purple-500 to-purple-400', lastMsg: "Let me check with my team", channel: 'linkedin', silence: '72h' },
  { name: 'Neha Gupta', initials: 'NG', gradient: 'bg-gradient-to-br from-pink-500 to-pink-400', lastMsg: "Will get back to you on the proposal", channel: 'gmail', silence: '56h' },
  { name: 'Karan Reddy', initials: 'KR', gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-400', lastMsg: "Interesting, let me think about it", channel: 'whatsapp', silence: '48h' },
  { name: 'Simran Sethi', initials: 'SS', gradient: 'bg-gradient-to-br from-yellow-500 to-yellow-400', lastMsg: "Can you send me the case studies?", channel: 'telegram', silence: '50h' },
  { name: 'Anil Patel', initials: 'AP', gradient: 'bg-gradient-to-br from-green-500 to-green-400', lastMsg: "Read receipt only, no reply", channel: 'instagram', silence: '96h' },
];

const smartQueue = [
  { time: '9:15 AM', name: 'Priya Mehta', detail: 'Gmail - Enterprise pricing follow-up', channel: 'gmail' },
  { time: '10:30 AM', name: 'Deepa Krishnan', detail: 'WhatsApp - API webhook details', channel: 'whatsapp' },
  { time: '11:45 AM', name: 'Rahul Nair', detail: 'WhatsApp - Revised timeline proposal', channel: 'whatsapp' },
  { time: '2:00 PM', name: 'Amit Rao', detail: 'LinkedIn - Connection follow-up', channel: 'linkedin' },
  { time: '4:30 PM', name: 'Simran Sethi', detail: 'Telegram - Case studies attachment', channel: 'telegram' },
];

const scamAlerts = [
  { 
    title: 'Suspicious Payment Request', 
    desc: 'Message from "Rajesh CFO" on WhatsApp requesting an urgent wire transfer. Profile photo appears AI-generated. Account created 2 days ago.'
  },
  { 
    title: 'Potential Deepfake Voice Note', 
    desc: 'Audio message from "Vikram (Boss)" on Telegram does not match voice signature on file. 87% deepfake confidence score.'
  },
];

export default function PipelineView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-orange" />
        <span className="text-xs font-semibold uppercase tracking-wider text-orange">Pipeline Management</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {pipelineStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ghost Follow-ups - Full Width */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ghost className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Ghost Follow-up Drafts</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange/10 text-orange">48HR+ SILENCE</span>
          </div>
          <div className="p-3 lg:p-4">
            {ghostFollowups.map((followup, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${followup.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {followup.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900">{followup.name}</p>
                    <p className="text-xs text-slate-500 truncate">Last: "{followup.lastMsg}"</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-red-500 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {followup.silence}
                  </div>
                </div>
                <div className="flex gap-2 ml-12 sm:ml-0">
                  <button className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
                    <Eye className="w-3.5 h-3.5 inline mr-1" />
                    Preview
                  </button>
                  <button className="px-3 py-1.5 rounded-full bg-orange text-white text-xs font-medium hover:bg-orange-500 transition-colors">
                    <Send className="w-3.5 h-3.5 inline mr-1" />
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Smart Queue</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">OPTIMIZED</span>
          </div>
          <div className="p-4 space-y-3">
            {smartQueue.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm font-bold text-orange min-w-[60px]">{item.time}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
                <span className="w-7 h-7 p-1.5 bg-slate-900 rounded text-white flex items-center justify-center flex-shrink-0">
                  {getChannelIcon(item.channel)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scam Detection */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Scam and Deepfake Detection</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">2 FLAGGED</span>
          </div>
          <div className="p-4 space-y-3">
            {scamAlerts.map((alert, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-50/50 border border-red-100">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900 mb-1">{alert.title}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.desc}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1.5 rounded-full text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
                        Block and Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
