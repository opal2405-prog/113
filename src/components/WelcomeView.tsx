import React from 'react';
import { ArrowRight, BookOpen, Clock, Calendar, ShieldCheck, Award } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Hero Section — Minimal, calm, confident typography */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500 tracking-wider uppercase font-mono">
            {t.welcomeBadge}
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] text-balance">
            {t.welcomeHeroTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl pt-1">
            {t.welcomeHeroSubtitle}
          </p>
        </div>

        {/* Minimal scope note */}
        <div className="border-l-2 border-slate-300 pl-4 py-1 text-xs text-slate-500 leading-relaxed">
          {t.welcomeScopeNotice}
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onStart}
            className="px-6 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{t.startPlanningBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Block Templates — Clean, quiet cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-slate-800 uppercase font-mono">
            {lang === 'th' ? 'หรือเลือกจากตัวอย่างบล็อกวิชา' : 'Or Start with a Medical Preset'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {MEDICAL_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4.5 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                  {lang === 'th' ? preset.nameTh : preset.nameEn}
                </span>
                <span className="text-[11px] font-mono text-slate-400 shrink-0 tabular-nums">
                  {preset.days.length} วัน
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                {preset.topics.slice(0, 3).map((tp) => (
                  <span key={tp.id} className="text-slate-500">
                    · {tp.name}
                  </span>
                ))}
                {preset.topics.length > 3 && (
                  <span className="text-slate-400">+{preset.topics.length - 3}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Principles — Clean 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 text-xs">
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 block">
            01. คำนวณเวลาตามความยากจริง
          </span>
          <p className="text-slate-500 leading-relaxed">
            ประเมินชั่วโมงอ่านจากระดับความยาก ปริมาณเนื้อหา และพื้นฐานความเข้าใจ ไม่ใช่การกะเวลาแบบลอยๆ
          </p>
        </div>

        <div className="space-y-1">
          <span className="font-semibold text-slate-900 block">
            02. ตรวจสอบและเตือนล่วงหน้า
          </span>
          <p className="text-slate-500 leading-relaxed">
            หากวิชามากเกินเวลาที่มี ระบบจะขึ้นเตือนเวลาไม่พอทันที เพื่อให้ปรับแผนได้ทันก่อนวันสอบจริง
          </p>
        </div>

        <div className="space-y-1">
          <span className="font-semibold text-slate-900 block">
            03. เช็คลิสต์และปรับชดเชย
          </span>
          <p className="text-slate-500 leading-relaxed">
            ติดตามการอ่านแต่ละวัน หากวันไหนไม่ทันสามารถกดเลื่อนคาบที่เหลือไปจัดสรรใหม่ในวันถัดไปได้ทันที
          </p>
        </div>
      </div>
    </div>
  );
};
