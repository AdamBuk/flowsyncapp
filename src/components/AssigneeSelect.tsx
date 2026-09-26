import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Check, X } from 'lucide-react';
import { TeamMember } from '../types';
import { useI18n } from '../i18n';

interface AssigneeSelectProps {
  value?: string | null;
  onChange: (assignee: string | undefined) => void;
  teamMembers?: TeamMember[];
  placeholder?: string;
  className?: string;
}

export const AssigneeSelect: React.FC<AssigneeSelectProps> = React.memo(({
  value,
  onChange,
  teamMembers = [],
  placeholder,
  className = '',
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedName = value && typeof value === 'string' && value.trim() ? value.trim() : undefined;
  const initial = selectedName ? selectedName.charAt(0).toUpperCase() : '';
  const isSelectedDeleted = Boolean(
    selectedName && !teamMembers.some((m) => m.name.toLowerCase() === selectedName.toLowerCase())
  );

  const handleSelect = (member?: string) => {
    onChange(member || undefined);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-9 sm:h-8 px-2.5 bg-card border border-border hover:border-border-active rounded-lg text-xs text-zinc-200 transition-colors flex items-center justify-between gap-2 select-none outline-none focus:border-border-active"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedName ? (
            <>
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-300 border border-zinc-700 flex-shrink-0">
                {initial}
              </div>
              <span className="truncate text-zinc-100 font-medium">{selectedName}</span>
              {isSelectedDeleted && (
                <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">(deleted)</span>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-900 border border-dashed border-zinc-700 text-zinc-500 flex-shrink-0">
                <User className="w-2.5 h-2.5" />
              </div>
              <span className="text-zinc-500 truncate">
                {placeholder || t('unassigned')}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedName && (
            <span
              onClick={handleClear}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Clear assignee"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-zinc-300' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 w-full min-w-[200px] max-w-[calc(100vw-32px)] z-50 bg-[#14151c] border border-border rounded-xl shadow-dropdown p-1.5 space-y-0.5 animate-scaleIn max-h-60 overflow-y-auto custom-scrollbar"
        >
          {/* Unassigned Option */}
          <button
            type="button"
            role="option"
            aria-selected={!selectedName}
            onClick={() => handleSelect(undefined)}
            className={`w-full flex items-center justify-between px-2.5 py-2 sm:py-1.5 rounded-lg text-xs transition-colors select-none min-h-[36px] sm:min-h-0 ${
              !selectedName
                ? 'bg-zinc-800/60 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-900 border border-dashed border-zinc-700 text-zinc-500 flex-shrink-0">
                <User className="w-2.5 h-2.5" />
              </div>
              <span>{t('unassigned')}</span>
            </div>
            {!selectedName && <Check className="w-3.5 h-3.5 text-accent stroke-[2.5]" />}
          </button>

          {/* If current assignee was deleted from team, show it as an option so user sees who is assigned */}
          {selectedName && isSelectedDeleted && (
            <div className="my-1 px-2.5 py-2 sm:py-1.5 rounded-lg text-xs bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-between text-zinc-300 min-h-[36px] sm:min-h-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-400 border border-zinc-700 flex-shrink-0">
                  {initial}
                </div>
                <span className="truncate">{selectedName}</span>
                <span className="text-[10px] font-mono text-zinc-500">(deleted)</span>
              </div>
              <Check className="w-3.5 h-3.5 text-accent stroke-[2.5] flex-shrink-0" />
            </div>
          )}

          <div className="my-1 border-t border-border/50" />

          {/* Team Members List Header */}
          <div className="px-2 py-0.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>{t('team')}</span>
            <span>{teamMembers.length}</span>
          </div>

          {teamMembers.length === 0 ? (
            <div className="px-2 py-2 text-center text-xs text-zinc-500">
              {t('noMembersYet')}
            </div>
          ) : (
            teamMembers.map((member) => {
              const isSelected = selectedName?.toLowerCase() === member.name.toLowerCase();
              return (
                <button
                  key={member.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(member.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 sm:py-1.5 rounded-lg text-xs transition-colors select-none min-h-[36px] sm:min-h-0 ${
                    isSelected
                      ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                      : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-300 border border-zinc-700 flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{member.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent stroke-[2.5] flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

AssigneeSelect.displayName = 'AssigneeSelect';
