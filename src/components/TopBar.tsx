import React, { useState, useRef, useEffect } from 'react';
import { Share2, Check, Search, Plus, SlidersHorizontal, X, List, Columns3, Trash2, ChevronDown, Menu } from 'lucide-react';
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
  onToggleMobileSidebar?: () => void;
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
  onToggleMobileSidebar,
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
      <div className="px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Project Header Info + Hamburger on mobile */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Sleek Hamburger button - Mobile only (< md) */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-100 bg-card border border-border hover:border-border-active rounded-lg transition-colors flex-shrink-0 shadow-subtle flex items-center justify-center"
              title="Open navigation menu"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4 stroke-[1.8]" />
            </button>

            <h1 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight flex items-center gap-2 truncate">
              {isTrashActive && <Trash2 className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              <span className="truncate">{isTrashActive ? t('trash') : project.name}</span>
            </h1>
            <span className="text-xs font-mono text-zinc-500 flex-shrink-0">
              {isTrashActive
                ? `${totalCount} ${t('trash').toLowerCase()}`
                : totalCount > 0
                ? t('completedFraction', { completed: completedCount, total: totalCount })
                : t('zeroTasks')}
            </span>
          </div>

          {/* On Mobile: New Task Button right in top row for easy 1-tap thumb reach */}
          {!isTrashActive && (
            <button
              type="button"
              onClick={onQuickNewTask}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-subtle flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{t('newTask')}</span>
            </button>
          )}
        </div>

        {/* Action Controls: View Toggle, Active Tag, Search, Sort, Share, Desktop New Task */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* View Toggle: List vs Board */}
          {!isTrashActive && (
            <div className="flex items-center bg-card border border-border rounded-lg p-0.5 text-zinc-400 flex-shrink-0">
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
            <div className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-md text-xs text-zinc-300 font-mono flex-shrink-0">
              <span>#{selectedTag}</span>
              <button type="button" onClick={onClearTag} className="text-zinc-500 hover:text-zinc-100 p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Search Box: flex-1 on mobile so it expands cleanly to fill row space, sm:w-44 on desktop */}
          <div className="relative flex items-center flex-1 sm:flex-initial min-w-[120px] sm:w-44">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-8 pr-2.5 py-1.5 bg-card border border-border rounded-lg text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-border-active transition-colors"
            />
          </div>

          {/* Custom Tailwind Sort Dropdown */}
          {!isTrashActive && (
            <div ref={sortRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-card border rounded-lg text-xs transition-colors select-none ${
                  isSortOpen ? 'border-accent text-zinc-100' : 'border-border text-zinc-300 hover:border-border-active'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden sm:inline">{currentSortLabel}</span>
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
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-card border border-border hover:border-border-active text-xs text-zinc-300 hover:text-zinc-100 transition-colors flex-shrink-0"
              title="Share real-time project URL"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span className="text-emerald-400 text-xs hidden sm:inline">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span className="hidden sm:inline">{t('share')}</span>
                </>
              )}
            </button>
          )}

          {/* New Task Button - Desktop only (hidden on mobile since it's placed in the top row) */}
          {!isTrashActive && (
            <button
              type="button"
              onClick={onQuickNewTask}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-subtle flex-shrink-0"
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
