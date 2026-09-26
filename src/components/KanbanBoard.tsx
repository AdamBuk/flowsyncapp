import React, { useState, useCallback } from 'react';
import { Plus, CircleDot, CheckCircle2, Circle } from 'lucide-react';
import { Task, TaskStatus, Priority } from '../types';
import { TaskCard } from './TaskCard';
import { parseTaskInput } from '../utils/parser';
import { useI18n } from '../i18n';

interface KanbanBoardProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
  onToggleStatus: (id: string, newStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onTagClick?: (tag: string) => void;
  onQuickAdd: (title: string, tags: string[], priority: Priority, status: TaskStatus) => void;
  onMoveTaskToSection: (taskId: string, targetStatus: TaskStatus, targetTaskId?: string) => void;
}

interface KanbanColumnProps {
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

const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({
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
  const { t } = useI18n();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    if (draggedTaskId) {
      onMoveTaskToSection(draggedTaskId, status);
    }
  };

  const handleCardDrop = useCallback((e: React.DragEvent, targetTaskId: string) => {
    e.stopPropagation();
    setIsDragOver(false);
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    if (draggedTaskId) {
      onMoveTaskToSection(draggedTaskId, status, targetTaskId);
    }
  }, [onMoveTaskToSection, status]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 w-full min-w-0 md:min-w-[280px] bg-card/25 border border-border rounded-2xl p-3 sm:p-3.5 transition-all duration-200 select-none ${
        isDragOver ? 'bg-accent/[0.04] ring-1 ring-accent/30 border-accent/40' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
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
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2 py-1 -mr-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-card/60 rounded-md transition-colors min-h-[28px]"
          title={t('add')}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('add')}</span>
        </button>
      </div>

      {/* Inline Quick Add form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-3 bg-card border border-border rounded-xl p-2.5 shadow-subtle">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => {
              if (!newTitle.trim()) setIsAdding(false);
            }}
            placeholder={t('addPlaceholder', { section: title })}
            autoFocus
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
          />
        </form>
      )}

      {/* Task Stack */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[480px] md:max-h-[calc(100vh-220px)] pr-0.5">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onSelectTask={onSelectTask}
              onTagClick={onTagClick}
              onDrop={handleCardDrop}
            />
          ))
        ) : (
          !isAdding && (
            <div className="py-10 text-center border border-dashed border-border/40 rounded-xl text-zinc-600 text-xs font-mono">
              {t('noTasksInSection', { section: title })}
            </div>
          )
        )}
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export const KanbanBoard: React.FC<KanbanBoardProps> = React.memo(({
  todoTasks,
  inProgressTasks,
  doneTasks,
  onToggleStatus,
  onDelete,
  onSelectTask,
  onTagClick,
  onQuickAdd,
  onMoveTaskToSection,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-5 items-stretch md:items-start w-full">
      <KanbanColumn
        status="todo"
        title={t('todo')}
        tasks={todoTasks}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onSelectTask={onSelectTask}
        onTagClick={onTagClick}
        onQuickAdd={onQuickAdd}
        onMoveTaskToSection={onMoveTaskToSection}
      />

      <KanbanColumn
        status="in_progress"
        title={t('inProgress')}
        tasks={inProgressTasks}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onSelectTask={onSelectTask}
        onTagClick={onTagClick}
        onQuickAdd={onQuickAdd}
        onMoveTaskToSection={onMoveTaskToSection}
      />

      <KanbanColumn
        status="done"
        title={t('done')}
        tasks={doneTasks}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onSelectTask={onSelectTask}
        onTagClick={onTagClick}
        onQuickAdd={onQuickAdd}
        onMoveTaskToSection={onMoveTaskToSection}
      />
    </div>
  );
});

KanbanBoard.displayName = 'KanbanBoard';
