import React, { useState } from 'react';
import { X, Circle, CircleDot, CheckCircle2, Flag } from 'lucide-react';
import { Priority, TaskStatus, TeamMember } from '../types';
import { parseTaskInput } from '../utils/parser';
import { useI18n } from '../i18n';
import { DatePicker } from './DatePicker';
import { AssigneeSelect } from './AssigneeSelect';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers?: TeamMember[];
  onAddTask: (
    title: string,
    tags: string[],
    priority: Priority,
    status: TaskStatus,
    dueDate?: string | null,
    description?: string,
    assignee?: string
  ) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = React.memo(({ isOpen, onClose, teamMembers = [], onAddTask }) => {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsed = parseTaskInput(title.trim());

    onAddTask(
      parsed.cleanTitle,
      parsed.tags,
      priority,
      status,
      dueDate,
      description.trim() || undefined,
      assignee
    );

    setTitle('');
    setDescription('');
    setDueDate(null);
    setPriority('medium');
    setStatus('todo');
    setAssignee(undefined);
    onClose();
  };

  const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'todo', label: t('todo'), icon: <Circle className="w-3 h-3 text-zinc-500" /> },
    { value: 'in_progress', label: t('inProgress'), icon: <CircleDot className="w-3 h-3 text-accent" /> },
    { value: 'done', label: t('done'), icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" /> },
  ];

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'urgent', label: t('urgent'), color: 'text-rose-400 border-rose-500/30' },
    { value: 'high', label: t('high'), color: 'text-amber-400 border-amber-500/30' },
    { value: 'medium', label: t('medium'), color: 'text-zinc-300 border-zinc-700' },
    { value: 'low', label: t('low'), color: 'text-zinc-500 border-zinc-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-surface border border-border w-[95%] sm:w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-dropdown space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-sm font-semibold text-zinc-100">{t('createNewTaskTitle')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 text-zinc-400 hover:text-zinc-100 hover:bg-card rounded-lg transition-colors"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              {t('taskTitleLabel')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('taskTitlePlaceholder')}
              autoFocus
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-border-active transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              {t('descriptionOptional')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t('taskDescPlaceholder')}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-border-active resize-none transition-colors"
            />
          </div>

          {/* Status & Priority custom Tailwind button selectors */}
          <div className="space-y-3 pt-1">
            {/* Custom Status Segmented Selector */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                {t('status')}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-card border border-border rounded-lg p-1">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-1.5 px-1.5 sm:px-2 rounded-md text-xs transition-colors select-none min-h-[34px] sm:min-h-0 ${
                      status === opt.value
                        ? 'bg-zinc-800 text-zinc-100 font-medium shadow-subtle border border-border/80'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Priority Selector (2 cols on mobile, 4 on desktop) */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                {t('priority')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-card border border-border rounded-lg p-1">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`flex items-center justify-center gap-1 py-1.5 sm:py-1 px-2 rounded-md text-xs sm:text-[11px] transition-colors select-none min-h-[32px] sm:min-h-0 ${
                      priority === opt.value
                        ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-subtle border border-border/80'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    <Flag className="w-2.5 h-2.5 flex-shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Assignee & Dark Mode DatePicker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Assignee */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  {t('assignee')}
                </label>
                <AssigneeSelect
                  value={assignee}
                  onChange={setAssignee}
                  teamMembers={teamMembers}
                  placeholder={t('unassigned')}
                />
              </div>

              {/* Custom Dark DatePicker */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  {t('dueDate')}
                </label>
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Select due date..."
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 sm:py-1.5 bg-card border border-border text-zinc-300 text-xs rounded-lg hover:text-zinc-100 hover:border-border-active transition-colors min-h-[36px] sm:min-h-0"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 sm:py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-subtle min-h-[36px] sm:min-h-0"
            >
              {t('createTaskBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

NewTaskModal.displayName = 'NewTaskModal';
