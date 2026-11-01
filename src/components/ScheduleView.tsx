import React, { useState } from 'react';
import { Play, Check, AlertCircle, Calendar, Clock, Search, ChevronRight } from 'lucide-react';
import { Language, ScheduleResult, ScheduleSession, Topic } from '../types/planner';
import { getT } from '../data/translations';

interface ScheduleViewProps {
  scheduleResult: ScheduleResult;
  topics: Topic[];
  lang: Language;
  onStartFocus: (session: ScheduleSession) => void;
  onToggleSessionComplete: (sessionId: string) => void;
  completedSessionIds: Set<string>;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  scheduleResult,
  topics,
  lang,
  onStartFocus,
  onToggleSessionComplete,
  completedSessionIds,
}) => {
  const t = getT(lang);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const topicColorMap = new Map<string, string>();
  topics.forEach((t) => topicColorMap.set(t.id, t.color || '#6366f1'));

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
    <div className="space-y-6">
      {/* Warning banner if not enough time for certain topics (directly matching C WARNING) */}
      {scheduleResult.unallocatedTopics.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <p className="text-sm font-semibold">{t.unallocatedWarning}</p>
              <div className="space-y-1 text-xs">
                {scheduleResult.unallocatedTopics.map(({ topic, remainingHours, percentCovered }) => (
                  <div key={topic.id} className="flex items-center justify-between font-mono py-0.5">
                    <span className="font-medium text-amber-950">{topic.name}</span>
                    <span className="text-amber-800 tabular-nums">
                      {remainingHours.toFixed(1)}h remaining ({percentCovered}% scheduled)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Day Filter interactive segmented tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
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
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {t.day} {day.dayNumber}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTopic}
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Day by Day Cards List */}
      {filteredDaySummaries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-sm">
          {t.noSessions}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDaySummaries.map((day) => {
            const usagePercent =
              day.availableMinutes > 0
                ? Math.min(100, Math.round((day.usedMinutes / day.availableMinutes) * 100))
                : 0;

            return (
              <div
                key={day.dayNumber}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs"
              >
                {/* Day Header */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      {t.day} {day.dayNumber}
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

                  {/* Day capacity progress bar */}
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>{usagePercent}% used</span>
                    <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          usagePercent >= 100 ? 'bg-indigo-600' : 'bg-slate-600'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Day Sessions List */}
                {day.sessions.length === 0 ? (
                  <div className="p-6 text-xs text-slate-400 italic text-center">
                    No study sessions scheduled for this day
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {day.sessions.map((session) => {
                      const isCompleted = completedSessionIds.has(session.id);
                      const topicColor = topicColorMap.get(session.topicId) || '#6366f1';

                      return (
                        <div
                          key={session.id}
                          className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                            isCompleted ? 'bg-slate-50/60 opacity-75' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <button
                              onClick={() => onToggleSessionComplete(session.id)}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 hover:border-indigo-500 bg-white'
                              }`}
                            >
                              {isCompleted && <Check className="w-3.5 h-3.5" />}
                            </button>

                            {/* Color bar */}
                            <div
                              className="w-1.5 h-8 rounded-full shrink-0"
                              style={{ backgroundColor: topicColor }}
                            />

                            {/* Topic Details */}
                            <div className="min-w-0">
                              <h4
                                className={`text-sm font-semibold truncate ${
                                  isCompleted
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-900'
                                }`}
                              >
                                {session.topicName}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="font-mono tabular-nums font-medium text-slate-700">
                                  {session.minutes} {t.minutes}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {session.hours.toFixed(1)} {t.hours}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button: Start Focus Timer */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => onStartFocus(session)}
                              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                              <span>{t.startTimer}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
