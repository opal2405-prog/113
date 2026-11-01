import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Language, ScheduleSession } from '../types/planner';
import { playChime } from '../utils/sound';
import { getT } from '../data/translations';

interface FocusTimerModalProps {
  session: ScheduleSession | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteSession: (sessionId: string) => void;
  lang: Language;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  session,
  isOpen,
  onClose,
  onCompleteSession,
  lang,
}) => {
  const t = getT(lang);

  const initialSeconds = session ? session.minutes * 60 : 25 * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (session) {
      const secs = session.minutes * 60;
      setTimeLeft(secs);
      setIsRunning(false);
      setIsDone(false);
      setNotes('');
    }
  }, [session, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsDone(true);
            if (soundEnabled) playChime('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  if (!isOpen || !session) return null;

  const totalSeconds = session.minutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formattedTime =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleTogglePlay = () => {
    if (!isRunning && soundEnabled) {
      playChime('start');
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(session.minutes * 60);
    setIsDone(false);
  };

  const handleComplete = () => {
    onCompleteSession(session.id);
    if (soundEnabled) playChime('complete');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {t.day} {session.dayNumber} · Focus Session
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute chimes' : 'Unmute chimes'}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          {/* Topic Title */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {session.topicName}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Target: {session.minutes} minutes ({session.hours.toFixed(1)}h)
            </p>
          </div>

          {/* Big Digital Timer Display */}
          <div className="py-6 px-4 bg-slate-900 text-white rounded-xl shadow-inner relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
            <div className="font-mono text-5xl font-extrabold tracking-wider tabular-nums">
              {formattedTime}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              {isDone ? t.sessionCompleted : isRunning ? 'Study interval in progress...' : 'Paused'}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
              title={t.reset}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className={`px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              <span className="text-sm">{isRunning ? t.pause : t.start}</span>
            </button>

            <button
              onClick={handleComplete}
              className="p-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full transition-colors cursor-pointer"
              title={t.completeSession}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          {/* Session Notes */}
          <div className="text-left space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">
              Quick Notes / Key Takeaways:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.sessionNotesPlaceholder}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Mark Complete CTA */}
          <button
            onClick={handleComplete}
            className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.completeSession}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
