import React from 'react';
import { FilterStatus } from '../types';
import { X } from 'lucide-react';

interface TaskFilterProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  selectedTag: string | null;
  onClearTag: () => void;
  completedCount: number;
  onClearCompleted: () => void;
  totalCount: number;
}

export const TaskFilter: React.FC<TaskFilterProps> = ({
  currentFilter,
  onFilterChange,
  selectedTag,
  onClearTag,
  completedCount,
  onClearCompleted,
  totalCount,
}) => {
  if (totalCount === 0) return null;

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-900 text-xs select-none">
      <div className="flex items-center space-x-4">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            className={`transition-colors duration-150 ${
              currentFilter === value
                ? 'text-zinc-200 font-medium'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}

        {selectedTag && (
          <div className="flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 rounded">
            <span>#{selectedTag}</span>
            <button
              type="button"
              onClick={onClearTag}
              className="text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <X className="w-3 h-3 stroke-[2]" />
            </button>
          </div>
        )}
      </div>

      {completedCount > 0 && (
        <button
          type="button"
          onClick={onClearCompleted}
          className="text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
        >
          Clear completed ({completedCount})
        </button>
      )}
    </div>
  );
};
