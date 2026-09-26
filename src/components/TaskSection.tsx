import React, { useState, useCallback } from 'react';
import { Plus, CircleDot, CheckCircle2, Circle } from 'lucide-react';
import { Task, TaskStatus, Priority } from '../types';
import { TaskCard } from './TaskCard';
import { parseTaskInput } from '../utils/parser';
import { useI18n } from '../i18n';

interface TaskSectionProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onToggleStatus: (id: string, newStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onTagClick?: (tag: string) => void;
  onQuickAdd: (title: string, tags: string[], priority: Priority, status: TaskStatus) => void;
  onMoveTaskToSection: (taskId: string, targetStatus: TaskStatus, targetTaskId?: string) => void;
}

export const TaskSection: React.FC<TaskSectionProps> = React.memo(({
  status,
  title,
  tasks,
  onToggleStatus,
  onDelete,
  onSelectTask,
  onTagClick,
  onQuickAdd,
  onMoveTaskToSection,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isSectionDragOver, setIsSectionDragOver] = useState(false);
  const { t } = useI18n();

  const statusIcons: Record<TaskStatus, React.ReactNode> = {
    todo: <Circle className="w-3.5 h-3.5 text-zinc-500" />,
    in_progress: <CircleDot className="w-3.5 h-3.5 text-accent" />,
    done: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80" />,
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsed = parseTaskInput(newTitle.trim());
    onQuickAdd(parsed.cleanTitle, parsed.tags, 'medium', status);
    setNewTitle('');
    setIsAdding(false);
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isSectionDragOver) setIsSectionDragOver(true);
  };

  const handleSectionDragLeave = (e: React.DragEvent) => {
    // Only deactivate if leaving the section bounds
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsSectionDragOver(false);
    }
  };

  const handleSectionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsSectionDragOver(false);
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    if (draggedTaskId) {
      onMoveTaskToSection(draggedTaskId, status);
    }
  };

  const handleCardDrop = useCallback((e: React.DragEvent, targetTaskId: string) => {
    e.stopPropagation();
    setIsSectionDragOver(false);
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    if (draggedTaskId) {
      onMoveTaskToSection(draggedTaskId, status, targetTaskId);
    }
  }, [onMoveTaskToSection, status]);

  return (
    <div
      onDragOver={handleSectionDragOver}
      onDragLeave={handleSectionDragLeave}
      onDrop={handleSectionDrop}
      className={`space-y-3 p-2.5 -mx-2.5 rounded-2xl transition-all duration-200 ${
        isSectionDragOver ? 'bg-accent/[0.04] ring-1 ring-accent/30' : ''
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between py-1 border-b border-border/40 select-none">
        <div className="flex items-center gap-2">
          {statusIcons[status]}
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {title}
          </span>
          <span className="px-1.5 py-0.2 text-[10px] font-mono text-zinc-500 bg-surface rounded border border-border">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>{t('add')}</span>
        </button>
      </div>

      {/* Inline Quick Add in Section */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-card border border-border rounded-xl p-2.5 shadow-subtle">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => {
              if (!newTitle.trim()) setIsAdding(false);
            }}
            placeholder={t('addPlaceholder', { section: title })}
            autoFocus
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
        </form>
      )}

      {/* Task Cards Stack */}
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onSelectTask={onSelectTask}
              onTagClick={onTagClick}
              onDrop={handleCardDrop}
            />
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="py-5 text-center border border-dashed border-border/50 rounded-xl text-zinc-600 text-xs font-mono select-none">
            {t('noTasksInSection', { section: title })}
          </div>
        )
      )}
    </div>
  );
});

TaskSection.displayName = 'TaskSection';
