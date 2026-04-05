'use client';

import { useState } from 'react';
import {
  Settings, User, Bell, Palette, Plug, Shield, CreditCard,
  HelpCircle, ChevronRight, ChevronDown, Mail, Phone, Globe,
  Moon, Sun, Eye, EyeOff, Check, Save, Upload, Lock,
  Smartphone, Monitor, Laptop, LogOut, AlertTriangle, Zap,
  Download, Plus, ExternalLink, RefreshCw, CheckCircle2,
  X, Volume2, VolumeX
} from 'lucide-react';

// ── Reusable Toggle ─────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-7 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 ${
        enabled ? 'bg-orange-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

// ── Reusable Section Header ──────────────────────────────────────────
function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="pb-5 border-b border-slate-100">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
    </div>
  );
}

// ── Reusable Input ───────────────────────────────────────────────────
function Field({ label, value, type = 'text', prefix }: { label: string; value: string; type?: string; prefix?: string }) {
  const [val, setVal] = useState(value);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>
        )}
        <input
          type={type}
          value={val}
          onChange={e => setVal(e.target.value)}
          className={`w-full ${prefix ? 'pl-8' : 'pl-4'} pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 placeholder:text-slate-400 transition-all`}
        />
      </div>
    </div>
  );
}

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [accentColor, setAccentColor] = useState('#f97316');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [bioLen, setBioLen] = useState(84);

  // Notification toggles
  const [notifs, setNotifs] = useState({
    newMessages: true,
    dealUpdates: true,
    reminders: true,
    aiSuggestions: false,
    weeklyDigest: true,
    productUpdates: false,
    emailNotifs: true,
    desktopNotifs: true,
    soundEnabled: true,
  });

  // Appearance toggles
  const [appearance, setAppearance] = useState({
    compactMode: false,
    showBadges: true,
    animationsEnabled: true,
  });

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAppearance = (key: keyof typeof appearance) =>
    setAppearance(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Personal information' },
    { id: 'account', label: 'Account & Security', icon: Shield, description: 'Password & sessions' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts & sounds' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme & display' },
    { id: 'integrations', label: 'Integrations', icon: Plug, description: 'Connected apps' },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard, description: 'Subscription & usage' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, description: 'FAQs & contact' },
  ];

  const accentColors = [
    { hex: '#f97316', label: 'Orange' },
    { hex: '#3b82f6', label: 'Blue' },
    { hex: '#22c55e', label: 'Green' },
    { hex: '#a855f7', label: 'Purple' },
    { hex: '#ec4899', label: 'Pink' },
    { hex: '#0f172a', label: 'Slate' },
  ];

  const integrations = [
    { name: 'WhatsApp', desc: 'Sync messaging', connected: true, color: '#25D366', letter: 'W', plan: 'All plans' },
    { name: 'Gmail', desc: 'Email integration', connected: true, color: '#EA4335', letter: 'G', plan: 'All plans' },
    { name: 'LinkedIn', desc: 'Professional network', connected: true, color: '#0A66C2', letter: 'Li', plan: 'Pro' },
    { name: 'Slack', desc: 'Team notifications', connected: false, color: '#4A154B', letter: 'S', plan: 'Pro' },
    { name: 'Google Calendar', desc: 'Schedule sync', connected: true, color: '#4285F4', letter: 'C', plan: 'All plans' },
    { name: 'Zapier', desc: 'Workflow automation', connected: false, color: '#FF4A00', letter: 'Z', plan: 'Pro' },
    { name: 'Salesforce', desc: 'CRM integration', connected: false, color: '#00A1E0', letter: 'SF', plan: 'Enterprise' },
    { name: 'HubSpot', desc: 'Marketing & CRM', connected: false, color: '#FF7A59', letter: 'H', plan: 'Enterprise' },
  ];

  const faqs = [
    { q: 'How do I integrate WhatsApp?', a: 'Go to Integrations, click Connect next to WhatsApp, and follow the QR code setup. Your conversations will sync within minutes.' },
    { q: 'How does Smart Send work?', a: 'Smart Send uses AI to find the optimal time to send your message based on recipient engagement patterns and timezone.' },
    { q: 'Can I export my data?', a: 'Yes! Head to Account → Data Export and choose a date range. You\'ll receive a downloadable ZIP with all your messages and contacts.' },
    { q: 'How do I upgrade my plan?', a: 'Visit the Billing section, click Upgrade Plan, and choose between Pro or Enterprise. Upgrades take effect immediately.' },
    { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II certified.' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm flex-shrink-0">
          <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-xs lg:text-sm text-slate-500">Manage your account, preferences and integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-6">

        {/* ── Sidebar Nav ──────────────────────────────────────── */}
        <div className="space-y-1">
          {/* Mini profile card at top - hidden on mobile */}
          <div className="hidden lg:flex bg-white rounded-2xl border border-slate-200 p-4 mb-2 items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              AK
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Arjun Kapoor</p>
              <p className="text-xs text-orange-500 font-medium">Pro Plan</p>
            </div>
          </div>

          {/* Horizontal scroll on mobile, vertical list on desktop */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 flex lg:block gap-1 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-3 rounded-xl text-left transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 lg:w-4.5 lg:h-4.5 flex-shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} size={18} />
                  <div>
                    <p className={`text-xs lg:text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-800'}`}>{section.label}</p>
                    <p className={`text-xs hidden lg:block ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Danger Zone shortcut */}
          <div className="bg-red-50 rounded-2xl border border-red-100 p-3 mt-2">
            <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
            </p>
            <button className="w-full text-left text-xs text-red-600 hover:text-red-700 font-medium py-1">
              Export all data
            </button>
            <button className="w-full text-left text-xs text-red-600 hover:text-red-700 font-medium py-1">
              Delete account permanently
            </button>
          </div>
        </div>

        {/* ── Content Panel ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[500px]">

          {/* ─── Profile ──────────────────────────────────────── */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <SectionHeader title="Profile Information" desc="Update your personal details and public profile" />

              {/* Avatar */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    AK
                  </div>
                  <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Profile Photo</p>
                  <p className="text-xs text-slate-500 mt-0.5">JPG, PNG or GIF · Max 2 MB</p>
                  <div className="flex gap-3 mt-2">
                    <button className="text-xs font-medium text-orange-500 hover:text-orange-600">Upload new</button>
                    <button className="text-xs font-medium text-slate-400 hover:text-slate-600">Remove</button>
                  </div>
                </div>
              </div>

              {/* Form grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" value="Arjun Kapoor" />
                <Field label="Username" value="arjunkapoor" prefix="@" />
                <Field label="Email" value="arjun@torqe.ai" type="email" />
                <Field label="Phone" value="+91 98765 43210" type="tel" />
                <Field label="Company" value="TechVentures Inc." />
                <Field label="Role" value="Head of Sales" />
                <Field label="Website" value="https://arjunkapoor.com" type="url" />
                <Field label="Location" value="Mumbai, India" />
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Bio <span className="text-slate-400 normal-case font-normal">({bioLen}/160)</span>
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Sales professional with 8+ years of experience in B2B SaaS. Passionate about AI and automation."
                    maxLength={160}
                    onChange={e => setBioLen(e.target.value.length)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">Delete Account</button>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    saved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-700'
                  }`}
                >
                  {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {/* ─── Account & Security ───────────────────────────── */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <SectionHeader title="Account & Security" desc="Manage your password, 2FA and active sessions" />

              {/* Email */}
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Email Address</p>
                    <p className="text-xs text-slate-500">arjun@torqe.ai · Verified</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Change</button>
              </div>

              {/* Password */}
              <div className="p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Change Password</p>
                    <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Current Password</label>
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full px-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                    />
                    <button
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full px-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                    />
                    <button
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {/* Password strength bar */}
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((seg) => (
                        <div key={seg} className={`h-1 flex-1 rounded-full ${seg <= 2 ? 'bg-orange-400' : 'bg-slate-200'}`} />
                      ))}
                      <span className="text-xs text-orange-500 ml-1 font-medium">Fair</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
                  >
                    {saved ? 'Password Updated ✓' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* 2FA */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Enabled via Authenticator App</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">Manage</button>
              </div>

              {/* Active Sessions */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3">Active Sessions</h3>
                <div className="space-y-2">
                  {[
                    { device: 'Chrome on Windows', location: 'Mumbai, India', time: 'Current session', icon: Monitor, current: true },
                    { device: 'Safari on iPhone 15', location: 'Mumbai, India', time: '2 hours ago', icon: Smartphone, current: false },
                    { device: 'Firefox on MacOS', location: 'Pune, India', time: '3 days ago', icon: Laptop, current: false },
                  ].map((session, i) => {
                    const Icon = session.icon;
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Icon className="w-4.5 h-4.5 text-slate-500" size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{session.device}</p>
                            <p className="text-xs text-slate-500">{session.location} · {session.time}</p>
                          </div>
                        </div>
                        {session.current
                          ? <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Active</span>
                          : <button className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">Revoke</button>
                        }
                      </div>
                    );
                  })}
                </div>
                <button className="mt-3 text-xs font-medium text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" /> Sign out of all other sessions
                </button>
              </div>
            </div>
          )}

          {/* ─── Notifications ────────────────────────────────── */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <SectionHeader title="Notification Preferences" desc="Choose exactly how and when you want to be notified" />

              {/* Channel toggles */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Delivery Channels</p>
                <div className="space-y-2">
                  {[
                    { key: 'emailNotifs' as const, icon: Mail, label: 'Email Notifications', desc: 'Receive summaries and alerts by email' },
                    { key: 'desktopNotifs' as const, icon: Monitor, label: 'Desktop Notifications', desc: 'Browser push notifications' },
                    { key: 'soundEnabled' as const, icon: notifs.soundEnabled ? Volume2 : VolumeX, label: 'Sound Alerts', desc: 'Play a sound for new messages' },
                  ].map(({ key, icon: Icon, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Icon className="w-4.5 h-4.5 text-slate-500" size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500">{desc}</p>
                        </div>
                      </div>
                      <Toggle enabled={notifs[key]} onToggle={() => toggleNotif(key)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Event toggles */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Notification Types</p>
                <div className="space-y-2">
                  {[
                    { key: 'newMessages' as const, label: 'New Messages', desc: 'Incoming WhatsApp, Gmail, LinkedIn messages', badge: '' },
                    { key: 'dealUpdates' as const, label: 'Deal Updates', desc: 'Pipeline changes and negotiation milestones', badge: '' },
                    { key: 'reminders' as const, label: 'Scheduled Reminders', desc: 'Follow-up and outreach reminders', badge: '' },
                    { key: 'aiSuggestions' as const, label: 'AI Suggestions', desc: 'Smart draft tips and response nudges', badge: 'AI' },
                    { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Summary of your activity every Monday', badge: '' },
                    { key: 'productUpdates' as const, label: 'Product Updates', desc: 'New features and release notes from Torqe', badge: '' },
                  ].map(({ key, label, desc, badge }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          {badge && <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">{badge}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                      <Toggle enabled={notifs[key]} onToggle={() => toggleNotif(key)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sound settings */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">Message Sound</p>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400">
                  <option>Chirp</option>
                  <option>Ding</option>
                  <option>Pop</option>
                  <option>None</option>
                </select>
              </div>
            </div>
          )}

          {/* ─── Appearance ───────────────────────────────────── */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <SectionHeader title="Appearance" desc="Customize how Torqe looks and feels for you" />

              {/* Theme */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light' as const, label: 'Light', icon: Sun, preview: ['bg-white', 'bg-slate-100', 'bg-slate-200'] },
                    { id: 'dark' as const, label: 'Dark', icon: Moon, preview: ['bg-slate-900', 'bg-slate-800', 'bg-slate-700'] },
                    { id: 'system' as const, label: 'System', icon: Monitor, preview: ['bg-slate-900', 'bg-white', 'bg-slate-400'] },
                  ].map(({ id, label, icon: Icon, preview }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTheme(id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        activeTheme === id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Mini preview */}
                      <div className="w-full h-12 rounded-lg overflow-hidden mb-3 flex flex-col gap-1 p-1.5" style={{ background: id === 'dark' ? '#0f172a' : '#f8fafc' }}>
                        <div className={`h-2.5 w-3/4 rounded-sm ${preview[0]}`} />
                        <div className={`h-2 w-1/2 rounded-sm ${preview[1]}`} />
                        <div className={`h-2 w-2/3 rounded-sm ${preview[2]}`} />
                      </div>
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${activeTheme === id ? 'text-orange-500' : 'text-slate-400'}`} />
                      <p className={`text-xs font-semibold text-center ${activeTheme === id ? 'text-orange-600' : 'text-slate-600'}`}>{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Accent Color</p>
                <div className="flex gap-3 flex-wrap">
                  {accentColors.map(({ hex, label }) => (
                    <button
                      key={hex}
                      onClick={() => setAccentColor(hex)}
                      title={label}
                      className={`w-10 h-10 rounded-full transition-all hover:scale-110 ${
                        accentColor === hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Selected: <span className="font-semibold" style={{ color: accentColor }}>{accentColors.find(c => c.hex === accentColor)?.label}</span></p>
              </div>

              {/* Toggles */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Display Options</p>
                <div className="space-y-2">
                  {[
                    { key: 'compactMode' as const, label: 'Compact Mode', desc: 'Reduce spacing for denser information display' },
                    { key: 'showBadges' as const, label: 'Show Channel Badges', desc: 'Display unread count badges on sidebar' },
                    { key: 'animationsEnabled' as const, label: 'Enable Animations', desc: 'Smooth transitions and micro-interactions' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                      <Toggle enabled={appearance[key]} onToggle={() => toggleAppearance(key)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Integrations ─────────────────────────────────── */}
          {activeSection === 'integrations' && (
            <div className="space-y-5">
              <SectionHeader title="Integrations" desc="Connect your apps to supercharge your Torqe workflow" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integrations.map((app, i) => (
                  <div key={i} className={`p-4 rounded-xl border transition-all hover:shadow-sm ${app.connected ? 'border-slate-200' : 'border-dashed border-slate-300 bg-slate-50/50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                          style={{ backgroundColor: app.color }}
                        >
                          {app.letter}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{app.name}</p>
                          <p className="text-xs text-slate-500">{app.desc}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        app.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                        app.plan === 'Pro' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>{app.plan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.connected && (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs flex-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="font-medium">Connected</span>
                        </div>
                      )}
                      <button className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        app.connected
                          ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                          : 'bg-slate-900 text-white hover:bg-slate-700'
                      }`}>
                        {app.connected ? <><X className="w-3 h-3" /> Disconnect</> : <><Plus className="w-3 h-3" /> Connect</>}
                      </button>
                      {app.connected && (
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Zap className="w-4 h-4 text-orange-500" />
                Need a custom integration? <a href="#" className="text-orange-500 font-medium hover:underline">Contact our API team →</a>
              </div>
            </div>
          )}

          {/* ─── Billing ──────────────────────────────────────── */}
          {activeSection === 'billing' && (
            <div className="space-y-6">
              <SectionHeader title="Billing & Plans" desc="Manage your subscription, usage and payment details" />

              {/* Current plan card */}
              <div className="relative overflow-hidden p-6 rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)' }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #f97316, transparent 70%)', transform: 'translate(30%, -30%)' }}
                />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Current Plan</p>
                    <p className="text-3xl font-bold mt-1">Pro Plan</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-sm text-slate-400">₹2,499 / month</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">Renews Apr 15, 2026</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-400 transition-colors shadow-lg">
                    Upgrade Plan
                  </button>
                </div>

                {/* Usage bars */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Messages', used: 2847, total: 5000 },
                    { label: 'AI Credits', used: 156, total: 500 },
                    { label: 'Team Members', used: 3, total: 5 },
                  ].map((u, i) => {
                    const pct = Math.round((u.used / u.total) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">{u.label}</span>
                          <span className="text-xs font-semibold text-white">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct > 80 ? 'bg-red-400' : 'bg-orange-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{u.used.toLocaleString()} / {u.total.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Visa ending in 4242</p>
                    <p className="text-xs text-slate-500">Expires 12/2027 · Default payment</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">Update</button>
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Card
                  </button>
                </div>
              </div>

              {/* Invoices */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Recent Invoices</h3>
                  <button className="text-xs font-medium text-orange-500 hover:text-orange-600 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Download All
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { date: 'Mar 15, 2026', amount: '₹2,499', status: 'Paid', id: 'INV-0041' },
                    { date: 'Feb 15, 2026', amount: '₹2,499', status: 'Paid', id: 'INV-0040' },
                    { date: 'Jan 15, 2026', amount: '₹2,499', status: 'Paid', id: 'INV-0039' },
                  ].map((inv, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">{inv.id}</div>
                        <p className="text-sm text-slate-700">{inv.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-slate-900">{inv.amount}</p>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">{inv.status}</span>
                        <button className="text-slate-400 hover:text-slate-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Help & Support ───────────────────────────────── */}
          {activeSection === 'help' && (
            <div className="space-y-6">
              <SectionHeader title="Help & Support" desc="Find answers or reach out to our team" />

              {/* Quick links */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Documentation', icon: ExternalLink, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Video Tutorials', icon: Zap, color: 'bg-purple-50 text-purple-600' },
                  { label: 'API Reference', icon: Globe, color: 'bg-slate-100 text-slate-600' },
                ].map(({ label, icon: Icon, color }) => (
                  <button key={label} className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all ${color}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold text-slate-700">{label}</span>
                  </button>
                ))}
              </div>

              {/* Accordion FAQ */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Frequently Asked Questions</p>
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${faqOpen === i ? 'rotate-180' : ''}`} />
                      </button>
                      {faqOpen === i && (
                        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact form */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Send a Message</h3>
                <div className="space-y-3">
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400">
                    <option>General Question</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Billing Issue</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Subject"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                  />
                  <textarea
                    rows={4}
                    placeholder="Describe your issue in detail…"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 resize-none"
                  />
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
                  >
                    {saved ? 'Message Sent ✓' : 'Send Message'}
                  </button>
                </div>
              </div>

              <div className="text-center py-2">
                <p className="text-xs text-slate-500">Urgent? Email us directly at{' '}
                  <a href="mailto:support@torqe.ai" className="font-semibold text-orange-500 hover:underline">support@torqe.ai</a>
                  {' '}· Avg. response time: 2 hours
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
