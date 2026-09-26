import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { FilterStatus, SortOption } from '../types';

interface TaskFilterBarProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedTag: string | null;
  onClearTag: () => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  selectedTag,
  onClearTag,
  activeCount,
  completedCount,
  onClearCompleted,
}) => {
  const tabs: { label: string; value: FilterStatus; count?: number }[] = [
    { label: 'All', value: 'all', count: activeCount + completedCount },
    { label: 'Active', value: 'active', count: activeCount },
    { label: 'Completed', value: 'completed', count: completedCount },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 pb-2 text-xs select-none">
      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border self-start">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onFilterChange(tab.value)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              currentFilter === tab.value
                ? 'bg-card text-zinc-100 shadow-subtle border border-border/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-[10px] font-mono text-zinc-500">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right controls: Search, Tag filter, Sort, Clear */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Active Tag Indicator */}
        {selectedTag && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-md text-xs text-zinc-300 font-mono">
            <span>#{selectedTag}</span>
            <button
              onClick={onClearTag}
              className="text-zinc-500 hover:text-zinc-200"
              title="Clear tag filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="pl-8 pr-2.5 py-1 w-32 sm:w-44 bg-surface border border-border rounded-md text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-border-active"
          />
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1 bg-surface border border-border p-0.5 rounded-md text-zinc-400 text-xs">
          <SlidersHorizontal className="w-3 h-3 text-zinc-500 mx-1" />
          {(['created', 'priority', 'due_date', 'title'] as SortOption[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSortChange(opt)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                sortOption === opt ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {opt === 'created' ? 'New' : opt === 'priority' ? 'Prio' : opt === 'due_date' ? 'Due' : 'Title'}
            </button>
          ))}
        </div>

        {/* Clear Completed */}
        {completedCount > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors px-2 py-1"
          >
            Clear ({completedCount})
          </button>
        )}
      </div>
    </div>
  );
};
