'use client';

import { useState } from 'react';
import { X, Bell, MessageCircle, Calendar, DollarSign, AlertCircle, Check, CheckCheck } from 'lucide-react';

interface Notification {
  id: number;
  type: 'message' | 'deal' | 'reminder' | 'alert';
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
  color?: string;
}

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications: Notification[] = [
  { id: 1, type: 'message', title: 'New message from Rahul Nair', description: 'I\'ve been waiting for the revised timeline — when can we expect it?', time: '3 min ago', read: false, avatar: 'RN', color: 'bg-gradient-to-br from-orange-500 to-orange-400' },
  { id: 2, type: 'deal', title: 'Deal closing soon', description: 'Rahul Nair\'s deal (₹6L) has 67% close probability. Follow up to push to 80%.', time: '15 min ago', read: false, avatar: '₹', color: 'bg-neutral-800' },
  { id: 3, type: 'reminder', title: 'Scheduled message sent', description: 'Follow-up to Priya Mehta successfully sent via Gmail.', time: '1 hour ago', read: false, avatar: '✓', color: 'bg-neutral-800' },
  { id: 4, type: 'alert', title: 'Sentiment shift detected', description: 'Vikram S. engagement dropped from Hot to Cold. Action recommended.', time: '2 hours ago', read: true, avatar: '!', color: 'bg-neutral-800' },
  { id: 5, type: 'message', title: 'New message from Deepa Krishnan', description: 'Voice note received (1:24) about API webhooks and board meeting.', time: '32 min ago', read: true, avatar: 'DK', color: 'bg-gradient-to-br from-green-500 to-green-400' },
  { id: 6, type: 'reminder', title: 'Meeting reminder', description: 'Call with Rahul Nair in 15 minutes. Vibe Check shows frustration signals.', time: '15 min ago', read: true, avatar: 'MR', color: 'bg-neutral-800' },
];

export default function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const [notifs, setNotifs] = useState<Notification[]>(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-4 h-4" />;
      case 'deal': return <DollarSign className="w-4 h-4" />;
      case 'reminder': return <Calendar className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const filteredNotifs = filter === 'all' ? notifs : notifs.filter(n => !n.read);
  const unreadCount = notifs.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === 'unread'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unread
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No notifications to show</p>
          </div>
        ) : (
          filteredNotifs.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-slate-50/50' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl ${notification.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {notification.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-slate-900 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-400">
                      {getIcon(notification.type)}
                    </span>
                    <span className="text-xs text-slate-400">{notification.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
