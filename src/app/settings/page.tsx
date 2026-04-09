'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ChannelConnect from '@/components/ChannelConnect';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  useEffect(() => {
    if (success) {
      // Clear URL params after showing success briefly
      const timer = setTimeout(() => {
        router.replace('/settings');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Settings</h1>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
            <p className="font-medium">Success!</p>
            <p className="text-sm">
              {success === 'gmail_connected' && 'Gmail connected successfully. Your emails will sync shortly.'}
              {success === 'linkedin_connected' && 'LinkedIn connected successfully.'}
              {success === 'whatsapp_connected' && 'WhatsApp Business connected successfully.'}
              {!['gmail_connected', 'linkedin_connected', 'whatsapp_connected'].includes(success) && 'Connected successfully.'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            <p className="font-medium">Error</p>
            <p className="text-sm">
              {error === 'google_auth_denied' && 'You denied access to your Google account.'}
              {error === 'missing_params' && 'Missing required parameters. Please try again.'}
              {error === 'auth_failed' && 'Authentication failed. Please try again.'}
              {!['google_auth_denied', 'missing_params', 'auth_failed'].includes(error) && 'An error occurred. Please try again.'}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
                Settings
              </h2>
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50 text-orange-700 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Integrations
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <ChannelConnect />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
