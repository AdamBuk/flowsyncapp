import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Task } from '../types';
import { parseTaskInput } from '../utils/parser';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newTitle: string, newTags: string[], rawText: string) => void;
  onTagClick?: (tag: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
  onTagClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.rawText || task.title);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      const parsed = parseTaskInput(trimmed);
      onUpdate(task.id, parsed.cleanTitle, parsed.tags, parsed.rawText);
    } else {
      onDelete(task.id);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(task.rawText || task.title);
      setIsEditing(false);
    }
  };

  const isCompleted = task.completed ?? (task.status === 'done');

  return (
    <div className="group relative flex items-center justify-between py-3 px-3 -mx-3 rounded-md transition-colors duration-150 hover:bg-zinc-900/30">
      <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-4">
        {/* Minimal custom checkbox */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
          className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 ${
            isCompleted
              ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
              : 'border-zinc-700/80 hover:border-zinc-500 bg-transparent'
          }`}
        >
          {isCompleted && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
        </button>

        {/* Task Content or Inline Edit */}
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-zinc-900/80 border border-zinc-700 text-sm text-zinc-200 px-2 py-0.5 rounded outline-none"
          />
        ) : (
          <div className="flex items-baseline space-x-2.5 flex-1 min-w-0">
            <span
              onDoubleClick={() => setIsEditing(true)}
              className={`text-sm tracking-tight transition-all duration-200 break-words ${
                isCompleted
                  ? 'line-through text-zinc-500/80'
                  : 'text-zinc-200'
              }`}
            >
              {task.title}
            </span>

            {/* Subtle Inline Tag Pills */}
            {task.tags && task.tags.length > 0 && (
              <div className="inline-flex items-center space-x-1 flex-shrink-0">
                {task.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                    className="px-1.5 py-0.5 text-[10px] font-mono tracking-tight text-zinc-400 border border-zinc-800 rounded hover:border-zinc-600 hover:text-zinc-200 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary Actions (Hidden until row hover) */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit task"
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
          >
            <Pencil className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
};
