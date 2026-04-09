'use client';

import { useState, useEffect } from 'react';
import {
  Mail, Phone, MapPin, Calendar, Edit2, Check, Plus, Activity,
  MessageSquare, DollarSign, Users, Clock, Download,
  Share2, Globe, ExternalLink, TrendingUp, ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { getChannelIcon } from '@/lib/icons';
import type { UserProfile } from '@/lib/hooks/useProfile';

// ── Inline BW channel icon chips ─────────────────────────────────────
function ChannelChip({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium">
      <span className="w-3.5 h-3.5 flex items-center">{getChannelIcon(id)}</span>
      <span>{label}</span>
    </div>
  );
}

interface ProfileViewProps {
  profile?: UserProfile | null;
  onUpdateProfile?: (updates: Record<string, any>) => Promise<{ error: any }>;
}

export default function ProfileView({ profile, onUpdateProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'team' | 'profiles'>('overview');
  const [editValues, setEditValues] = useState({
    name: '',
    role: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setEditValues({
        name: profile.full_name || '',
        role: profile.job_title || profile.role || '',
        company: profile.company || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const getInitials = () => {
    if (!editValues.name) return '?';
    return editValues.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    if (onUpdateProfile) {
      await onUpdateProfile({
        full_name: editValues.name || null,
        job_title: editValues.role || null,
        company: editValues.company || null,
        phone: editValues.phone || null,
        location: editValues.location || null,
        website: editValues.website || null,
        bio: editValues.bio || null,
      });
    }
    setIsEditing(false);
  };

  const stats = [
    { label: 'Messages Sent', value: '2,847', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50', change: '+12%', spark: [30, 45, 35, 60, 48, 70, 62] },
    { label: 'Deals Closed', value: '24', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', change: '+3', spark: [4, 5, 3, 6, 5, 7, 6] },
    { label: 'Response Rate', value: '94%', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', change: '+5%', spark: [80, 85, 82, 88, 90, 92, 94] },
    { label: 'Team Members', value: '12', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50', change: 'Active', spark: [8, 9, 9, 10, 11, 11, 12] },
  ];

  const recentActivity = [
    { time: '2 min ago', action: 'Sent follow-up to Rahul Nair', type: 'message', color: 'bg-orange-500' },
    { time: '15 min ago', action: 'Closed deal with Priya Mehta — ₹4.2L', type: 'deal', color: 'bg-emerald-500' },
    { time: '1 hour ago', action: 'Used AI Draft for LinkedIn reply', type: 'ai', color: 'bg-purple-500' },
    { time: '2 hours ago', action: 'Scheduled follow-up for Deepa K.', type: 'schedule', color: 'bg-blue-500' },
    { time: '3 hours ago', action: 'Reviewed Negotiation Coach insights', type: 'coach', color: 'bg-amber-500' },
    { time: 'Yesterday', action: 'Onboarded Vikram Singh to pipeline', type: 'pipeline', color: 'bg-slate-500' },
  ];

  // Weekly chart data (messages + deals)
  const weeklyData = [
    { day: 'Mon', messages: 45, deals: 2 },
    { day: 'Tue', messages: 62, deals: 1 },
    { day: 'Wed', messages: 38, deals: 3 },
    { day: 'Thu', messages: 71, deals: 2 },
    { day: 'Fri', messages: 55, deals: 4 },
    { day: 'Sat', messages: 22, deals: 1 },
    { day: 'Sun', messages: 8, deals: 0 },
  ];

  const maxMessages = Math.max(...weeklyData.map(d => d.messages));
  const CHART_H = 140; // px for SVG viewBox height

  // Build SVG polyline points for line chart
  const linePoints = weeklyData.map((d, i) => {
    const x = (i / (weeklyData.length - 1)) * 100;
    const y = CHART_H - (d.messages / maxMessages) * CHART_H;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = [
    `0,${CHART_H}`,
    ...weeklyData.map((d, i) => {
      const x = (i / (weeklyData.length - 1)) * 100;
      const y = CHART_H - (d.messages / maxMessages) * CHART_H;
      return `${x},${y}`;
    }),
    `100,${CHART_H}`,
  ].join(' ');

  const team = [
    { name: 'Arjun Kapoor', role: 'Head of Sales', initials: 'AK', status: 'owner', online: true, messages: 847, gradient: 'from-orange-400 to-orange-600' },
    { name: 'Sneha Patel', role: 'Sales Manager', initials: 'SP', status: 'admin', online: true, messages: 624, gradient: 'from-purple-400 to-purple-600' },
    { name: 'Rohan Mehta', role: 'Account Executive', initials: 'RM', status: 'member', online: false, messages: 412, gradient: 'from-blue-400 to-blue-600' },
    { name: 'Kavya Shah', role: 'Sales Rep', initials: 'KS', status: 'member', online: true, messages: 389, gradient: 'from-emerald-400 to-emerald-600' },
  ];

  // Social profiles tab data
  const socialProfiles = [
    {
      channel: 'whatsapp',
      label: 'WhatsApp',
      handle: '+91 98765 43210',
      desc: 'Business account · 847 conversations',
      url: 'https://wa.me/919876543210',
      connected: true,
      stats: [{ label: 'Messages', val: '1,204' }, { label: 'Response Rate', val: '97%' }, { label: 'Avg. Reply', val: '4 min' }],
    },
    {
      channel: 'gmail',
      label: 'Gmail',
      handle: 'arjun@torqe.ai',
      desc: 'Primary business email · Google Workspace',
      url: 'https://mail.google.com',
      connected: true,
      stats: [{ label: 'Emails', val: '892' }, { label: 'Open Rate', val: '68%' }, { label: 'Replied', val: '74%' }],
    },
    {
      channel: 'linkedin',
      label: 'LinkedIn',
      handle: 'linkedin.com/in/arjunkapoor',
      desc: '1st · 2,400 connections · Head of Sales',
      url: 'https://linkedin.com/in/arjunkapoor',
      connected: true,
      stats: [{ label: 'Connections', val: '2.4K' }, { label: 'InMails', val: '38' }, { label: 'Profile Views', val: '312' }],
    },
    {
      channel: 'slack',
      label: 'Slack',
      handle: '@arjunkapoor',
      desc: 'TechVentures workspace · Not connected',
      url: 'https://slack.com',
      connected: false,
      stats: [{ label: 'Messages', val: '—' }, { label: 'Channels', val: '—' }, { label: 'Status', val: 'Offline' }],
    },
    {
      channel: 'instagram',
      label: 'Instagram',
      handle: '@arjun.kapoor',
      desc: 'Business profile · Not connected',
      url: 'https://instagram.com/arjun.kapoor',
      connected: false,
      stats: [{ label: 'Followers', val: '—' }, { label: 'Posts', val: '—' }, { label: 'Reach', val: '—' }],
    },
    {
      channel: 'telegram',
      label: 'Telegram',
      handle: '@arjunkapoor_torqe',
      desc: '63 contacts synced · Active',
      url: 'https://t.me/arjunkapoor_torqe',
      connected: true,
      stats: [{ label: 'Contacts', val: '63' }, { label: 'Messages', val: '748' }, { label: 'Groups', val: '5' }],
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'team', label: 'Team' },
    { id: 'profiles', label: 'Profiles' },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero Card (no cover) ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-lg">
                {getInitials()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" title="Online" />
              <button className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors shadow-lg">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name + info */}
            <div className="flex-1 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-900">{editValues.name}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">Pro</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Online
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">{editValues.role} · {editValues.company}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {[
                    { icon: MapPin, val: editValues.location },
                    { icon: Clock, val: 'IST (UTC+5:30)' },
                    { icon: Calendar, val: 'Joined March 2024' },
                    { icon: Globe, val: editValues.website },
                  ].map(({ icon: Icon, val }, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-slate-400">
                      <Icon className="w-3 h-3" />{val}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap md:flex-shrink-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
                  <Share2 className="w-3.5 h-3.5" />Share
                </button>
                <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
                  <Download className="w-3.5 h-3.5" />vCard
                </button>
              </div>
            </div>
          </div>

          {/* Bio */}
          {!isEditing && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-2xl">{editValues.bio}</p>
          )}

          {/* Connected channel chips */}
          {!isEditing && (profile?.primary_channels?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile?.primary_channels || []).map(id => (
                <ChannelChip key={id} id={id} label={id.charAt(0).toUpperCase() + id.slice(1)} />
              ))}
            </div>
          )}

          {/* Inline Edit form */}
          {isEditing && (
            <div className="mt-5 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <p className="text-sm font-semibold text-slate-700">Edit Profile Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Role', key: 'role', type: 'text' },
                  { label: 'Company', key: 'company', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'tel' },
                  { label: 'Location', key: 'location', type: 'text' },
                  { label: 'Website', key: 'website', type: 'url' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                    <input
                      type={type}
                      value={(editValues as any)[key]}
                      onChange={e => setEditValues(v => ({ ...v, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={editValues.bio}
                    onChange={e => setEditValues(v => ({ ...v, bio: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-t border-slate-100 px-4 lg:px-6 mt-4 lg:mt-5 flex gap-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview Tab ───────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const maxSpark = Math.max(...stat.spark);
              return (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-5 hover:shadow-md hover:border-slate-300 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                  <div className="mt-3 flex items-end gap-0.5 h-8">
                    {stat.spark.map((v, j) => (
                      <div
                        key={j}
                        className={`flex-1 rounded-sm ${stat.color.replace('text-', 'bg-')} transition-all`}
                        style={{
                          height: `${(v / maxSpark) * 100}%`,
                          opacity: j === stat.spark.length - 1 ? 1 : 0.35 + (j / stat.spark.length) * 0.5,
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* ── Professional SVG Line Chart ── */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Weekly Activity</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Messages sent · Apr 2026</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <span className="text-xs text-slate-500">Messages</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-500">Deals</span>
                  </div>
                  <select className="ml-2 px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                </div>
              </div>

              {/* Totals row */}
              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">301</p>
                  <p className="text-xs text-slate-400">Total messages</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">13</p>
                  <p className="text-xs text-slate-400">Deals this week</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold ml-auto self-end pb-3">
                  <TrendingUp className="w-3.5 h-3.5" /> +18% vs last week
                </div>
              </div>

              {/* SVG chart */}
              <div className="relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between items-end pr-2 w-8">
                  {[maxMessages, Math.round(maxMessages * 0.66), Math.round(maxMessages * 0.33), 0].map((v, i) => (
                    <span key={i} className="text-[10px] text-slate-300 leading-none">{v}</span>
                  ))}
                </div>

                <div className="ml-8">
                  <svg
                    viewBox={`0 0 100 ${CHART_H}`}
                    preserveAspectRatio="none"
                    className="w-full"
                    style={{ height: '140px' }}
                  >
                    <defs>
                      <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#1e293b" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#64748b" />
                        <stop offset="60%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.33, 0.66, 1].map((t, i) => (
                      <line
                        key={i}
                        x1="0" y1={CHART_H * (1 - t)}
                        x2="100" y2={CHART_H * (1 - t)}
                        stroke="#f1f5f9" strokeWidth="0.5"
                      />
                    ))}

                    {/* Area fill */}
                    <polygon
                      points={areaPoints}
                      fill="url(#msgGrad)"
                    />

                    {/* Line */}
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {weeklyData.map((d, i) => {
                      const x = (i / (weeklyData.length - 1)) * 100;
                      const y = CHART_H - (d.messages / maxMessages) * CHART_H;
                      const isToday = i === 4;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="2.5"
                            fill={isToday ? '#f97316' : '#1e293b'}
                            stroke="white" strokeWidth="1.5"
                          />
                          {/* Deal dots */}
                          {d.deals > 0 && (
                            <circle cx={x} cy={y - 7} r="2"
                              fill="#22c55e"
                              stroke="white" strokeWidth="1"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* X-axis labels */}
                  <div className="flex justify-between mt-1">
                    {weeklyData.map((d, i) => (
                      <span
                        key={i}
                        className={`text-[11px] font-medium ${i === 4 ? 'text-orange-500' : 'text-slate-400'}`}
                      >
                        {d.day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-5">Recent Activity</h2>
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
                <div className="space-y-5">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 relative">
                      <div className={`w-4 h-4 rounded-full ${activity.color} flex-shrink-0 mt-0.5 ring-4 ring-white z-10`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 leading-snug">{activity.action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full mt-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-100">
                View Full Activity Log →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Activity Tab ─────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900">All Activity</h2>
            <select className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none">
              <option>All Types</option>
              <option>Messages</option>
              <option>Deals</option>
              <option>AI Actions</option>
            </select>
          </div>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
            <div className="space-y-6">
              {[...recentActivity, ...recentActivity].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className={`w-4 h-4 rounded-full ${activity.color} flex-shrink-0 mt-0.5 ring-4 ring-white z-10`} />
                  <div className="flex-1 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-700">{activity.action}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">{activity.type}</span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Load More
          </button>
        </div>
      )}

      {/* ── Team Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Team Members</h2>
              <p className="text-xs text-slate-500 mt-0.5">12 active members · 3 pending invites</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors">
              <Plus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {team.map((member, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {member.initials}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${member.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 truncate">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    member.status === 'owner' ? 'bg-orange-100 text-orange-700' :
                    member.status === 'admin' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-700">{member.messages.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">msgs</p>
                  </div>
                </div>
                <button className="w-full mt-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-all">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Profiles Tab ─────────────────────────────────────────────── */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Connected Channel Profiles</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your linked social and messaging accounts — click to open</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Channel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialProfiles.map((profile, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md group ${
                  profile.connected
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-dashed border-slate-300 opacity-70'
                }`}
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* BW channel icon */}
                      <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="w-5 h-5 flex items-center justify-center">{getChannelIcon(profile.channel)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">{profile.label}</p>
                          {profile.connected
                            ? <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Connected</span>
                            : <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">Not connected</span>
                          }
                        </div>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">{profile.handle}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{profile.desc}</p>
                      </div>
                    </div>

                    {profile.connected ? (
                      <a
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 transition-colors group-hover:shadow-sm"
                      >
                        Open <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Connect
                      </button>
                    )}
                  </div>

                  {/* Stats row */}
                  {profile.connected && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
                      {profile.stats.map((s, j) => (
                        <div key={j} className="text-center">
                          <p className="text-sm font-bold text-slate-900">{s.val}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Not connected CTA */}
                  {!profile.connected && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400">Connect this channel to track conversations and sync contacts automatically.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
