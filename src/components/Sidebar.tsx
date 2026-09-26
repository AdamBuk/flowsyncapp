import React, { useState } from 'react';
import { Layers, Plus, Hash, Trash2, Cloud } from 'lucide-react';
import { Project } from '../types';
import { realtimeSync } from '../services/firebase';
import { useI18n } from '../i18n';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  isTrashActive: boolean;
  deletedCount: number;
  onSelectProject: (projectId: string) => void;
  onSelectTrash: () => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenFirebaseModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  projects,
  activeProjectId,
  isTrashActive,
  deletedCount,
  onSelectProject,
  onSelectTrash,
  onCreateProject,
  onDeleteProject,
  onOpenFirebaseModal,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const isCloud = realtimeSync.isCloudConnected();
  const { language, setLanguage, t } = useI18n();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-surface border-r border-border flex flex-col justify-between select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-2 py-1.5 text-zinc-100 font-semibold tracking-tight text-sm">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-6 h-6 rounded bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{t('workspace')}</span>
          </div>

          {/* Minimalist Language Switcher EN / CZ */}
          <div className="flex items-center bg-card border border-border rounded-md p-0.5 text-[11px] font-mono">
            <button
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
        </div>

        {/* Projects / Lists Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>{t('projectsAndLists')}</span>
            <button
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
                  onClick={() => onSelectProject(proj.id)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
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
                      className="p-1 text-rose-500/70 hover:text-rose-400 opacity-70 group-hover:opacity-100 transition-opacity rounded hover:bg-rose-500/15"
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

      {/* Bottom Nav: Trash Link & Real-time Status */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Trash Navigation Link */}
        <button
          onClick={onSelectTrash}
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
          onClick={onOpenFirebaseModal}
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
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
