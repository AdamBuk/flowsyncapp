import React, { useState } from 'react';
import { X, Cloud, Check } from 'lucide-react';
import { realtimeSync } from '../services/firebase';
import { FirebaseCustomConfig } from '../types';
import { useI18n } from '../i18n';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = React.memo(({ isOpen, onClose }) => {
  const { t } = useI18n();
  const isCloud = realtimeSync.isCloudConnected();
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) return;

    const config: FirebaseCustomConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: `${projectId.trim()}.firebaseapp.com`,
      storageBucket: `${projectId.trim()}.appspot.com`,
      messagingSenderId: '',
      appId: ''
    };

    realtimeSync.saveCustomFirebaseConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
      window.location.reload();
    }, 1200);
  };

  const handleDisconnect = () => {
    realtimeSync.clearCustomFirebaseConfig();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border w-full max-w-lg rounded-xl p-5 shadow-dropdown space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-zinc-100 font-medium text-sm">
            <Cloud className="w-4 h-4 text-accent" />
            <span>{t('firebaseModalTitle')}</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200" title={t('close')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Box */}
        <div className="p-3.5 rounded-lg bg-card border border-border space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Database Engine</span>
            <span className="inline-flex items-center gap-1.5 text-accent font-mono text-[11px]">
              Google Cloud Firestore
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/50">
            <span className="text-zinc-400">Project ID</span>
            <span className="text-zinc-200 font-mono text-[11px]">
              flowsync-app-d7a67
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/50">
            <span className="text-zinc-400">Real-Time Sync</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active (onSnapshot Listener)
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          FlowSync is connected directly to your production Firestore database. All task additions, modifications, reordering, subtasks, and deletions are synchronized across all devices in real time over the internet.
        </p>

        {/* Custom Firebase Form */}
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              {t('firebaseProjectIdLabel')}
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="e.g. my-todo-app-12345"
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono outline-none focus:border-border-active"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              {t('firebaseApiKeyLabel')}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono outline-none focus:border-border-active"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isCloud ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                {t('disconnectFirestore')}
              </button>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-card border border-border text-zinc-300 text-xs rounded-lg hover:text-zinc-100"
              >
                {t('close')}
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t('saved')}</span>
                  </>
                ) : (
                  <span>{t('connectFirestore')}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

FirebaseModal.displayName = 'FirebaseModal';

