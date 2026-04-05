'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import InboxView from '@/components/views/InboxView';
import AIToolsView from '@/components/views/AIToolsView';
import PipelineView from '@/components/views/PipelineView';
import NegotiateView from '@/components/views/NegotiateView';
import ScheduledView from '@/components/views/ScheduledView';
import CalendarView from '@/components/views/CalendarView';
import ChannelView from '@/components/views/ChannelView';
import SettingsView from '@/components/views/SettingsView';
import ProfileView from '@/components/views/ProfileView';
import ChatbotPanel from '@/components/ChatbotPanel';
import NotificationSidebar from '@/components/NotificationSidebar';
import ContactProfilePanel from '@/components/ContactProfilePanel';
import type { Message } from '@/types';

type ViewType = 'inbox' | 'ai' | 'pipeline' | 'scheduled' | 'negotiate' | 'calendar' | 'channel-whatsapp' | 'channel-gmail' | 'channel-linkedin' | 'channel-slack' | 'channel-instagram' | 'channel-telegram';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ViewType>('inbox');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotTab, setChatbotTab] = useState<'agent' | 'negotiate'>('agent');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number>(0);
  const [contactProfileOpen, setContactProfileOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Message | null>(null);

  const viewTitles: Record<ViewType, string> = {
    inbox: 'Inbox',
    ai: 'AI Tools',
    pipeline: 'Pipeline',
    scheduled: 'Scheduled Messages',
    negotiate: 'Negotiate Coach',
    calendar: 'TorqeAI Calendar',
    'channel-whatsapp': 'WhatsApp',
    'channel-gmail': 'Gmail',
    'channel-linkedin': 'LinkedIn',
    'channel-slack': 'Slack',
    'channel-instagram': 'Instagram',
    'channel-telegram': 'Telegram',
  };

  const toggleChatbot = (tab: 'agent' | 'negotiate') => {
    if (chatbotOpen && chatbotTab === tab) {
      setChatbotOpen(false);
    } else {
      setChatbotTab(tab);
      setChatbotOpen(true);
    }
  };

  const toggleNotificationSidebar = () => {
    setNotificationSidebarOpen(!notificationSidebarOpen);
  };

  const handleViewChange = (view: any) => {
    setActiveView(view);
    setShowSettings(false);
    setShowProfile(false);
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile((prev) => !prev);
    setShowSettings(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'inbox':
        return <InboxView onChatbotAction={toggleChatbot} onProfileClick={(contact) => { setSelectedContact(contact); setContactProfileOpen(true); }} />;
      case 'ai':
        return <AIToolsView />;
      case 'pipeline':
        return <PipelineView />;
      case 'scheduled':
        return <ScheduledView />;
      case 'negotiate':
        return <NegotiateView />;
      case 'calendar':
        return <CalendarView />;
      case 'channel-whatsapp':
        return <ChannelView channel="whatsapp" />;
      case 'channel-gmail':
        return <ChannelView channel="gmail" />;
      case 'channel-linkedin':
        return <ChannelView channel="linkedin" />;
      case 'channel-slack':
        return <ChannelView channel="slack" />;
      case 'channel-instagram':
        return <ChannelView channel="instagram" />;
      case 'channel-telegram':
        return <ChannelView channel="telegram" />;
      default:
        return <InboxView onChatbotAction={toggleChatbot} onProfileClick={(contact) => { setSelectedContact(contact); setContactProfileOpen(true); }} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onProfileClick={toggleProfile}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <Header 
          title={viewTitles[activeView]}
          onMenuClick={() => setSidebarOpen(true)}
          onChatbotToggle={toggleChatbot}
          chatbotTab={chatbotTab}
          onNotificationClick={toggleNotificationSidebar}
          onSettingsClick={toggleSettings}
        />
        
        <div className="flex-1 overflow-auto p-3 lg:p-6 bg-slate-50">
          <div className="max-w-screen-2xl mx-auto">
            {showSettings ? <SettingsView /> : showProfile ? <ProfileView /> : renderView()}
          </div>
        </div>
      </main>

      {/* Chatbot Panel */}
      <ChatbotPanel 
        isOpen={chatbotOpen} 
        onClose={() => setChatbotOpen(false)}
        tab={chatbotTab}
        onTabChange={setChatbotTab}
        selectedMessageId={selectedMessageId}
      />

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={notificationSidebarOpen}
        onClose={() => setNotificationSidebarOpen(false)}
      />

      {/* Contact Profile Panel */}
      {selectedContact && (
        <ContactProfilePanel
          isOpen={contactProfileOpen}
          onClose={() => setContactProfileOpen(false)}
          contact={selectedContact}
        />
      )}
    </div>
  );
}
