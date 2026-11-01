import React from 'react';
import { ArrowRight, BookOpen, Clock, Calendar, ShieldCheck, Activity, Award } from 'lucide-react';
import { Language } from '../types/planner';
import { getT } from '../data/translations';
import { MEDICAL_PRESETS } from '../data/presets';

interface WelcomeViewProps {
  lang: Language;
  onStart: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  lang,
  onStart,
  onSelectPreset,
}) => {
  const t = getT(lang);

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs">
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wider uppercase font-mono">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>{t.welcomeBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance leading-tight">
            {t.welcomeHeroTitle}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            {t.welcomeHeroSubtitle}
          </p>

          {/* Scope notice: Not a tutoring site, purely scheduling & time allocation */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>{t.welcomeScopeNotice}</strong>
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStart}
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>{t.startPlanningBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Medical Preset Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {lang === 'th' ? 'เทมเพลตบล็อกวิชาแพทย์เริ่มต้น' : 'Pre-configured Medical Block Templates'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? 'เลือกเทมเพลตที่ตรงกับวิชาสอบของคุณ เพื่อโหลดตารางและหัวข้อหลักได้ทันที'
                : 'Select a curriculum preset aligned with your upcoming medical examination.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEDICAL_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className="bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-5 transition-all cursor-pointer shadow-xs hover:shadow-sm space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Award className="w-4 h-4" />
                  <span className="group-hover:text-indigo-700 transition-colors">
                    {lang === 'th' ? preset.nameTh : preset.nameEn}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
                  {preset.days.length} {t.totalDaysLabel.replace(/[()]/g, '')}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-medium text-slate-700">
                  {preset.target.examName}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {preset.topics.slice(0, 4).map((tp) => (
                    <span key={tp.id} className="text-slate-600">
                      • {tp.name}
                    </span>
                  ))}
                  {preset.topics.length > 4 && (
                    <span className="text-slate-400 font-mono">
                      +{preset.topics.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">
                <span>{lang === 'th' ? 'เลือกเทมเพลตนี้' : 'Load This Preset'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>คำนวณเวลาตามความยากจริง</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            ใช้อัลกอริทึมคูณถ่วงน้ำหนัก (Difficulty × Volume × Baseline Understanding) เพื่อประเมินชั่วโมงอ่านจริง ไม่ใช่การกะเวลาแบบลอยๆ
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>เตือนล่วงหน้าเมื่อเวลาไม่พอ</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            ระบบตรวจสอบความสัมพันธ์ระหว่างจำนวนหัวข้อและเวลาว่างทันที หากเวลาไม่พอ จะแจ้งเตือนทันทีเพื่อให้คุณตัดสินใจปรับแผนก่อนสาย
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>ปรับตารางชดเชยเมื่ออ่านไม่ทัน</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            หากวันไหนอ่านไม่ครบตามเป้า สามารถกดเลื่อนคาบที่เหลือไปจัดสรรใหม่ในวันถัดไปอัตโนมัติ พร้อมประเมินโอกาสสำเร็จตามวินัยจริง
          </p>
        </div>
      </div>
    </div>
  );
};
