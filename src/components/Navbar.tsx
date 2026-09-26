import React, { useState } from 'react';
import { Share2, Check, Layers, Users, Settings } from 'lucide-react';
import { realtimeSync } from '../services/firebase';

interface NavbarProps {
  currentRoom: string;
  onOpenRoomModal: () => void;
  onOpenFirebaseModal: () => void;
  totalCount: number;
  completedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoom,
  onOpenRoomModal,
  onOpenFirebaseModal,
  totalCount,
  completedCount,
}) => {
  const [copied, setCopied] = useState(false);
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isCloud = realtimeSync.isCloudConnected();

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('room', currentRoom);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand & Room Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold tracking-tight text-sm select-none">
            <div className="w-6 h-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span>FlowSync</span>
          </div>

          <div className="h-4 w-[1px] bg-border hidden sm:block" />

          {/* Current Room Pill */}
          <button
            onClick={onOpenRoomModal}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-card border border-border hover:border-border-active text-xs font-mono text-zinc-300 hover:text-zinc-100 transition-colors"
            title="Switch or create shared room"
          >
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{currentRoom}</span>
            <span className="text-[10px] text-zinc-500 font-sans">▾</span>
          </button>
        </div>

        {/* Right Actions: Sync status, Share, Firebase Config */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Indicator */}
          <button
            onClick={onOpenFirebaseModal}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-card/60 border border-border text-xs text-zinc-400 hover:text-zinc-200 hover:border-border-active transition-colors"
            title="Real-time sync status & settings"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden md:inline font-mono text-[11px]">
              {isCloud ? 'Firestore Cloud' : 'Live Sync'}
            </span>
            <Settings className="w-3 h-3 text-zinc-500" />
          </button>

          {/* Share Link Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-subtle"
            title="Copy shareable link for real-time collaboration"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 stroke-[2]" />
                <span className="hidden sm:inline">Share Room</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sleek Hairline Progress Bar */}
      <div className="w-full h-[2px] bg-border/40 overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </header>
  );
};
