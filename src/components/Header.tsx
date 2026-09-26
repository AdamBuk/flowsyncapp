import React from 'react';

interface HeaderProps {
  activeCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeCount, totalCount }) => {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="mb-10 select-none">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
          {today}
        </span>
        {totalCount > 0 && (
          <span className="text-xs font-mono text-zinc-500 tracking-tight">
            {activeCount === 0 ? 'All completed' : `${activeCount} remaining`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight text-zinc-100">
          Tasks
        </h1>
      </div>
    </header>
  );
};
