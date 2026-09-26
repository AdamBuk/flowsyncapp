import React, { useState } from 'react';
import { X, Users, Plus, Trash2, UserCheck } from 'lucide-react';
import { TeamMember } from '../types';
import { useI18n } from '../i18n';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onAddMember: (name: string) => void;
  onDeleteMember: (id: string) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = React.memo(({
  isOpen,
  onClose,
  teamMembers,
  onAddMember,
  onDeleteMember,
}) => {
  const { t } = useI18n();
  const [newMemberName, setNewMemberName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    onAddMember(trimmed);
    setNewMemberName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-surface border border-border w-[95%] sm:w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-dropdown space-y-4 sm:space-y-5 animate-scaleIn my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">{t('manageTeam')}</h2>
              <p className="text-[11px] text-zinc-500 font-mono">
                {t('teamDescription')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 text-zinc-400 hover:text-zinc-100 hover:bg-card rounded-lg transition-colors"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAdd} className="space-y-1.5">
          <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            {t('addMemberPlaceholder')}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="e.g. Alex, Sarah..."
              autoFocus
              className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-border-active transition-colors min-h-[38px] sm:min-h-0"
            />
            <button
              type="submit"
              disabled={!newMemberName.trim()}
              className="px-3.5 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-subtle inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed select-none min-h-[38px] sm:min-h-0 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addMemberBtn')}</span>
            </button>
          </div>
        </form>

        {/* Team Members List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              {t('team')} ({teamMembers.length})
            </span>
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              Real-time Firestore
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
            {teamMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-border rounded-xl">
                {t('noMembersYet')}
              </div>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border hover:border-border-active transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700 flex-shrink-0 select-none">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs text-zinc-100 font-medium truncate">{member.name}</p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        Added {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteMember(member.id)}
                    className="p-2 sm:p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors opacity-90 sm:opacity-70 sm:group-hover:opacity-100 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title={`Remove ${member.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 sm:py-1.5 bg-card border border-border text-zinc-300 text-xs rounded-lg hover:text-zinc-100 hover:border-border-active transition-colors min-h-[36px] sm:min-h-0"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
});

TeamManagementModal.displayName = 'TeamManagementModal';
