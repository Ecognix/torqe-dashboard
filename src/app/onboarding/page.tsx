'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Building2, User, Users, MessageSquare, Target, Check, Sparkles, Zap, BarChart3 } from 'lucide-react';
import { getChannelIcon } from '@/lib/icons';

const STEPS = [
  { id: 'welcome', title: 'Welcome to Torqe', subtitle: 'Your AI-powered CRM — set up in under 2 minutes' },
  { id: 'profile', title: 'Tell us about you', subtitle: 'This will appear on your public profile' },
  { id: 'details', title: 'A bit more about you', subtitle: 'Help others find and connect with you' },
  { id: 'company', title: 'Your workspace', subtitle: 'Help us tailor Torqe for your team' },
  { id: 'channels', title: 'Connect your channels', subtitle: 'Where do your conversations happen?' },
  { id: 'goals', title: 'Your primary goal', subtitle: 'We\'ll optimise your workspace accordingly' },
];

const INDUSTRIES = [
  'SaaS / Technology', 'E-commerce', 'Real Estate', 'Financial Services',
  'Healthcare', 'Education', 'Marketing / Agency', 'Consulting',
  'Manufacturing', 'Retail', 'Other',
];

const TEAM_SIZES = [
  { label: 'Solo', value: '1' },
  { label: '2–5', value: '2-5' },
  { label: '6–20', value: '6-20' },
  { label: '21–50', value: '21-50' },
  { label: '50+', value: '50+' },
];

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', desc: 'Business messaging' },
  { id: 'gmail', label: 'Gmail', desc: 'Email conversations' },
  { id: 'linkedin', label: 'LinkedIn', desc: 'Professional outreach' },
  { id: 'slack', label: 'Slack', desc: 'Team collaboration' },
  { id: 'instagram', label: 'Instagram', desc: 'Social engagement' },
  { id: 'telegram', label: 'Telegram', desc: 'Instant messaging' },
];

const USE_CASES = [
  { id: 'sales', label: 'Close more deals', desc: 'AI-powered pipeline, smart follow-ups, negotiation coaching', icon: Target },
  { id: 'support', label: 'Customer support', desc: 'Unified inbox, auto-replies, sentiment analysis', icon: MessageSquare },
  { id: 'both', label: 'Sales + Support', desc: 'Complete CRM with AI across all your workflows', icon: Zap },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    industry: '',
    team_size: '',
    primary_channels: [] as string[],
    use_case: '',
  });
  const router = useRouter();
  const supabase = createClient();

  // Auto-fill email from auth user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  const toggleChannel = (id: string) => {
    setFormData(prev => ({
      ...prev,
      primary_channels: prev.primary_channels.includes(id)
        ? prev.primary_channels.filter(c => c !== id)
        : [...prev.primary_channels, id],
    }));
  };

  const handleFinish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Core fields that always exist
    const coreUpdate: Record<string, any> = {
      full_name: formData.full_name || null,
      job_title: formData.job_title || null,
      phone: formData.phone || null,
      company: formData.company || null,
      industry: formData.industry || null,
      team_size: formData.team_size || null,
      primary_channels: formData.primary_channels,
      use_case: formData.use_case || null,
      onboarding_completed: true,
    };

    // Extended fields (bio, location, website) - may not exist yet
    const fullUpdate: Record<string, any> = {
      ...coreUpdate,
      bio: formData.bio || null,
      location: formData.location || null,
      website: formData.website || null,
    };

    // Try full update first, fallback to core if columns don't exist
    let { error } = await supabase
      .from('profiles')
      .update(fullUpdate)
      .eq('id', user.id);

    if (error) {
      console.warn('Full update failed, trying core fields:', error.message);
      const result = await supabase
        .from('profiles')
        .update(coreUpdate)
        .eq('id', user.id);
      error = result.error;
    }

    if (error) {
      console.error('Profile update error:', error);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return formData.full_name.trim().length > 0;
      case 2: return true; // details step - all optional
      case 3: return formData.company.trim().length > 0;
      case 4: return formData.primary_channels.length > 0;
      case 5: return formData.use_case.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Torqe" className="w-8 h-8" />
          <span className="text-lg font-bold text-white">Torqe</span>
        </div>
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < step ? 'bg-orange-500 text-white' : i === step ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' : 'bg-slate-800 text-slate-500'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${i < step ? 'bg-orange-500' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-xl">
          {/* Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-6 lg:p-10">
            {/* Step label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400">
                Step {step + 1} of {STEPS.length}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1.5">{STEPS[step].title}</h1>
            <p className="text-sm text-slate-400 mb-8">{STEPS[step].subtitle}</p>

            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <img src="/logo.png" alt="Torqe" className="w-14 h-14" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: MessageSquare, title: 'Unified Inbox', desc: 'WhatsApp, Gmail, LinkedIn, Slack — all in one view' },
                    { icon: Sparkles, title: 'AI-Powered Workflows', desc: 'Smart drafts, auto follow-ups, negotiation coaching' },
                    { icon: BarChart3, title: 'Deal Pipeline', desc: 'Track, manage, and close deals with real-time AI insights' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Profile */}
            {step === 1 && (
              <div className="space-y-5">
                {userEmail && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Email</label>
                    <div className="w-full px-4 py-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 text-sm text-slate-300 cursor-not-allowed">
                      {userEmail}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Full Name <span className="text-orange-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                      style={{ color: '#fff' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="e.g. Sales Manager, Founder, VP Sales"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                    style={{ color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                    style={{ color: '#fff' }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Profile Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Sales professional with 8+ years of experience in B2B SaaS..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all resize-none"
                    style={{ color: '#fff' }}
                  />
                  <p className="text-[10px] text-slate-600 mt-1 text-right">{formData.bio.length}/200</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Mumbai, India"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                    style={{ color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                    style={{ color: '#fff' }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Company */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Company Name <span className="text-orange-400">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your company name"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Industry</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind}
                        onClick={() => setFormData(prev => ({ ...prev, industry: ind }))}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left ${
                          formData.industry === ind
                            ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                            : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Team Size</label>
                  <div className="flex gap-2">
                    {TEAM_SIZES.map(ts => (
                      <button
                        key={ts.value}
                        onClick={() => setFormData(prev => ({ ...prev, team_size: ts.value }))}
                        className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          formData.team_size === ts.value
                            ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                            : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {ts.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Channels — with real SVG icons */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {CHANNELS.map(ch => {
                    const selected = formData.primary_channels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id)}
                        className={`relative flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all ${
                          selected
                            ? 'border-orange-500 bg-orange-500/5'
                            : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${
                          selected ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <span className="w-6 h-6">{getChannelIcon(ch.id)}</span>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-slate-300'}`}>{ch.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{ch.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {formData.primary_channels.length > 0 && (
                  <p className="text-center text-xs text-slate-500">
                    {formData.primary_channels.length} channel{formData.primary_channels.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            {/* Step 5: Goals */}
            {step === 5 && (
              <div className="space-y-3">
                {USE_CASES.map(uc => {
                  const selected = formData.use_case === uc.id;
                  return (
                    <button
                      key={uc.id}
                      onClick={() => setFormData(prev => ({ ...prev, use_case: uc.id }))}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                        selected
                          ? 'border-orange-500 bg-orange-500/5'
                          : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-orange-500/10' : 'bg-slate-800'
                      }`}>
                        <uc.icon className="w-6 h-6" style={selected ? { color: '#f97316' } : { color: '#64748b' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-slate-300'}`}>{uc.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{uc.desc}</p>
                      </div>
                      {selected && (
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
              {step > 0 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={!canProceed() || loading}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Launch Dashboard
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Skip */}
          {step > 0 && step < STEPS.length - 1 && (
            <button
              onClick={() => setStep(s => s + 1)}
              className="block mx-auto mt-5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Skip this step
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-4">
        <p className="text-[11px] text-slate-600">Powered by TorqeAI</p>
      </div>
    </div>
  );
}
