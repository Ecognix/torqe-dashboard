'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Bell, MessageCircle, Calendar, DollarSign, AlertCircle, ChevronRight } from 'lucide-react';

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

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll: () => void;
}

const allNotifications: Notification[] = [
  { id: 1, type: 'message', title: 'New message from Rahul Nair', description: 'I\'ve been waiting for the revised timeline...', time: '3 min ago', read: false, avatar: 'RN', color: 'bg-gradient-to-br from-orange-500 to-orange-400' },
  { id: 2, type: 'deal', title: 'Deal closing soon', description: 'Rahul Nair\'s deal (₹6L) has 67% close probability', time: '15 min ago', read: false, avatar: '₹', color: 'bg-neutral-800' },
  { id: 3, type: 'reminder', title: 'Scheduled message sent', description: 'Follow-up to Priya Mehta successfully sent', time: '1 hour ago', read: false, avatar: '✓', color: 'bg-neutral-800' },
  { id: 4, type: 'alert', title: 'Sentiment shift detected', description: 'Vikram S. engagement dropped from Hot to Cold', time: '2 hours ago', read: true, avatar: '!', color: 'bg-neutral-800' },
  { id: 5, type: 'message', title: 'New message from Deepa K.', description: 'Voice note received (1:24)', time: '32 min ago', read: true, avatar: 'DK', color: 'bg-gradient-to-br from-green-500 to-green-400' },
  { id: 6, type: 'reminder', title: 'Meeting reminder', description: 'Call with Rahul Nair in 15 minutes', time: '15 min ago', read: true, avatar: 'MR', color: 'bg-neutral-800' },
];

export default function NotificationPopup({ isOpen, onClose, onViewAll }: NotificationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const unreadNotifications = allNotifications.filter(n => !n.read).slice(0, 3);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className="fixed sm:absolute top-14 sm:top-full right-0 sm:right-0 sm:mt-2 w-full sm:w-80 bg-white sm:rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-sm text-slate-900">Notifications</span>
          {unreadNotifications.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {unreadNotifications.length} new
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications */}
      <div className="max-h-80 overflow-y-auto">
        {unreadNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No new notifications</p>
          </div>
        ) : (
          unreadNotifications.map((notification) => (
            <div 
              key={notification.id}
              className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${notification.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {notification.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{notification.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{notification.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div 
        className="p-3 border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={onViewAll}
      >
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
          View all notifications
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
