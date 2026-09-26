import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Circle,
  CircleDot,
  CheckCircle2,
  Flag
} from 'lucide-react';
import { Task, Priority, TaskStatus, Subtask } from '../types';
import { useI18n } from '../i18n';
import { DatePicker } from './DatePicker';

interface TaskDetailPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = React.memo(({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!isOpen || !task) return null;

  const { t } = useI18n();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Keep state synced with incoming real-time task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
  }, [task.id, task.title, task.description]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdate(task.id, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (task.description || '')) {
      onUpdate(task.id, { description });
    }
  };

  // Subtasks logic
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: 'st_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    onUpdate(task.id, { subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  // Render clickable links in description preview
  const renderFormattedDescription = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline inline-flex items-center gap-1 hover:text-accent-hover break-all"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;
  const subtasksProgress = subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'todo', label: t('todo'), icon: <Circle className="w-3 h-3 text-zinc-500" /> },
    { value: 'in_progress', label: t('inProgress'), icon: <CircleDot className="w-3 h-3 text-accent" /> },
    { value: 'done', label: t('done'), icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" /> },
  ];

  const priorityOptions: { value: Priority; label: string }[] = [
    { value: 'urgent', label: t('urgent') },
    { value: 'high', label: t('high') },
    { value: 'medium', label: t('medium') },
    { value: 'low', label: t('low') },
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Dim Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200"
      />

      {/* Right Slide-over Panel */}
      <div className="relative w-full sm:w-[500px] h-full bg-surface border-l border-border flex flex-col justify-between shadow-2xl z-50 animate-slideLeft overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-3">
          {/* Custom Status Segmented Selector */}
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5 gap-0.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate(task.id, { status: opt.value })}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors select-none ${
                  task.status === opt.value
                    ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-subtle border border-border/80'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-card transition-colors"
            title="Close panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Editable Task Title */}
          <div>
            <textarea
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Task title..."
              className="w-full bg-transparent text-lg font-semibold text-zinc-100 placeholder-zinc-500 outline-none resize-none leading-snug border-none p-0 focus:ring-0"
            />
          </div>

          {/* Properties Grid: Custom Priority & Custom Dark DatePicker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-card/60 border border-border rounded-xl text-xs">
            {/* Priority Selector */}
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">
                {t('priority')}
              </span>
              <div className="grid grid-cols-2 gap-1 bg-surface border border-border rounded-lg p-1">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdate(task.id, { priority: opt.value })}
                    className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[11px] transition-colors select-none ${
                      task.priority === opt.value
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

            {/* Custom Dark DatePicker */}
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">
                {t('dueDate')}
              </span>
              <DatePicker
                value={task.dueDate}
                onChange={(newDueDate) => onUpdate(task.id, { dueDate: newDueDate })}
                placeholder="Set due date..."
                className="w-full"
              />
            </div>
          </div>

          {/* Rich Description Section */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              {t('descriptionTitle')}
            </span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder={t('descriptionPlaceholder')}
              className="w-full bg-card border border-border rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-border-active leading-relaxed resize-none"
            />

            {/* Live Link Preview if URLs exist */}
            {description && /(https?:\/\/[^\s]+)/.test(description) && (
              <div className="p-3 bg-card/30 border border-border/60 rounded-xl text-xs text-zinc-300 leading-relaxed break-words">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                  {t('renderedPreview')}
                </span>
                {renderFormattedDescription(description)}
              </div>
            )}
          </div>

          {/* Subtasks / Checklist Section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                {t('subtasks')} ({completedSubtasksCount}/{subtasks.length})
              </span>
              {subtasks.length > 0 && (
                <span className="text-[11px] font-mono text-zinc-500">
                  {subtasksProgress}%
                </span>
              )}
            </div>

            {/* Subtasks Progress Bar */}
            {subtasks.length > 0 && (
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${subtasksProgress}%` }}
                />
              </div>
            )}

            {/* Subtasks List */}
            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="group flex items-center justify-between p-2 rounded-lg bg-card/50 border border-border/80 text-xs hover:border-border-active"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                        st.completed
                          ? 'bg-zinc-700 border-zinc-600 text-zinc-100'
                          : 'border-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {st.completed && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
                    </button>
                    <span
                      className={`truncate ${
                        st.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                    title="Remove subtask"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder={t('addSubtaskPlaceholder')}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-border-active"
              />
              <button
                type="submit"
                className="p-1.5 bg-card border border-border hover:border-border-active text-zinc-300 rounded-lg hover:text-zinc-100"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-zinc-500">
          <span>{t('createdOn')} {new Date(task.createdAt).toLocaleDateString()}</span>
          <button
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-rose-400/80 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('deleteTask')}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

TaskDetailPanel.displayName = 'TaskDetailPanel';
