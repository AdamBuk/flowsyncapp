import React, { useState } from 'react';
import { Check, Trash2, Calendar, Flag, CircleDot, ListChecks, GripVertical } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Priority, TaskStatus } from '../types';
import { useI18n } from '../i18n';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string, newStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onTagClick?: (tag: string) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent, taskId: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetTaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(({
  task,
  onToggleStatus,
  onDelete,
  onSelectTask,
  onTagClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const { t } = useI18n();
  const [isSelfDragging, setIsSelfDragging] = useState(false);
  const [isDragOverTarget, setIsDragOverTarget] = useState(false);

  const priorityStyles: Record<Priority, { label: string; badge: string }> = {
    urgent: { label: t('urgent'), badge: 'text-rose-400/90 border-rose-500/20 bg-rose-500/[0.08]' },
    high: { label: t('high'), badge: 'text-amber-400/90 border-amber-500/20 bg-amber-500/[0.08]' },
    medium: { label: t('medium'), badge: 'text-zinc-400 border-zinc-700/40 bg-zinc-800/30' },
    low: { label: t('low'), badge: 'text-zinc-500 border-zinc-800/60 bg-zinc-900/30' },
  };

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = dateStr < today && task.status !== 'done';
    const isToday = dateStr === today;
    const d = new Date(dateStr);
    let text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (isToday) text = t('today');
    return { text, isOverdue };
  };

  const due = formatDueDate(task.dueDate);
  const isDone = task.status === 'done';

  // Subtask progress calculation
  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const subtasksRatio = subtasks.length > 0 ? `${completedSubtasksCount}/${subtasks.length}` : null;
  const subtasksPercent = subtasks.length > 0 ? (completedSubtasksCount / subtasks.length) * 100 : 0;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: TaskStatus = isDone ? 'todo' : 'done';
    if (nextStatus === 'done') {
      try {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b']
        });
      } catch {}
    }
    onToggleStatus(task.id, nextStatus);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsSelfDragging(true);
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(e, task.id);
      }}
      onDragEnd={() => {
        setIsSelfDragging(false);
        setIsDragOverTarget(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOverTarget(true);
        onDragOver?.(e, task.id);
      }}
      onDragLeave={(e) => {
        setIsDragOverTarget(false);
        onDragLeave?.(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOverTarget(false);
        onDrop?.(e, task.id);
      }}
      onClick={() => onSelectTask(task)}
      className={`group relative bg-card border rounded-xl p-3 transition-all duration-150 shadow-subtle cursor-pointer select-none ${
        isSelfDragging
          ? 'opacity-40 border-dashed border-accent scale-[0.98]'
          : isDragOverTarget
          ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
          : isDone
          ? 'border-border opacity-60 hover:opacity-90 hover:bg-card-hover hover:border-border-active'
          : 'border-border hover:bg-card-hover hover:border-border-active'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Drag Handle Indicator */}
        <div
          className="flex-shrink-0 mt-0.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Status Checkbox Button */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 ${
            isDone
              ? 'bg-zinc-700 border-zinc-600 text-zinc-100'
              : task.status === 'in_progress'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-zinc-700 hover:border-zinc-400 bg-surface'
          }`}
          title={isDone ? t('todo') : t('done')}
        >
          {isDone ? (
            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
          ) : task.status === 'in_progress' ? (
            <CircleDot className="w-2.5 h-2.5 stroke-[2.5]" />
          ) : null}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={`text-sm font-normal text-zinc-200 tracking-tight leading-relaxed transition-all duration-200 break-words ${
                isDone ? 'line-through text-zinc-500' : ''
              }`}
            >
              {task.title}
            </span>

            {/* Secondary Actions (Visible on hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next: TaskStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
                  onToggleStatus(task.id, next);
                }}
                className="px-1.5 py-0.5 bg-surface border border-border hover:border-border-active rounded text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Click to cycle status"
              >
                {task.status === 'todo' ? t('todo') : task.status === 'in_progress' ? t('inProgress') : t('done')}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors rounded"
                title={t('deleteTask')}
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Badges / Metadata row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono border rounded ${
                priorityStyles[task.priority].badge
              }`}
            >
              <Flag className="w-2.5 h-2.5" />
              {priorityStyles[task.priority].label}
            </span>

            {/* Due Date */}
            {due && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono border rounded ${
                  due.isOverdue
                    ? 'text-rose-400/90 border-rose-500/20 bg-rose-500/[0.08]'
                    : 'text-zinc-400 border-zinc-800 bg-surface'
                }`}
              >
                <Calendar className="w-2.5 h-2.5 text-zinc-500" />
                {due.text}
              </span>
            )}

            {/* Subtask Progress Indicator */}
            {subtasksRatio && (
              <div
                className="inline-flex items-center gap-1.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800 bg-surface rounded"
                title={`${completedSubtasksCount} of ${subtasks.length} subtasks completed`}
              >
                <ListChecks className="w-2.5 h-2.5 text-zinc-500" />
                <span>{subtasksRatio}</span>
                <div className="w-7 h-1 bg-border rounded-full overflow-hidden inline-block">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${subtasksPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800/80 rounded hover:border-zinc-700 hover:text-zinc-200 transition-colors bg-surface/50"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
