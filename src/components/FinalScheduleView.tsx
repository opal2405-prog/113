import React, { useState } from 'react';
import {
  Play,
  Check,
  AlertTriangle,
  RotateCcw,
  Printer,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Activity,
  ArrowLeft,
  Terminal,
} from 'lucide-react';
import { ExamTarget, Language, ScheduleResult, ScheduleSession, Topic } from '../types/planner';
import { getT } from '../data/translations';

interface FinalScheduleViewProps {
  scheduleResult: ScheduleResult;
  topics: Topic[];
  target: ExamTarget;
  lang: Language;
  onStartFocus: (session: ScheduleSession) => void;
  onToggleSessionComplete: (sessionId: string, dayNumber: number) => void;
  completedSessionIds: Set<string>;
  onRollOverMissedSessions: () => void;
  onBackToTopics: () => void;
  onViewCCode: () => void;
  onPrint: () => void;
}

export const FinalScheduleView: React.FC<FinalScheduleViewProps> = ({
  scheduleResult,
  topics,
  target,
  lang,
  onStartFocus,
  onToggleSessionComplete,
  completedSessionIds,
  onRollOverMissedSessions,
  onBackToTopics,
  onViewCCode,
  onPrint,
}) => {
  const t = getT(lang);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const topicMap = new Map<string, Topic>();
  topics.forEach((t) => topicMap.set(t.id, t));

  // Compute completion metrics & discipline probability
  const totalSessions = scheduleResult.sessions.length;
  const completedCount = scheduleResult.sessions.filter((s) => completedSessionIds.has(s.id)).length;
  const totalMinutes = scheduleResult.sessions.reduce((acc, s) => acc + s.minutes, 0);
  const completedMinutes = scheduleResult.sessions
    .filter((s) => completedSessionIds.has(s.id))
    .reduce((acc, s) => acc + s.minutes, 0);

  const completionPercentage = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

  // Check how many incomplete sessions exist in past days (assuming days 1..today or current day)
  const incompleteSessions = scheduleResult.sessions.filter((s) => !completedSessionIds.has(s.id));
  const hasIncompleteSessions = incompleteSessions.length > 0;

  // Discipline & Success probability score calculation
  // Factors: completion rate + schedule feasibility
  let probabilityScore = 90;
  if (!scheduleResult.isFeasible) probabilityScore -= 30;
  if (totalSessions > 0) {
    const uncompletedRatio = (totalSessions - completedCount) / totalSessions;
    if (uncompletedRatio > 0.5 && completedCount > 0) {
      probabilityScore = Math.max(25, Math.round(completionPercentage * 0.9));
    }
  }

  // Days until exam calculation
  let daysUntilExam = target.totalDays;
  if (target.examDate) {
    const today = new Date();
    const examD = new Date(target.examDate);
    const diff = Math.ceil((examD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) daysUntilExam = diff;
  }

  const filteredDaySummaries = scheduleResult.daySummaries
    .filter((day) => (selectedDayFilter === 'all' ? true : day.dayNumber === selectedDayFilter))
    .map((day) => {
      const filteredSessions = day.sessions.filter((s) =>
        s.topicName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        ...day,
        sessions: filteredSessions,
      };
    })
    .filter((day) => day.sessions.length > 0 || (searchQuery === '' && day.availableMinutes > 0));

  return (
    <div className="space-y-6 py-4">
      {/* Top Header & Context Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase font-mono mb-1">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Step 4 / 4 · {target.examName || 'Final Schedule'}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.schedulePageTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.schedulePageSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBackToTopics}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToTopicsBtn}</span>
          </button>

          <button
            onClick={onViewCCode}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.cCodeTab}</span>
          </button>

          <button
            onClick={onPrint}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printBtn}</span>
          </button>
        </div>
      </div>

      {/* DISCIPLINE & REAL-WORLD SUCCESS PROBABILITY METER */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              {t.habitMeterTitle}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-500">
            <span>
              {t.completedSessionsCount
                .replace('{completed}', completedCount.toString())
                .replace('{total}', totalSessions.toString())}
            </span>
            <span>·</span>
            <span>
              {Math.round(completedMinutes / 60)}h / {Math.round(totalMinutes / 60)}h ({completionPercentage}%)
            </span>
          </div>
        </div>

        {/* Meter Gauge & Reality Check */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Column 1: Progress */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block">{t.actualProgress}:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {completionPercentage}%
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({completedMinutes} / {totalMinutes} min)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Column 2: Probability Score */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block">{t.probabilityLabel}:</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-extrabold font-mono tabular-nums ${
                  probabilityScore >= 75
                    ? 'text-emerald-600'
                    : probabilityScore >= 50
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {probabilityScore}%
              </span>
              {probabilityScore >= 75 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <span className="text-[11px] text-slate-600 font-medium block">
              {probabilityScore >= 75
                ? t.habitHighSuccess
                : probabilityScore >= 50
                ? t.habitModerate
                : 'ความเสี่ยงสูง (High Risk)'}
            </span>
          </div>

          {/* Column 3: Exam Deadline */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block">กำหนดการวันสอบ:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-indigo-700 font-mono tabular-nums">
                {daysUntilExam}
              </span>
              <span className="text-slate-600 font-medium">วันก่อนสอบ</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono block">
              {target.examDate ? `วันสอบ: ${target.examDate}` : `${target.totalDays} วันในแผน`}
            </span>
          </div>
        </div>

        {/* Habit Warning Alert (if user has high backlog or low pace) */}
        {completedCount > 0 && completionPercentage < 50 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              {t.habitCriticalWarning}
            </p>
          </div>
        )}
      </div>

      {/* ADAPTIVE ROLLOVER BUTTON (ปรับแก้ตารางในวันถัดไปเมื่อทำไม่ทัน) */}
      {hasIncompleteSessions && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono">
                {t.rollOverModalTitle}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {t.rollOverModalDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onRollOverMissedSessions}
            className="px-4 py-2 text-xs font-semibold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            {t.rollOverActionBtn}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Day Filter segmented buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {t.filterByDay}
          </button>
          {scheduleResult.daySummaries.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayFilter(day.dayNumber)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedDayFilter === day.dayNumber
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {t.day} {day.dayNumber}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTopic}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Daily Checklist Cards */}
      <div className="space-y-4">
        {filteredDaySummaries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
            {t.noSessions}
          </div>
        ) : (
          filteredDaySummaries.map((day) => {
            const usagePercent =
              day.availableMinutes > 0
                ? Math.min(100, Math.round((day.usedMinutes / day.availableMinutes) * 100))
                : 0;

            const dayAllCompleted =
              day.sessions.length > 0 &&
              day.sessions.every((s) => completedSessionIds.has(s.id));

            return (
              <div
                key={day.dayNumber}
                className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-colors print-break-inside-avoid ${
                  dayAllCompleted ? 'border-emerald-300 ring-1 ring-emerald-300/50' : 'border-slate-200'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
                    dayAllCompleted ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{t.day} {day.dayNumber}</span>
                      {dayAllCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                      )}
                    </span>
                    {day.dateString && (
                      <span className="text-xs text-slate-500 font-mono">
                        {day.dateString}
                      </span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      {day.usedMinutes} / {day.availableMinutes} {t.minutes} (
                      {(day.usedMinutes / 60).toFixed(1)}h)
                    </span>
                  </div>

                  {/* Day capacity */}
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>{usagePercent}% utilized</span>
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          dayAllCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Day Sessions List */}
                <div className="divide-y divide-slate-100">
                  {day.sessions.length === 0 ? (
                    <div className="p-5 text-xs text-slate-400 italic text-center">
                      ไม่มีคาบอ่านหนังสือในวันนี้
                    </div>
                  ) : (
                    day.sessions.map((session) => {
                      const isCompleted = completedSessionIds.has(session.id);
                      const topicObj = topicMap.get(session.topicId);
                      const topicColor = topicObj?.color || '#6366f1';

                      return (
                        <div
                          key={session.id}
                          className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                            isCompleted ? 'bg-slate-50/60 opacity-80' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <button
                              onClick={() => onToggleSessionComplete(session.id, day.dayNumber)}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 hover:border-indigo-500 bg-white'
                              }`}
                            >
                              {isCompleted && <Check className="w-3.5 h-3.5" />}
                            </button>

                            {/* Color Bar */}
                            <div
                              className="w-1.5 h-9 rounded-full shrink-0"
                              style={{ backgroundColor: topicColor }}
                            />

                            {/* Session Detail */}
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={`text-sm font-semibold truncate ${
                                    isCompleted
                                      ? 'line-through text-slate-500'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {session.topicName}
                                </h4>

                                {session.isRolledOver && (
                                  <span className="text-[10px] font-mono font-medium text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                    {t.rolledOverBadge}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-mono tabular-nums font-semibold text-slate-700">
                                  {session.minutes} {t.minutes}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {session.hours.toFixed(1)} {t.hours}
                                </span>
                                {topicObj?.summaryNotes && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-[11px] text-slate-400 italic truncate max-w-xs">
                                      {topicObj.summaryNotes}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Focus Timer CTA */}
                          <div className="flex items-center gap-2 shrink-0 no-print">
                            <button
                              onClick={() => onStartFocus(session)}
                              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                              <span>{t.startFocusBtn}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
