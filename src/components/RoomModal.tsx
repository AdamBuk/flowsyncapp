import React, { useState } from 'react';
import { X, Users, ArrowRight } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  currentRoom: string;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  currentRoom,
  onClose,
  onSelectRoom,
}) => {
  const [inputRoom, setInputRoom] = useState('');

  if (!isOpen) return null;

  const popularRooms = ['general', 'engineering', 'sprint-roadmap', 'design-system'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputRoom.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    if (clean) {
      onSelectRoom(clean);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border w-full max-w-md rounded-xl p-5 shadow-dropdown space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-zinc-100 font-medium text-sm">
            <Users className="w-4 h-4 text-accent" />
            <span>Shared Real-Time Rooms</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Switch to an existing collaborative room or enter a new room name. Anyone with the URL will sync changes in real-time.
        </p>

        {/* Custom room input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputRoom}
            onChange={(e) => setInputRoom(e.target.value)}
            placeholder="e.g. q4-objectives"
            className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-border-active"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover flex items-center gap-1"
          >
            <span>Join</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </form>

        {/* Quick Suggestions */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
            Suggested Rooms
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularRooms.map((room) => (
              <button
                key={room}
                type="button"
                onClick={() => {
                  onSelectRoom(room);
                  onClose();
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                  currentRoom === room
                    ? 'bg-accent/20 border-accent/40 text-accent font-medium'
                    : 'bg-card border-border text-zinc-400 hover:text-zinc-200 hover:border-border-active'
                }`}
              >
                #{room}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
