'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Target, Lightbulb, MessageSquare, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { negotiateStats } from '@/lib/data';
import StatCard from '@/components/StatCard';

export default function NegotiateView() {
  const [progress, setProgress] = useState(0);
  const [gaugeAnimating, setGaugeAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(67);
      setGaugeAnimating(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const dealChat = [
    { type: 'buyer', text: 'Your proposal came in at 6L for the annual plan. We were expecting something closer to 4.5L. Can you work on the pricing?' },
    { type: 'insight', text: "He's anchoring low. Don't counter immediately — acknowledge his budget first, then reframe around value delivered. Avoid discounting more than 15%." },
    { type: 'seller', text: 'I completely understand budget constraints, Rahul. Let me show you the ROI breakdown — our clients in your segment typically see 3x returns within the first quarter.' },
    { type: 'buyer', text: "That's fair. But we've had vendors promise ROI before. What's different with Torqe?" },
    { type: 'insight', text: "Great opening — he's engaged, not pushing back on price anymore. Share a specific case study now. Mention a client in his industry if possible." },
  ];

  const coachingTips = [
    { num: 1, title: 'Use the "Feel, Felt, Found" technique', desc: 'Acknowledge his concern, relate to other clients who felt the same, then share what they found after adopting. Builds trust without discounting.' },
    { num: 2, title: 'Offer quarterly billing as a concession', desc: 'Instead of reducing price, offer to break the annual fee into quarterly payments. Preserves deal value while reducing perceived risk.' },
    { num: 3, title: 'Create urgency with limited-time add-on', desc: 'Offer free onboarding (50K value) if they sign by Friday. Time-bounded incentive without touching the core price.' },
  ];

  const counterOffers = [
    { label: 'Recommended Counter', value: '5.4L / year', reason: '10% discount from original 6L. Position as "early adopter rate." Includes free onboarding. Best balance of margin and close probability.', color: 'orange' },
    { label: 'Conservative Option', value: '5.7L / year', reason: '5% discount. Add an extra quarter of premium support free. Protects margin. Works if buyer engagement stays high.', color: 'neutral' },
    { label: 'Aggressive Close', value: '4.8L / year', reason: '20% discount. Only use if the deal is slipping. Requires 2-year commitment. Locks in long-term revenue.', color: 'neutral' },
  ];

  const circumference = 2 * Math.PI * 65;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-orange" />
        <span className="text-xs font-semibold uppercase tracking-wider text-orange">Negotiate Coach - Live Deal Intelligence</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {negotiateStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Grid - 2 columns like original */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 lg:gap-6">
        {/* Left Column - Live Deal Chat and Strategy */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Live Deal Conversation */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-900">Live Deal - Rahul Nair</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange/10 text-orange">NEGOTIATING</span>
            </div>
            <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
              {dealChat.map((msg, i) => (
                <div key={i}>
                  {msg.type === 'insight' ? (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-purple-600 mb-1">AI Coach</p>
                        <p className="text-base lg:text-sm text-purple-700 leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-[85%] ${msg.type === 'seller' ? 'ml-auto' : ''}`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        msg.type === 'seller'
                          ? 'bg-orange/10 border border-orange/20 text-slate-800 rounded-tr-sm'
                          : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                      }`}>
                        <span className={`text-xs font-bold uppercase mb-1 block ${
                          msg.type === 'seller' ? 'text-orange' : 'text-slate-500'
                        }`}>
                          {msg.type === 'seller' ? 'You' : 'Buyer - Rahul'}
                        </span>
                        <p className="text-base lg:text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Strategy Tips */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-900">Real-time Strategy</h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {coachingTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-orange/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-orange/10 text-orange text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {tip.num}
                  </div>
                  <div>
                    <p className="font-semibold text-base lg:text-sm text-slate-900 mb-1">{tip.title}</p>
                    <p className="text-sm lg:text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Gauge and Counter-Offers */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Close Likelihood Gauge */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-900">Close Likelihood</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={gaugeAnimating ? strokeOffset : circumference}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900">{progress}%</span>
                  <span className="text-xs text-slate-500 font-medium">Close Rate</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-4 mb-4">
                Based on conversation signals, response patterns, and deal history
              </p>
              <div className="flex gap-3 w-full">
                <div className="flex-1 text-center p-3 rounded-xl bg-slate-900 border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Engagement</div>
                  <div className="text-sm font-bold text-green-400">High</div>
                </div>
                <div className="flex-1 text-center p-3 rounded-xl bg-slate-900 border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Objections</div>
                  <div className="text-sm font-bold text-orange">2 Open</div>
                </div>
                <div className="flex-1 text-center p-3 rounded-xl bg-slate-900 border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Timeline</div>
                  <div className="text-sm font-bold text-cyan-400">This week</div>
                </div>
              </div>
            </div>
          </div>

          {/* Counter-Offer Suggestions */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-900">Counter-Offer Suggestions</h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {counterOffers.map((offer, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl bg-slate-50 border transition-colors cursor-pointer ${
                    offer.color === 'orange'
                      ? 'border-orange/50 hover:border-orange'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{offer.label}</span>
                    <span className={`text-lg font-bold ${
                      offer.color === 'orange' ? 'text-orange' : 'text-slate-700'
                    }`}>
                      {offer.value}
                    </span>
                  </div>
                  <p className="text-sm lg:text-xs text-slate-600 leading-relaxed mb-3">{offer.reason}</p>
                  {offer.color === 'orange' && (
                    <button className="w-full py-2.5 rounded-xl bg-orange text-white text-sm font-semibold hover:bg-orange-500 transition-colors flex items-center justify-center gap-2">
                      Use This Counter
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
