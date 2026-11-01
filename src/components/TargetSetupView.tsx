import React from 'react';
import { Calendar, Clock, ArrowRight, ArrowLeft, Target, Shield, BookOpen } from 'lucide-react';
import { ExamTarget, Language } from '../types/planner';
import { getT } from '../data/translations';

interface TargetSetupViewProps {
  target: ExamTarget;
  onChangeTarget: (target: ExamTarget) => void;
  topicCount: number;
  lang: Language;
  onNext: () => void;
  onBack: () => void;
}

export const TargetSetupView: React.FC<TargetSetupViewProps> = ({
  target,
  onChangeTarget,
  topicCount,
  lang,
  onNext,
  onBack,
}) => {
  const t = getT(lang);

  // Compute days difference if dates are set
  const handleDateChange = (field: 'startDate' | 'examDate', val: string) => {
    const updated = { ...target, [field]: val };
    if (updated.startDate && updated.examDate) {
      const start = new Date(updated.startDate);
      const end = new Date(updated.examDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        updated.totalDays = Math.min(365, diffDays);
      }
    }
    onChangeTarget(updated);
  };

  const totalCalculatedHours = target.totalDays * target.defaultDailyHours;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase font-mono mb-1">
          <Target className="w-4 h-4 text-indigo-600" />
          <span>Step 2 / 4</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.targetPageTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t.targetPageSubtitle}
        </p>
      </div>

      {/* Target Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Department Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 font-medium">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>หลักสูตร: <strong className="text-slate-900">{target.studentDepartment}</strong></span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">Academic Planner</span>
        </div>

        {/* Exam Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800 block">
            {t.examNameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={target.examName}
            onChange={(e) => onChangeTarget({ ...target, examName: e.target.value })}
            placeholder={t.examNamePlaceholder}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.startDateLabel}</span>
            </label>
            <input
              type="date"
              value={target.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.examDateLabel}</span>
            </label>
            <input
              type="date"
              value={target.examDate}
              onChange={(e) => handleDateChange('examDate', e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Days & Daily Hours Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-800">
                {t.totalDaysLabel}
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600 tabular-nums">
                {target.totalDays} วัน
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={365}
              value={target.totalDays}
              onChange={(e) => {
                const val = Math.max(1, Math.min(365, parseInt(e.target.value) || 1));
                onChangeTarget({ ...target, totalDays: val });
              }}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-800">
                {t.dailyHoursLabel}
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600 tabular-nums">
                {target.defaultDailyHours.toFixed(1)} ชม. ({Math.round(target.defaultDailyHours * 60)} นาที)
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={12.0}
              step={0.5}
              value={target.defaultDailyHours}
              onChange={(e) => {
                onChangeTarget({
                  ...target,
                  defaultDailyHours: parseFloat(e.target.value) || 4.0,
                });
              }}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none mt-2"
            />
          </div>
        </div>

        {/* Time Budget Summary Card */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-semibold text-indigo-950 block">งบเวลาอ่านหนังสือทั้งหมดที่ตั้งไว้:</span>
              <span className="text-indigo-800 font-mono tabular-nums">
                {target.totalDays} วัน × {target.defaultDailyHours.toFixed(1)} ชม. ={' '}
                <strong className="text-indigo-950 font-bold text-sm">
                  {totalCalculatedHours.toFixed(1)} ชั่วโมง
                </strong>{' '}
                ({Math.round(totalCalculatedHours * 60)} นาที)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-indigo-900 font-mono text-[11px] bg-white px-3 py-1.5 rounded border border-indigo-200">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>มีหัวข้ออยู่ในแผน: <strong>{topicCount} วิชา</strong></span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToWelcomeBtn}</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span>{t.nextToTopicsBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
