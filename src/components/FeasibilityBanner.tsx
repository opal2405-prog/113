import React from 'react';
import { CheckCircle2, AlertTriangle, Wand2, Clock, BookOpen, Calendar } from 'lucide-react';
import { Language } from '../types/planner';
import { getT } from '../data/translations';

interface FeasibilityBannerProps {
  requiredHours: number;
  availableHours: number;
  isFeasible: boolean;
  topicCount: number;
  totalDays: number;
  sessionCount: number;
  lang: Language;
  onAutoBalance: () => void;
}

export const FeasibilityBanner: React.FC<FeasibilityBannerProps> = ({
  requiredHours,
  availableHours,
  isFeasible,
  topicCount,
  totalDays,
  sessionCount,
  lang,
  onAutoBalance,
}) => {
  const t = getT(lang);
  const delta = Math.abs(availableHours - requiredHours);
  const percentage =
    availableHours > 0 ? Math.min(100, Math.round((availableHours / Math.max(requiredHours, 0.1)) * 100)) : 0;

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Status & Feasibility summary */}
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${
                isFeasible
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isFeasible ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-sm font-bold uppercase tracking-wider ${
                    isFeasible ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isFeasible ? t.enoughTime : t.notEnoughTime}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {isFeasible
                    ? `+${delta.toFixed(2)}h ${t.surplus}`
                    : `-${delta.toFixed(2)}h ${t.deficit}`}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-mono tabular-nums">
                <span>
                  {t.requiredHours}:{' '}
                  <strong className="text-slate-900 font-semibold">{requiredHours.toFixed(1)}h</strong>
                </span>
                <span className="text-slate-300">/</span>
                <span>
                  {t.availableHours}:{' '}
                  <strong className="text-slate-900 font-semibold">{availableHours.toFixed(1)}h</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Auto balance */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-6 text-xs text-slate-600 font-mono tabular-nums">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>
                  <strong className="text-slate-900 font-semibold">{topicCount}</strong> {t.totalTopics}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  <strong className="text-slate-900 font-semibold">{totalDays}</strong> {t.totalDays}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  <strong className="text-slate-900 font-semibold">{sessionCount}</strong> {t.totalSessions}
                </span>
              </div>
            </div>

            {!isFeasible && (
              <button
                onClick={onAutoBalance}
                title={t.autoBalanceTooltip}
                className="px-3.5 py-2 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.autoBalance}</span>
              </button>
            )}
          </div>
        </div>

        {/* Linear progress comparison strip */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
            <span>Schedule Coverage Ratio</span>
            <span className="tabular-nums font-semibold text-slate-700">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFeasible ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
