import React from 'react';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
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

  const totalCalculatedHours = (target.totalDays || 0) * (target.defaultDailyHours || 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      {/* Minimal Header */}
      <div className="space-y-1">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          02 · เป้าหมายและเวลา
        </span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.targetPageTitle}
        </h2>
        <p className="text-xs text-slate-500">
          กรอกข้อมูลการสอบและวันอ่านหนังสือ เพื่อคำนวณงบเวลาทั้งหมด
        </p>
      </div>

      {/* Clean Form Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Exam Name Input (starts blank, placeholder: เช่น ...) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 block">
            {t.examNameLabel}
          </label>
          <input
            type="text"
            value={target.examName}
            onChange={(e) => onChangeTarget({ ...target, examName: e.target.value })}
            placeholder="เช่น สอบ ศรว. ขั้นที่ 1 (NL1)..."
            className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-normal"
          />
        </div>

        {/* Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.startDateLabel}</span>
            </label>
            <input
              type="date"
              value={target.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.examDateLabel}</span>
            </label>
            <input
              type="date"
              value={target.examDate}
              onChange={(e) => handleDateChange('examDate', e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white cursor-pointer"
            />
          </div>
        </div>

        {/* Days & Daily Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-700">
                {t.totalDaysLabel}
              </label>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {target.totalDays} วัน
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={365}
              value={target.totalDays || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onChangeTarget({ ...target, totalDays: val });
              }}
              placeholder="เช่น 7"
              className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-700">
                {t.dailyHoursLabel}
              </label>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {target.defaultDailyHours.toFixed(1)} ชม./วัน
              </span>
            </div>
            <input
              type="number"
              min={0.5}
              max={16}
              step={0.5}
              value={target.defaultDailyHours || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onChangeTarget({ ...target, defaultDailyHours: val });
              }}
              placeholder="เช่น 3"
              className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Quiet Time Summary */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              เวลารวม: {target.totalDays} วัน × {target.defaultDailyHours} ชม. ={' '}
              <strong className="text-slate-900 font-mono font-semibold">
                {totalCalculatedHours.toFixed(1)} ชั่วโมง
              </strong>
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            {topicCount} วิชาในแผน
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.backToWelcomeBtn}</span>
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span>{t.nextToTopicsBtn}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
