import React, { useState, useRef, useEffect } from 'react';
import { Share2, Check, Search, Plus, SlidersHorizontal, X, List, Columns3, Trash2, ChevronDown } from 'lucide-react';
import { Project, SortOption, ViewMode } from '../types';
import { useI18n } from '../i18n';

interface TopBarProps {
  project: Project;
  totalCount: number;
  completedCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOption: SortOption;
  onSortChange: (s: SortOption) => void;
  selectedTag: string | null;
  onClearTag: () => void;
  onQuickNewTask: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isTrashActive?: boolean;
}

export const TopBar: React.FC<TopBarProps> = React.memo(({
  project,
  totalCount,
  completedCount,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  selectedTag,
  onClearTag,
  onQuickNewTask,
  viewMode,
  onViewModeChange,
  isTrashActive = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Click outside to close custom sort dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSortOpen]);

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('project', project.id);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'created', label: t('sortCreated') },
    { value: 'due_date', label: t('sortDueDate') },
    { value: 'priority', label: t('sortPriority') },
    { value: 'title', label: t('sortTitle') },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === sortOption)?.label || t('sortCreated');

  return (
    <div className="sticky top-0 z-20 bg-app/95 backdrop-blur-md border-b border-border">
      <div className="px-6 py-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Project Header Info */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            {isTrashActive && <Trash2 className="w-4 h-4 text-rose-400" />}
            <span>{isTrashActive ? t('trash') : project.name}</span>
          </h1>
          <span className="text-xs font-mono text-zinc-500">
            {isTrashActive
              ? `${totalCount} ${t('trash').toLowerCase()}`
              : totalCount > 0
              ? t('completedFraction', { completed: completedCount, total: totalCount })
              : t('zeroTasks')}
          </span>
        </div>

        {/* Action Controls: View Toggle, Search, Tag filter, Custom Sort Dropdown, Share, New Task */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Toggle: List vs Board */}
          {!isTrashActive && (
            <div className="flex items-center bg-card border border-border rounded-lg p-0.5 text-zinc-400">
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-zinc-800 text-zinc-100 shadow-subtle'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={t('listView')}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('board')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'board'
                    ? 'bg-zinc-800 text-zinc-100 shadow-subtle'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={t('boardView')}
              >
                <Columns3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Tag Filter */}
          {selectedTag && !isTrashActive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-md text-xs text-zinc-300 font-mono">
              <span>#{selectedTag}</span>
              <button onClick={onClearTag} className="text-zinc-500 hover:text-zinc-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-8 pr-2.5 py-1.5 w-36 sm:w-44 bg-card border border-border rounded-lg text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-border-active"
            />
          </div>

          {/* Custom Tailwind Sort Dropdown (Zero Native Select) */}
          {!isTrashActive && (
            <div ref={sortRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-card border rounded-lg text-xs transition-colors select-none ${
                  isSortOpen ? 'border-accent text-zinc-100' : 'border-border text-zinc-300 hover:border-border-active'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                <span>{currentSortLabel}</span>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1.5 z-50 min-w-[140px] bg-zinc-900 border border-border rounded-xl shadow-dropdown py-1 animate-fadeIn">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onSortChange(opt.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                        sortOption === opt.value
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortOption === opt.value && <Check className="w-3 h-3 text-accent stroke-[2.5]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Share Button */}
          {!isTrashActive && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-border-active text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
              title="Share real-time project URL"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span className="text-emerald-400">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span className="hidden sm:inline">{t('share')}</span>
                </>
              )}
            </button>
          )}

          {/* New Task Button */}
          {!isTrashActive && (
            <button
              onClick={onQuickNewTask}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>{t('newTask')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hairline Progress Bar */}
      {!isTrashActive && (
        <div className="w-full h-[2px] bg-border/40 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
});

TopBar.displayName = 'TopBar';
