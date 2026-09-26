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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border w-full max-w-lg rounded-xl p-5 shadow-dropdown space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-sm font-semibold text-zinc-100">{t('createNewTaskTitle')}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200" title={t('close')}>
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
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-border-active"
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
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-border-active resize-none"
            />
          </div>

          {/* Status & Priority custom Tailwind button selectors */}
          <div className="space-y-3 pt-1">
            {/* Custom Status Segmented Selector */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                {t('status')}
              </label>
              <div className="flex items-center bg-card border border-border rounded-lg p-1 gap-1">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-colors select-none ${
                      status === opt.value
                        ? 'bg-zinc-800 text-zinc-100 font-medium shadow-subtle border border-border/80'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Priority Selector */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                {t('priority')}
              </label>
              <div className="grid grid-cols-4 gap-1 bg-card border border-border rounded-lg p-1">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[11px] transition-colors select-none ${
                      priority === opt.value
                        ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-subtle border border-border/80'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    <Flag className="w-2.5 h-2.5" />
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
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-card border border-border text-zinc-300 text-xs rounded-lg hover:text-zinc-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-subtle"
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
