import React from 'react';
import { Award, CheckCircle2, X, Calendar, Sparkles } from 'lucide-react';
import { Language } from '../types/planner';
import { getT } from '../data/translations';

interface DaySuccessModalProps {
  dayNumber: number;
  isOpen: boolean;
  onClose: () => void;
  daysUntilExam?: number;
  lang: Language;
}

export const DaySuccessModal: React.FC<DaySuccessModalProps> = ({
  dayNumber,
  isOpen,
  onClose,
  daysUntilExam,
  lang,
}) => {
  const t = getT(lang);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-200 max-w-sm w-full overflow-hidden text-center p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Celebration Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
          <Award className="w-8 h-8 animate-bounce" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block font-mono">
            {t.day} {dayNumber} COMPLETED
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
            {t.daySuccessTitle}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t.daySuccessSubtitle}
          </p>
        </div>

        {/* Days until exam info */}
        {daysUntilExam !== undefined && daysUntilExam > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-center gap-2 font-mono">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>{t.daysUntilExam.replace('{days}', daysUntilExam.toString())}</span>
          </div>
        )}

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          {t.closeBtn}
        </button>
      </div>
    </div>
  );
};
