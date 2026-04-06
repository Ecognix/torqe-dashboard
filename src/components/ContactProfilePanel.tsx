'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, MapPin, Building2, Calendar, Mail, Phone, Globe, Sparkles } from 'lucide-react';
import { getChannelIcon } from '@/lib/icons';
import type { Message } from '@/types';

interface ContactProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Message;
}

interface SocialProfile {
  platform: string;
  username: string;
  url: string;
  verified: boolean;
}

interface SuggestedProfile {
  platform: string;
  username: string;
  url: string;
  confidence: number;
}

const contactDetails: Record<number, {
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  location?: string;
  joinedDate?: string;
  bio?: string;
  socialProfiles: SocialProfile[];
}> = {
  0: {
    email: 'rahul.nair@techcorp.in',
    phone: '+91 98765 43210',
    company: 'TechCorp India',
    role: 'Product Manager',
    location: 'Bangalore, India',
    joinedDate: 'Jan 2024',
    bio: 'Product lead at TechCorp, focused on enterprise solutions and API integrations.',
    socialProfiles: [
      { platform: 'whatsapp', username: '+91 98765 43210', url: 'https://wa.me/919876543210', verified: true },
      { platform: 'linkedin', username: 'rahulnair-pm', url: 'https://linkedin.com/in/rahulnair-pm', verified: true },
    ],
  },
  1: {
    email: 'priya.mehta@scaleup.io',
    phone: '+91 87654 32109',
    company: 'ScaleUp.io',
    role: 'Head of Operations',
    location: 'Mumbai, India',
    joinedDate: 'Mar 2024',
    bio: 'Operations head evaluating tools for a 50+ team. Enterprise buyer.',
    socialProfiles: [
      { platform: 'gmail', username: 'priya.mehta@scaleup.io', url: 'mailto:priya.mehta@scaleup.io', verified: true },
    ],
  },
  2: {
    email: 'deepa.k@innovate.co',
    phone: '+91 76543 21098',
    company: 'Innovate & Co',
    role: 'CTO',
    location: 'Chennai, India',
    joinedDate: 'Feb 2024',
    bio: 'CTO with deep interest in API webhooks and automation. Board-level decision maker.',
    socialProfiles: [
      { platform: 'whatsapp', username: '+91 76543 21098', url: 'https://wa.me/917654321098', verified: true },
    ],
  },
  3: {
    email: 'vikram.singh@consultpro.in',
    phone: '+91 65432 10987',
    company: 'ConsultPro',
    role: 'Senior Consultant',
    location: 'Delhi, India',
    joinedDate: 'Dec 2023',
    bio: 'Senior consultant evaluating Torqe for team collaboration workflows.',
    socialProfiles: [
      { platform: 'linkedin', username: 'vikramsingh-consult', url: 'https://linkedin.com/in/vikramsingh-consult', verified: true },
    ],
  },
  4: {
    email: 'neha.gupta@brandwise.com',
    phone: '+91 54321 09876',
    company: 'BrandWise',
    role: 'Marketing Director',
    location: 'Pune, India',
    joinedDate: 'Apr 2024',
    bio: 'Marketing director looking at Q2 campaign proposals.',
    socialProfiles: [
      { platform: 'gmail', username: 'neha.gupta@brandwise.com', url: 'mailto:neha.gupta@brandwise.com', verified: true },
    ],
  },
  5: {
    email: 'amit.rao@devstack.io',
    phone: '+91 43210 98765',
    company: 'DevStack',
    role: 'Engineering Lead',
    location: 'Hyderabad, India',
    joinedDate: 'Jan 2024',
    bio: 'Engineering lead focused on integration timelines and technical implementation.',
    socialProfiles: [
      { platform: 'slack', username: '@amitrao', url: 'https://devstack.slack.com/team/amitrao', verified: true },
    ],
  },
  6: {
    email: 'karan.reddy@hirehub.in',
    phone: '+91 32109 87654',
    company: 'HireHub',
    role: 'Founder & CEO',
    location: 'Bangalore, India',
    joinedDate: 'Nov 2023',
    bio: 'Founder exploring AI-powered recruiting workflows. Interested in minimum commitment plans.',
    socialProfiles: [
      { platform: 'whatsapp', username: '+91 32109 87654', url: 'https://wa.me/913210987654', verified: true },
    ],
  },
  7: {
    email: 'simran.sethi@mediapulse.com',
    phone: '+91 21098 76543',
    company: 'MediaPulse',
    role: 'Account Executive',
    location: 'Gurgaon, India',
    joinedDate: 'Feb 2024',
    bio: 'Account exec interested in case studies and ROI proof points.',
    socialProfiles: [
      { platform: 'telegram', username: '@simransethi', url: 'https://t.me/simransethi', verified: true },
    ],
  },
  8: {
    email: 'anil.patel@retailnext.in',
    phone: '+91 10987 65432',
    company: 'RetailNext',
    role: 'Business Development',
    location: 'Ahmedabad, India',
    joinedDate: 'Mar 2024',
    bio: 'BD lead interested in B2B version after seeing product demo on Instagram.',
    socialProfiles: [
      { platform: 'instagram', username: '@anilpatel_biz', url: 'https://instagram.com/anilpatel_biz', verified: true },
    ],
  },
  9: {
    email: 'meera.sharma@legaledge.co',
    phone: '+91 09876 54321',
    company: 'LegalEdge',
    role: 'Procurement Manager',
    location: 'Jaipur, India',
    joinedDate: 'Oct 2023',
    bio: 'Procurement manager handling urgent contract renewals. Key enterprise account.',
    socialProfiles: [
      { platform: 'gmail', username: 'meera.sharma@legaledge.co', url: 'mailto:meera.sharma@legaledge.co', verified: true },
    ],
  },
};

const suggestedProfilesMap: Record<number, SuggestedProfile[]> = {
  0: [
    { platform: 'gmail', username: 'rahul.nair@techcorp.in', url: 'mailto:rahul.nair@techcorp.in', confidence: 92 },
    { platform: 'instagram', username: '@rahulnair_tech', url: 'https://instagram.com/rahulnair_tech', confidence: 74 },
    { platform: 'telegram', username: '@rahulnair', url: 'https://t.me/rahulnair', confidence: 61 },
  ],
  1: [
    { platform: 'linkedin', username: 'priyamehta-ops', url: 'https://linkedin.com/in/priyamehta-ops', confidence: 88 },
    { platform: 'whatsapp', username: '+91 87654 32109', url: 'https://wa.me/918765432109', confidence: 79 },
    { platform: 'instagram', username: '@priya.mehta', url: 'https://instagram.com/priya.mehta', confidence: 55 },
  ],
  2: [
    { platform: 'linkedin', username: 'deepakrishnan-cto', url: 'https://linkedin.com/in/deepakrishnan-cto', confidence: 91 },
    { platform: 'gmail', username: 'deepa.k@innovate.co', url: 'mailto:deepa.k@innovate.co', confidence: 85 },
    { platform: 'slack', username: '@deepak', url: '#', confidence: 58 },
  ],
  3: [
    { platform: 'gmail', username: 'vikram.singh@consultpro.in', url: 'mailto:vikram.singh@consultpro.in', confidence: 90 },
    { platform: 'whatsapp', username: '+91 65432 10987', url: 'https://wa.me/916543210987', confidence: 82 },
    { platform: 'instagram', username: '@vikram.consult', url: 'https://instagram.com/vikram.consult', confidence: 47 },
  ],
  4: [
    { platform: 'linkedin', username: 'nehagupta-marketing', url: 'https://linkedin.com/in/nehagupta-marketing', confidence: 87 },
    { platform: 'instagram', username: '@neha_brandwise', url: 'https://instagram.com/neha_brandwise', confidence: 72 },
    { platform: 'whatsapp', username: '+91 54321 09876', url: 'https://wa.me/915432109876', confidence: 68 },
  ],
  5: [
    { platform: 'linkedin', username: 'amitrao-eng', url: 'https://linkedin.com/in/amitrao-eng', confidence: 89 },
    { platform: 'gmail', username: 'amit.rao@devstack.io', url: 'mailto:amit.rao@devstack.io', confidence: 84 },
    { platform: 'telegram', username: '@amitrao_dev', url: 'https://t.me/amitrao_dev', confidence: 52 },
  ],
  6: [
    { platform: 'linkedin', username: 'karanreddy-ceo', url: 'https://linkedin.com/in/karanreddy-ceo', confidence: 93 },
    { platform: 'gmail', username: 'karan@hirehub.in', url: 'mailto:karan@hirehub.in', confidence: 88 },
    { platform: 'instagram', username: '@karanreddy', url: 'https://instagram.com/karanreddy', confidence: 65 },
  ],
  7: [
    { platform: 'linkedin', username: 'simransethi-ae', url: 'https://linkedin.com/in/simransethi-ae', confidence: 86 },
    { platform: 'gmail', username: 'simran@mediapulse.com', url: 'mailto:simran@mediapulse.com', confidence: 81 },
    { platform: 'instagram', username: '@simran.sethi', url: 'https://instagram.com/simran.sethi', confidence: 70 },
  ],
  8: [
    { platform: 'linkedin', username: 'anilpatel-bd', url: 'https://linkedin.com/in/anilpatel-bd', confidence: 85 },
    { platform: 'whatsapp', username: '+91 10987 65432', url: 'https://wa.me/911098765432', confidence: 76 },
    { platform: 'gmail', username: 'anil@retailnext.in', url: 'mailto:anil@retailnext.in', confidence: 82 },
  ],
  9: [
    { platform: 'linkedin', username: 'meerasharma-proc', url: 'https://linkedin.com/in/meerasharma-proc', confidence: 90 },
    { platform: 'whatsapp', username: '+91 09876 54321', url: 'https://wa.me/910987654321', confidence: 83 },
    { platform: 'telegram', username: '@meera_sharma', url: 'https://t.me/meera_sharma', confidence: 44 },
  ],
};

function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    gmail: 'Gmail',
    linkedin: 'LinkedIn',
    slack: 'Slack',
    instagram: 'Instagram',
    telegram: 'Telegram',
  };
  return labels[platform] || platform;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-green-600 bg-green-50';
  if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-slate-500 bg-slate-100';
}

export default function ContactProfilePanel({ isOpen, onClose, contact }: ContactProfilePanelProps) {
  const [aiSearching, setAiSearching] = useState(false);
  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfile[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);

  const details = contactDetails[contact.id] || {
    socialProfiles: [{ platform: contact.channel, username: contact.channelLabel, url: '#', verified: true }],
  };

  useEffect(() => {
    if (isOpen) {
      setAiSearching(true);
      setSuggestedProfiles([]);
      setRevealedCount(0);

      const timer = setTimeout(() => {
        setAiSearching(false);
        const profiles = suggestedProfilesMap[contact.id] || [];
        setSuggestedProfiles(profiles);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, contact.id]);

  useEffect(() => {
    if (suggestedProfiles.length > 0 && revealedCount < suggestedProfiles.length) {
      const timer = setTimeout(() => {
        setRevealedCount(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [suggestedProfiles, revealedCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 bottom-0 right-0 w-full sm:w-[420px] bg-white border-l border-slate-200 z-[60] flex flex-col shadow-2xl animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="text-base lg:text-sm font-bold text-slate-900">Contact Profile</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Card */}
        <div className="p-6 flex flex-col items-center border-b border-slate-100">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-3"
            style={{ background: contact.gradient }}
          >
            {contact.initials}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{contact.name}</h3>
          {details.role && details.company && (
            <p className="text-base lg:text-sm text-slate-500 mt-0.5">{details.role} at {details.company}</p>
          )}
          {details.bio && (
            <p className="text-sm lg:text-xs text-slate-400 mt-2 text-center leading-relaxed max-w-[300px]">{details.bio}</p>
          )}
        </div>

        {/* Basic Details */}
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Details</h4>
          <div className="space-y-2.5">
            {details.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{details.email}</span>
              </div>
            )}
            {details.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{details.phone}</span>
              </div>
            )}
            {details.company && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{details.company}</span>
              </div>
            )}
            {details.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{details.location}</span>
              </div>
            )}
            {details.joinedDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">Connected since {details.joinedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Linked Social Profiles */}
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Linked Profiles</h4>
          <div className="space-y-2">
            {details.socialProfiles.map((profile, i) => (
              <a
                key={i}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <span className="w-7 h-7 p-1.5 bg-slate-900 rounded-lg text-white flex items-center justify-center flex-shrink-0">
                  {getChannelIcon(profile.platform)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-base lg:text-sm font-medium text-slate-900">{getPlatformLabel(profile.platform)}</p>
                  <p className="text-sm lg:text-xs text-slate-500 truncate">{profile.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  {profile.verified && (
                    <span className="text-xs lg:text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified</span>
                  )}
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* TorqeAI Suggested Profiles */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="TorqeAI" className={`w-5 h-5 ${aiSearching ? 'animate-spin-slow' : ''}`} />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">TorqeAI Suggested Profiles</h4>
          </div>

          {aiSearching ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <img src="/logo.png" alt="TorqeAI" className="w-10 h-10 animate-spin-slow" />
              <p className="text-sm font-medium text-slate-500 animate-thinking">Discovering profiles...</p>
              <p className="text-xs text-slate-400">Scanning social platforms for {contact.name.split(' ')[0]}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestedProfiles.slice(0, revealedCount).map((profile, i) => (
                <a
                  key={i}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all animate-fade-in group"
                >
                  <span className="w-7 h-7 p-1.5 bg-slate-900 rounded-lg text-white flex items-center justify-center flex-shrink-0">
                    {getChannelIcon(profile.platform)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base lg:text-sm font-medium text-slate-900">{getPlatformLabel(profile.platform)}</p>
                    <p className="text-sm lg:text-xs text-slate-500 truncate">{profile.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs lg:text-[10px] font-bold px-2 py-0.5 rounded-full ${getConfidenceColor(profile.confidence)}`}>
                      {profile.confidence}% match
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </a>
              ))}
              {revealedCount >= suggestedProfiles.length && suggestedProfiles.length > 0 && (
                <div className="flex items-center gap-2 mt-3 px-2 animate-fade-in">
                  <Sparkles className="w-3.5 h-3.5 text-orange" />
                  <p className="text-xs text-slate-400">
                    Found {suggestedProfiles.length} probable profiles based on name, email, and activity patterns
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
