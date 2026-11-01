import React from 'react';
import { Plus, Minus, Calendar, Clock, RefreshCw, Sun, Moon } from 'lucide-react';
import { Language, StudyDay } from '../types/planner';
import { getT } from '../data/translations';

interface DaysManagerViewProps {
  days: StudyDay[];
  onChangeDays: (days: StudyDay[]) => void;
  startDate: string;
  onChangeStartDate: (date: string) => void;
  lang: Language;
}

export const DaysManagerView: React.FC<DaysManagerViewProps> = ({
  days,
  onChangeDays,
  startDate,
  onChangeStartDate,
  lang,
}) => {
  const t = getT(lang);

  const totalMinutes = days.reduce((sum, d) => sum + d.availableMinutes, 0);
  const totalHours = totalMinutes / 60.0;

  // Helper to format date for day index
  const formatDayDate = (dayIndex: number): string => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleUpdateMinutes = (dayIndex: number, minutes: number) => {
    const clamped = Math.max(0, Math.min(1440, minutes));
    const nextDays = days.map((d, i) => (i === dayIndex ? { ...d, availableMinutes: clamped } : d));
    onChangeDays(nextDays);
  };

  const handleSetAll = (minutes: number) => {
    const nextDays = days.map((d) => ({ ...d, availableMinutes: minutes }));
    onChangeDays(nextDays);
  };

  const handleOffsetAll = (deltaMinutes: number) => {
    const nextDays = days.map((d) => ({
      ...d,
      availableMinutes: Math.max(0, Math.min(1440, d.availableMinutes + deltaMinutes)),
    }));
    onChangeDays(nextDays);
  };

  const handleWeekdayWeekendPreset = () => {
    const nextDays = days.map((d, i) => {
      let isWeekend = false;
      if (startDate) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.getDay();
        isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      } else {
        // Fallback default: every 6th and 7th day
        isWeekend = (i % 7 === 5) || (i % 7 === 6);
      }
      return {
        ...d,
        availableMinutes: isWeekend ? 360 : 180, // 6h weekend, 3h weekday
      };
    });
    onChangeDays(nextDays);
  };

  const handleAddDay = () => {
    if (days.length >= 365) return;
    const newDayNumber = days.length + 1;
    const nextDays = [...days, { dayNumber: newDayNumber, availableMinutes: 240, usedMinutes: 0 }];
    onChangeDays(nextDays);
  };

  const handleRemoveDay = () => {
    if (days.length <= 1) return;
    const nextDays = days.slice(0, days.length - 1);
    onChangeDays(nextDays);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Day Count Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.navDays}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure study minutes for each day (1 to 1440 minutes / 24 hours max).
          </p>
        </div>

        {/* Days count buttons & start date */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md p-1 shadow-xs">
            <span className="text-xs text-slate-500 px-2 font-medium">Days:</span>
            <button
              onClick={handleRemoveDay}
              disabled={days.length <= 1}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 cursor-pointer"
              title="Remove day"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold px-1.5 text-slate-900 tabular-nums">
              {days.length}
            </span>
            <button
              onClick={handleAddDay}
              disabled={days.length >= 365}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 cursor-pointer"
              title="Add day"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="start-date-input" className="text-slate-500 hidden sm:inline">{t.startDate}:</label>
            <input
              id="start-date-input"
              type="date"
              value={startDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              className="font-mono text-slate-800 bg-transparent focus:outline-none cursor-pointer text-xs"
            />
          </div>
        </div>
      </div>

      {/* Batch Preset Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">{t.quickPresets}</span>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Total Available: <strong className="text-slate-900 font-bold">{totalMinutes} min</strong> ({totalHours.toFixed(1)}h)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSetAll(120)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            All 2 Hours (120m)
          </button>
          <button
            onClick={() => handleSetAll(180)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            All 3 Hours (180m)
          </button>
          <button
            onClick={() => handleSetAll(240)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            All 4 Hours (240m)
          </button>
          <button
            onClick={() => handleSetAll(360)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            All 6 Hours (360m)
          </button>
          <button
            onClick={handleWeekdayWeekendPreset}
            className="px-2.5 py-1 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors cursor-pointer border border-indigo-200"
          >
            {t.weekdaysWeekend}
          </button>
          <button
            onClick={() => handleOffsetAll(30)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            {t.addMinutesAll}
          </button>
          <button
            onClick={() => handleOffsetAll(-30)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            {t.subMinutesAll}
          </button>
        </div>
      </div>

      {/* Grid of Day Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day, index) => {
          const dateLabel = formatDayDate(index);
          const hours = (day.availableMinutes / 60.0).toFixed(1);

          return (
            <div
              key={day.dayNumber}
              className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">
                    {t.day} {day.dayNumber}
                  </span>
                  {dateLabel && (
                    <span className="text-xs text-slate-400 block font-mono">
                      {dateLabel}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={15}
                    value={day.availableMinutes}
                    onChange={(e) => handleUpdateMinutes(index, parseInt(e.target.value) || 0)}
                    className="w-16 text-right font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
                  />
                  <span className="text-xs text-slate-500">{t.minutes}</span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={720}
                  step={15}
                  value={day.availableMinutes}
                  onChange={(e) => handleUpdateMinutes(index, parseInt(e.target.value) || 0)}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>0h</span>
                  <span className="font-semibold text-slate-700 tabular-nums">{hours} hours</span>
                  <span>12h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
