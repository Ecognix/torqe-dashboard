'use client';

import { useState } from 'react';
import { Sparkles, Send, Edit, Brain, TrendingDown, Mic } from 'lucide-react';
import { aiStats } from '@/lib/data';
import StatCard from '@/components/StatCard';

export default function AIToolsView() {
  const [selectedTone, setSelectedTone] = useState('professional');

  const tones = [
    { id: 'professional', label: 'Professional' },
    { id: 'casual', label: 'Casual' },
    { id: 'assertive', label: 'Assertive' },
    { id: 'warm', label: 'Warm' },
  ];

  const toneResponses: Record<string, string> = {
    professional: 'Dear Rahul, thank you for your patience regarding the project timeline. I want to assure you that we\'re making strong progress — I\'ve outlined a revised delivery schedule with clear milestones attached. Could we schedule a call this week to walk through it together?',
    casual: "Hey Rahul! Sorry for the delay on that timeline — things got hectic on our end. Good news though, I've got the updated plan ready. Want to hop on a quick call this week to go over it?",
    assertive: "Rahul, I understand your concern on the timeline. Here's the revised delivery plan with non-negotiable milestones — I'm confident we can deliver. Let's lock in a call to align expectations and move forward decisively.",
    warm: "Hi Rahul! I really appreciate your patience — I know waiting can be frustrating, and I don't take that lightly. I've put together a thoughtful revised plan that I think you'll feel great about. When can we chat?",
  };

  const sentimentAlerts = [
    { name: 'Vikram S. (Enterprise)', from: 'Hot', to: 'Cold', reason: 'Response time went from 5min to 2 days', status: 'cold' },
    { name: 'Neha G. (Startup)', from: 'Positive', to: 'Neutral', reason: 'Stopped using emojis, shorter replies', status: 'cold' },
    { name: 'Amit R. (Freelancer)', from: 'Neutral', to: 'Warming', reason: "Asked about pricing + shared with team's budget", status: 'warming' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-orange" />
        <span className="text-xs font-semibold uppercase tracking-wider text-orange">AI Intelligence Layer</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {aiStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* AI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* AI Reply Draft */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">AI Reply Drafting</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">AI-POWERED</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                PM
              </div>
              <div>
                <p className="font-semibold text-base lg:text-sm text-slate-900">Priya Mehta</p>
                <p className="text-sm lg:text-xs text-slate-500">Asked about pricing for enterprise plan</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
              Hi Priya! Thanks for your interest in our Enterprise plan. I'd love to set up a quick call to walk you through the pricing structure — it's customized based on team size and usage. Would Thursday at 3 PM work for you?
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange text-white text-sm font-medium hover:bg-orange-500 transition-colors">
                Send Draft
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Vibe Check */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Vibe Check</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">LIVE</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                RN
              </div>
              <div>
                <p className="font-semibold text-base lg:text-sm text-slate-900">Rahul Nair - Pre-call Brief</p>
                <p className="text-sm lg:text-xs text-slate-500">Call scheduled in 15 minutes</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-lg flex-shrink-0">Mood</span>
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">Frustrated</strong> — mentioned "delays" and "still waiting" twice in last 3 messages.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-lg flex-shrink-0">Objections</span>
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">Concerned</strong> about delivery timeline. Compared you to a competitor who "ships faster."
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-lg flex-shrink-0">Best Angle</span>
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">Lead</strong> with urgency acknowledgment. Offer concrete timeline with milestones.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Sentiment Shift Alerts</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">3 ALERTS</span>
          </div>
          <div className="p-4 space-y-3">
            {sentimentAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  alert.status === 'cold' ? 'bg-blue-500' : 
                  alert.status === 'warming' ? 'bg-orange' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base lg:text-sm text-slate-900">{alert.name}</p>
                  <p className="text-sm lg:text-xs text-slate-500">
                    {alert.from} <span className="font-bold mx-1">-</span> {alert.to} - {alert.reason}
                  </p>
                </div>
                <button className="text-xs font-medium text-orange hover:text-orange-600">
                  {alert.status === 'warming' ? 'Engage' : 'Follow up'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tone Rewriter */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Tone Rewriter</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500 mb-3">Select tone for your message:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {tones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTone === tone.id
                      ? 'bg-orange text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
            <div className="bg-slate-900 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                {selectedTone}
              </p>
              {toneResponses[selectedTone]}
            </div>
          </div>
        </div>

        {/* Voice Transcription - Full Width */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900">Voice Note Transcription</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">AUTO-DETECT</span>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-900 rounded-lg">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900">Voice note from Deepa K.</p>
                <p className="text-xs text-slate-500 mb-3">1:24 duration - WhatsApp - 10 min ago</p>
                <div className="bg-slate-900 rounded-xl p-4 text-sm text-slate-300 leading-relaxed mb-3">
                  "Hey, I just got off the call with my CFO and... look, we're interested but the annual commitment is a concern. Can we maybe do quarterly? Also, my team lead wants to know if the API supports webhooks because we're building something custom. Let me know ASAP — we have a board meeting Friday."
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange/10 text-orange">Pricing concern</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">Technical question</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">Time pressure</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">High intent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
