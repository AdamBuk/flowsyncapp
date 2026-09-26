import React, { useState, useEffect } from 'react';
import { Layers, Plus, Hash, Trash2, Cloud, Users, X } from 'lucide-react';
import { Project } from '../types';
import { realtimeSync } from '../services/firebase';
import { useI18n } from '../i18n';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  isTrashActive: boolean;
  deletedCount: number;
  teamCount?: number;
  onSelectProject: (projectId: string) => void;
  onSelectTrash: () => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenFirebaseModal: () => void;
  onOpenTeamModal: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  projects,
  activeProjectId,
  isTrashActive,
  deletedCount,
  teamCount = 0,
  onSelectProject,
  onSelectTrash,
  onCreateProject,
  onDeleteProject,
  onOpenFirebaseModal,
  onOpenTeamModal,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const isCloud = realtimeSync.isCloudConnected();
  const { language, setLanguage, t } = useI18n();

  // Close mobile drawer on Escape key press
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
      onCloseMobile?.();
    }
  };

  const handleSelectProjectAndClose = (id: string) => {
    onSelectProject(id);
    onCloseMobile?.();
  };

  const handleSelectTrashAndClose = () => {
    onSelectTrash();
    onCloseMobile?.();
  };

  const handleOpenTeamModalAndClose = () => {
    onOpenTeamModal();
    onCloseMobile?.();
  };

  const handleOpenFirebaseModalAndClose = () => {
    onOpenFirebaseModal();
    onCloseMobile?.();
  };

  const renderContent = (isMobile: boolean = false) => (
    <>
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-2 py-1.5 text-zinc-100 font-semibold tracking-tight text-sm">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-6 h-6 rounded bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{t('workspace')}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Minimalist Language Switcher EN / CZ */}
            <div className="flex items-center bg-card border border-border rounded-md p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  language === 'en'
                    ? 'bg-zinc-800 text-zinc-100 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="English"
              >
                EN
              </button>
              <span className="text-zinc-600 px-0.5">/</span>
              <button
                type="button"
                onClick={() => setLanguage('cz')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  language === 'cz'
                    ? 'bg-zinc-800 text-zinc-100 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Čeština"
              >
                CZ
              </button>
            </div>

            {/* Mobile Close Button (X) */}
            {isMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-card border border-border/80 rounded-md transition-colors"
                title={t('close')}
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Projects / Lists Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>{t('projectsAndLists')}</span>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="p-1 hover:text-zinc-200 transition-colors rounded"
              title="Create new project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New Project Input */}
          {isCreating && (
            <form onSubmit={handleCreate} className="px-2 py-1">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onBlur={() => {
                  if (!newProjectName.trim()) setIsCreating(false);
                }}
                placeholder={t('newProjectPlaceholder')}
                autoFocus
                className="w-full bg-card border border-border-active rounded px-2.5 py-1 text-xs text-zinc-100 outline-none"
              />
            </form>
          )}

          {/* Project List */}
          <div className="space-y-0.5 mt-1">
            {projects.map((proj) => {
              const isActive = !isTrashActive && proj.id === activeProjectId;
              const isCustomProject = proj.id !== 'general';

              return (
                <div
                  key={proj.id}
                  onClick={() => handleSelectProjectAndClose(proj.id)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-card text-zinc-100 font-medium border border-border/80'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-card/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                    <Hash className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-accent' : 'text-zinc-500'}`} />
                    <span className="truncate">{proj.name}</span>
                  </div>

                  {/* Red Trash Icon for Custom Projects with Working Direct Deletion */}
                  {isCustomProject && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className="p-1.5 text-rose-500/70 hover:text-rose-400 opacity-80 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity rounded hover:bg-rose-500/15"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Nav: Team, Trash Link & Real-time Status */}
      <div className="p-3 border-t border-border space-y-1.5 flex-shrink-0">
        {/* Manage Team Navigation Link */}
        <button
          type="button"
          onClick={handleOpenTeamModalAndClose}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-zinc-400 hover:text-zinc-200 hover:bg-card/40 border border-transparent"
          title={t('manageTeam')}
        >
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <span>{t('team')}</span>
          </div>
          {teamCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 bg-surface rounded border border-border">
              {teamCount}
            </span>
          )}
        </button>

        {/* Trash Navigation Link */}
        <button
          type="button"
          onClick={handleSelectTrashAndClose}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
            isTrashActive
              ? 'bg-card text-rose-300 font-medium border border-rose-500/30 shadow-subtle'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-card/40 border border-transparent'
          }`}
          title={t('trash')}
        >
          <div className="flex items-center gap-2">
            <Trash2 className={`w-3.5 h-3.5 ${isTrashActive ? 'text-rose-400' : 'text-zinc-500'}`} />
            <span>{t('trash')}</span>
          </div>
          {deletedCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 bg-surface rounded border border-border">
              {deletedCount}
            </span>
          )}
        </button>

        {/* Real-time Cloud Sync */}
        <button
          type="button"
          onClick={handleOpenFirebaseModalAndClose}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-card/60 border border-border hover:border-border-active text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px]">
              {isCloud ? t('firestoreCloud') : t('liveSync')}
            </span>
          </div>
          <Cloud className="w-3.5 h-3.5 text-zinc-500" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile < md) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 h-screen bg-surface border-r border-border flex-col justify-between select-none">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Overlay and Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Subtle Dark Backdrop Blur - clicking outside closes drawer */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            aria-hidden="true"
          />

          {/* Drawer Panel sliding from left */}
          <aside
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full bg-surface border-r border-border flex flex-col justify-between select-none shadow-2xl animate-slideRight z-50"
            role="dialog"
            aria-modal="true"
          >
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
});

Sidebar.displayName = 'Sidebar';
