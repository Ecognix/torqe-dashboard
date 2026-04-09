'use client';

import { useState } from 'react';
import { Check, X, ExternalLink, Loader2, MessageCircle, Mail, Linkedin, AlertCircle, RefreshCw } from 'lucide-react';
import { useChannelIntegrations } from '@/lib/hooks/useChannelIntegrations';
import { getChannelIcon } from '@/lib/icons';

interface ChannelCardProps {
  channel: string;
  name: string;
  description: string;
  connected: boolean;
  email?: string;
  phone?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
}

function ChannelCard({ 
  channel, 
  name, 
  description, 
  connected, 
  email, 
  phone, 
  onConnect, 
  onDisconnect,
  onSync,
  loading,
  syncLoading 
}: ChannelCardProps & { onSync?: () => void; syncLoading?: boolean }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`relative rounded-2xl border transition-all ${
      connected 
        ? 'border-green-200 bg-green-50/50' 
        : 'border-slate-200 bg-white hover:border-orange-200'
    }`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            connected ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
          }`}>
            <span className="w-6 h-6">{getChannelIcon(channel)}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{name}</h3>
              {connected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <Check className="w-3 h-3" /> Connected
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
            
            {connected && (email || phone) && (
              <p className="text-sm text-slate-600 mt-2 font-medium">
                {email || phone}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {connected && onSync && (
              <button
                onClick={onSync}
                disabled={syncLoading}
                className="px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {syncLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Sync
              </button>
            )}
            {connected ? (
              <button
                onClick={onDisconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disconnect'}
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showDetails && !connected && (
        <ChannelConnectModal 
          channel={channel}
          name={name}
          onClose={() => setShowDetails(false)}
          onConnect={onConnect}
        />
      )}
    </div>
  );
}

function ChannelConnectModal({ 
  channel, 
  name, 
  onClose, 
  onConnect 
}: { 
  channel: string; 
  name: string; 
  onClose: () => void;
  onConnect: () => void;
}) {
  const [step, setStep] = useState<'info' | 'form' | 'loading'>('info');
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');

  const handleWhatsAppConnect = async () => {
    setStep('loading');
    setError('');
    try {
      await onConnect();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      setStep('form');
    }
  };

  if (channel === 'whatsapp') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Connect {name}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {step === 'info' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">WhatsApp Business API Setup Required</p>
                    <p>You need a Meta Business Account and WhatsApp Business API access.</p>
                  </div>
                </div>
              </div>
              
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://business.facebook.com" target="_blank" className="text-orange-600 hover:underline inline-flex items-center gap-1">Meta Business Manager <ExternalLink className="w-3 h-3" /></a></li>
                <li>Create or select your WhatsApp Business Account</li>
                <li>Add a phone number and verify it</li>
                <li>Get your Phone Number ID, Business Account ID, and Access Token</li>
              </ol>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
                >
                  I have my credentials
                </button>
                <a
                  href="https://business.facebook.com/wa/manage/phone-numbers/"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Get Access
                </a>
              </div>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={formData.phoneNumberId}
                  onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Account ID (WABA ID)</label>
                <input
                  type="text"
                  value={formData.businessAccountId}
                  onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Permanent Access Token</label>
                <input
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  placeholder="EAAXXXXXXXXX..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (optional)</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleWhatsAppConnect()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700"
                >
                  Connect WhatsApp
                </button>
                <button
                  onClick={() => setStep('info')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-slate-600">Verifying your WhatsApp credentials...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // OAuth channels (Gmail, LinkedIn)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Connect {name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <p className="text-slate-600 mb-6">
          You'll be redirected to {name} to authorize Torqe to access your account. 
          We only access messages and contacts needed for CRM functionality.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => { onConnect(); onClose(); }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
          >
            Continue to {name}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChannelConnect() {
  const { 
    integrations, 
    loading, 
    isConnected, 
    getIntegration,
    connectGoogle, 
    connectLinkedIn, 
    connectWhatsApp,
    disconnect 
  } = useChannelIntegrations();
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Record<string, string>>({});

  const handleConnect = async (channel: string) => {
    setActionLoading(channel);
    try {
      if (channel === 'gmail') {
        await connectGoogle('gmail');
      } else if (channel === 'linkedin') {
        await connectLinkedIn();
      } else if (channel === 'whatsapp') {
        // WhatsApp is handled in the modal
      }
    } catch (err) {
      console.error('Connection error:', err);
    }
    setActionLoading(null);
  };

  const handleDisconnect = async (channel: string) => {
    setActionLoading(channel);
    try {
      await disconnect(channel);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
    setActionLoading(null);
  };

  const handleSync = async (channel: string) => {
    if (channel !== 'gmail') return;
    setSyncLoading(channel);
    try {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        setLastSync(prev => ({ ...prev, [channel]: new Date().toLocaleTimeString() }));
        alert(`Synced ${data.synced} messages${data.errors > 0 ? ` (${data.errors} errors)` : ''}`);
      } else {
        alert(data.error || 'Sync failed');
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert('Failed to sync');
    }
    setSyncLoading(null);
  };

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Send and receive WhatsApp messages directly in Torqe. Requires WhatsApp Business API.',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync your Gmail inbox, send emails, and track conversations with contacts.',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect with LinkedIn messaging to manage professional conversations.',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Channel Integrations</h2>
          <p className="text-sm text-slate-500">Connect your messaging platforms to unify conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {channels.map((channel) => {
          const integration = getIntegration(channel.id);
          return (
            <ChannelCard
              key={channel.id}
              channel={channel.id}
              name={channel.name}
              description={channel.description}
              connected={isConnected(channel.id)}
              email={integration?.config?.external_email}
              phone={integration?.config?.external_phone}
              onConnect={() => handleConnect(channel.id)}
              onDisconnect={() => handleDisconnect(channel.id)}
              onSync={channel.id === 'gmail' ? () => handleSync(channel.id) : undefined}
              syncLoading={syncLoading === channel.id}
              loading={actionLoading === channel.id}
            />
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-blue-900 text-sm">Need help with setup?</p>
            <p className="text-sm text-blue-700 mt-1">
              Each integration requires specific credentials from the respective platform. 
              Click "Connect" to see step-by-step instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
