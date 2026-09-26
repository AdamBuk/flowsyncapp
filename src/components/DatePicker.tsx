import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useI18n } from '../i18n';

interface DatePickerProps {
  value?: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = React.memo(({
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial viewing month/year from current value or today
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const parsed = new Date(value + 'T00:00:00');
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  // Keep viewDate updated if value changes externally
  useEffect(() => {
    if (value) {
      const parsed = new Date(value + 'T00:00:00');
      if (!isNaN(parsed.getTime())) setViewDate(parsed);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const formatLocalDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Days grid
  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  const todayStr = formatLocalDate(new Date());

  const handleSelectDay = (day: number) => {
    const selectedDate = new Date(year, month, day);
    onChange(formatLocalDate(selectedDate));
    setIsOpen(false);
  };

  const handleQuickPreset = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    onChange(formatLocalDate(d));
    setIsOpen(false);
  };

  const displayLabel = useMemo(() => {
    if (!value) return placeholder || t('dueDate');
    const d = new Date(value + 'T00:00:00');
    if (isNaN(d.getTime())) return value;
    if (value === todayStr) return t('today');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [value, placeholder, t, todayStr]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-card border text-xs transition-colors outline-none select-none ${
          isOpen ? 'border-accent ring-1 ring-accent/30' : 'border-border hover:border-border-active'
        } ${value ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className={`w-3.5 h-3.5 flex-shrink-0 ${value ? 'text-accent' : 'text-zinc-500'}`} />
          <span className="truncate">{displayLabel}</span>
        </div>

        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="p-0.5 text-zinc-500 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors"
            title="Clear date"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Custom Dark Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 w-64 bg-zinc-900 border border-border rounded-xl shadow-dropdown p-3 animate-fadeIn text-zinc-200">
          {/* Quick Presets */}
          <div className="flex items-center gap-1 pb-2.5 mb-2.5 border-b border-border/60 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleQuickPreset(0)}
              className="flex-1 px-2 py-1 rounded bg-zinc-800/80 hover:bg-indigo-500/20 text-zinc-300 hover:text-indigo-200 transition-colors text-center"
            >
              {t('today')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(1)}
              className="flex-1 px-2 py-1 rounded bg-zinc-800/80 hover:bg-indigo-500/20 text-zinc-300 hover:text-indigo-200 transition-colors text-center"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(7)}
              className="flex-1 px-2 py-1 rounded bg-zinc-800/80 hover:bg-indigo-500/20 text-zinc-300 hover:text-indigo-200 transition-colors text-center"
            >
              +1 Week
            </button>
          </div>

          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between mb-2 px-1 select-none">
            <span className="text-xs font-semibold text-zinc-200">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-zinc-500 mb-1 select-none">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-7 w-7" />;
              }

              const cellDate = new Date(year, month, day);
              const cellDateStr = formatLocalDate(cellDate);
              const isSelected = value === cellDateStr;
              const isToday = todayStr === cellDateStr;

              return (
                <button
                  key={cellDateStr}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 text-xs font-mono rounded-lg flex items-center justify-center transition-all select-none ${
                    isSelected
                      ? 'bg-accent text-white font-semibold shadow-subtle'
                      : isToday
                      ? 'text-accent font-semibold ring-1 ring-accent/40 hover:bg-indigo-500/20 hover:text-indigo-200'
                      : 'text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clear Footer */}
          {value && (
            <div className="pt-2 mt-2 border-t border-border/60 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';
