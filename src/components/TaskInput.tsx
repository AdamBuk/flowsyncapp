import React, { useState, useRef } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { Priority } from '../types';
import { parseTaskInput } from '../utils/parser';
import { DatePicker } from './DatePicker';

interface TaskInputProps {
  onAddTask: (title: string, tags: string[], priority: Priority, dueDate?: string | null) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    const parsed = parseTaskInput(trimmed);
    if (!parsed.cleanTitle) return;

    onAddTask(parsed.cleanTitle, parsed.tags, priority, dueDate);
    setValue('');
    setDueDate(null);
    setShowOptions(false);
  };

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'urgent', label: 'Urgent', color: 'text-rose-400' },
    { value: 'high', label: 'High', color: 'text-amber-400' },
    { value: 'medium', label: 'Med', color: 'text-indigo-400' },
    { value: 'low', label: 'Low', color: 'text-emerald-400' },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-3 shadow-card transition-all duration-200 focus-within:border-border-active"
    >
      <div className="flex items-center gap-3">
        <Plus className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.trim() && !showOptions) setShowOptions(true);
          }}
          onFocus={() => setShowOptions(true)}
          placeholder="Add a task... use #tag for labels (press Enter to create)"
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
        />

        {value.trim() && (
          <button
            type="submit"
            className="flex-shrink-0 p-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
            title="Create task"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showOptions && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Custom Priority Selector */}
            <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    priority === opt.value
                      ? 'bg-zinc-800 text-zinc-100 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className={priority === opt.value ? opt.color : ''}>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Dark Mode DatePicker */}
            <div className="w-44">
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>
          </div>

          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">Enter ↵</kbd> to save
          </span>
        </div>
      )}
    </form>
  );
};
