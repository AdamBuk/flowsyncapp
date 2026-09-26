import React from 'react';
import { Trash2, RotateCcw, Calendar, Flag, Hash } from 'lucide-react';
import { Task, Project } from '../types';
import { useI18n } from '../i18n';

interface TrashViewProps {
  deletedTasks: Task[];
  projects: Project[];
  onRestore: (taskId: string, projectId: string) => void;
  onPermanentDelete: (taskId: string, projectId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashView: React.FC<TrashViewProps> = React.memo(({
  deletedTasks,
  projects,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
}) => {
  const { t } = useI18n();

  const getProjectName = (projectId: string) => {
    const p = projects.find((proj) => proj.id === projectId);
    return p ? p.name : projectId;
  };

  const handleEmptyTrash = () => {
    if (deletedTasks.length === 0) return;
    onEmptyTrash();
  };

  const handlePermanentDelete = (taskId: string, projectId: string) => {
    onPermanentDelete(taskId, projectId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Trash Header Controls */}
      <div className="flex items-center justify-between py-2 border-b border-border/40 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Trash2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-zinc-200">
            {t('trash')}
          </span>
          <span className="px-1.5 py-0.2 text-[10px] font-mono text-zinc-500 bg-surface rounded border border-border">
            {deletedTasks.length}
          </span>
        </div>

        {deletedTasks.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('emptyTrash')}</span>
          </button>
        )}
      </div>

      {/* Deleted Tasks List */}
      {deletedTasks.length > 0 ? (
        <div className="space-y-2">
          {deletedTasks.map((task) => {
            const projectName = getProjectName(task.projectId);
            const deletedDateStr = task.deletedAt
              ? new Date(task.deletedAt).toLocaleDateString()
              : null;

            return (
              <div
                key={task.id}
                className="group relative bg-card border border-border rounded-xl p-3.5 transition-all duration-150 hover:bg-card-hover hover:border-border-active shadow-subtle flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2.5 flex-wrap mb-1">
                    <span className="text-sm font-normal text-zinc-400 line-through tracking-tight break-words">
                      {task.title}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500 mt-2">
                    {/* Project Origin Badge */}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono border border-border bg-surface rounded text-zinc-400">
                      <Hash className="w-2.5 h-2.5 text-zinc-500" />
                      <span>{projectName}</span>
                    </span>

                    {/* Priority Badge */}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono border border-border bg-surface rounded text-zinc-400">
                      <Flag className="w-2.5 h-2.5 text-zinc-500" />
                      <span>{t(task.priority)}</span>
                    </span>

                    {/* Deleted Date */}
                    {deletedDateStr && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{t('deletedOn', { date: deletedDateStr })}</span>
                      </span>
                    )}

                    {/* Tags */}
                    {task.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 border border-border/80 rounded bg-surface/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions: Restore & Permanent Delete (visible on mobile, hover on desktop) */}
                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-100 sm:opacity-80 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onRestore(task.id, task.projectId)}
                    className="flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-md bg-surface border border-border hover:border-accent hover:text-accent text-zinc-300 text-xs font-medium transition-colors shadow-subtle min-h-[28px] sm:min-h-0"
                    title={t('restore')}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('restore')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(task.id, task.projectId)}
                    className="p-2 sm:p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                    title={t('deletePermanently')}
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-card/20 px-4 select-none">
          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-zinc-500 mx-auto mb-3">
            <Trash2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-zinc-300 mb-1">
            {t('emptyTrashTitle')}
          </p>
          <p className="text-xs text-zinc-500 font-mono max-w-sm mx-auto">
            {t('emptyTrashSubtitle')}
          </p>
        </div>
      )}
    </div>
  );
});

TrashView.displayName = 'TrashView';
