import React from 'react';
import { FilterStatus } from '../types';

interface EmptyStateProps {
  totalTasks: number;
  filter: FilterStatus;
  selectedTag: string | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  totalTasks,
  filter,
  selectedTag,
}) => {
  if (totalTasks === 0) {
    return (
      <div className="py-20 text-center select-none">
        <p className="text-sm font-light text-zinc-400 mb-1 tracking-tight">
          No tasks yet.
        </p>
        <p className="text-xs font-mono text-zinc-600">
          Type above and press <span className="text-zinc-500">Enter</span> to create one.
        </p>
      </div>
    );
  }

  let message = 'No tasks found';
  if (selectedTag) {
    message = `No tasks tagged #${selectedTag}`;
  } else if (filter === 'active') {
    message = 'All tasks completed';
  } else if (filter === 'completed') {
    message = 'No completed tasks yet';
  }

  return (
    <div className="py-16 text-center select-none">
      <p className="text-xs font-mono text-zinc-500 tracking-tight">
        {message}
      </p>
    </div>
  );
};
