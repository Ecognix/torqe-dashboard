'use client';

import Image from 'next/image';
import { Inbox, Bot, ListChecks, Calendar, HeartHandshake, CalendarDays } from 'lucide-react';
import { getChannelIcon } from '@/lib/icons';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: any) => void;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  userName?: string;
  userInitials?: string;
}

const mainNavItems = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, badge: 14 },
  { id: 'ai', label: 'AI Tools', icon: Bot, badge: 5 },
  { id: 'pipeline', label: 'Pipeline', icon: ListChecks },
  { id: 'scheduled', label: 'Scheduled Messages', icon: Calendar },
  { id: 'negotiate', label: 'Negotiate Coach', icon: HeartHandshake },
  { id: 'calendar', label: 'TorqeAI Calendar', icon: CalendarDays },
];

const channels = [
  { id: 'whatsapp', label: 'WhatsApp', badge: 6 },
  { id: 'gmail', label: 'Gmail', badge: 4 },
  { id: 'linkedin', label: 'LinkedIn', badge: 2 },
  { id: 'slack', label: 'Slack', badge: 1 },
  { id: 'instagram', label: 'Instagram' },
  { id: 'telegram', label: 'Telegram', badge: 1 },
];

export default function Sidebar({ activeView, onViewChange, isOpen, onClose, onProfileClick, userName, userInitials }: SidebarProps) {
  return (
    <aside className={`
      fixed lg:relative inset-y-0 left-0 z-50
      w-[260px] min-w-[260px] h-full
      bg-neutral-900 border-r border-neutral-800
      flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Torqe logo"
            width={32}
            height={32}
            className="rounded-lg object-contain"
          />
          <span
            className="text-xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Torqe
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {/* Main Section */}
        <div className="mb-6">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Main
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-xl
                  text-base lg:text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-orange/10 text-orange' 
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5" size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-xs font-bold
                    ${isActive ? 'bg-orange text-white' : 'bg-orange text-white'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Channels Section */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Channels
          </div>
          {channels.map((channel) => {
            const isActive = activeView === `channel-${channel.id}`;
            return (
            <button
              key={channel.id}
              onClick={() => {
                onViewChange(`channel-${channel.id}`);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-xl text-base lg:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-orange/10 text-orange'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center text-white">
                {getChannelIcon(channel.id)}
              </span>
              <span className="flex-1 text-left">{channel.label}</span>
              {channel.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-orange text-white' : 'bg-neutral-700 text-neutral-300'
                }`}>
                  {channel.badge}
                </span>
              )}
            </button>
            );
          })}
        </div>
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-neutral-800">
        <button 
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
          onClick={onProfileClick}
        >
          <div className="w-10 h-10 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-orange to-orange-400 flex items-center justify-center font-bold text-white text-sm">
            {userInitials || '?'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-base lg:text-sm font-semibold text-white truncate">{userName || 'Your Profile'}</div>
            <div className="text-sm lg:text-xs text-orange font-medium">Pro Plan</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
