import React from 'react';
import { Plus, Globe, Printer, Activity, Share2 } from 'lucide-react';
import { Language, StepPage } from '../types/planner';
import { MEDICAL_PRESETS } from '../data/presets';
import { getT } from '../data/translations';

interface HeaderProps {
  currentStep: StepPage;
  onSelectStep: (step: StepPage) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenAddTopic: () => void;
  onSelectPreset: (presetId: string) => void;
  onPrint: () => void;
  onOpenShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onSelectStep,
  lang,
  setLang,
  onOpenAddTopic,
  onSelectPreset,
  onPrint,
  onOpenShare,
}) => {
  const t = getT(lang);

  const steps: { id: StepPage; label: string }[] = [
    { id: 'welcome', label: t.stepWelcome },
    { id: 'target', label: t.stepTarget },
    { id: 'topics', label: t.stepTopics },
    { id: 'schedule', label: t.stepSchedule },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div
            onClick={() => onSelectStep('welcome')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              Rx
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                {t.appTitle}
              </span>
              <span className="text-[10px] text-indigo-700 font-medium tracking-tight truncate max-w-[220px]">
                {t.facultyTitle}
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links / Steps */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-600">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => onSelectStep(step.id)}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer font-medium ${
                    isActive
                      ? 'text-slate-900 border-b-2 border-indigo-600 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Medical Presets, Language, Add Topic) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Medical Presets dropdown */}
            <div className="relative hidden sm:block">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onSelectPreset(e.target.value);
                  }
                }}
                defaultValue=""
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-md border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-nowrap"
              >
                <option value="" disabled>
                  {lang === 'th' ? 'เลือกบล็อกวิชาแพทย์' : 'Medical Block Presets'}
                </option>
                {MEDICAL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {lang === 'th' ? p.nameTh : p.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Print button (enabled on schedule) */}
            {currentStep === 'schedule' && (
              <button
                onClick={onPrint}
                title={t.printBtn}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {/* Share Website button */}
            <button
              onClick={onOpenShare}
              title={lang === 'th' ? 'แชร์เว็บให้เพื่อนเล่น' : 'Share Website'}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{lang === 'th' ? 'แชร์เว็บ' : 'Share'}</span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
              className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              title="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'en' ? 'ไทย' : 'EN'}</span>
            </button>

            {/* Add Topic button */}
            {(currentStep === 'topics' || currentStep === 'schedule') && (
              <button
                onClick={onOpenAddTopic}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addTopicBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile step switcher strip */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-100 text-xs overflow-x-auto gap-4">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`whitespace-nowrap pb-1 ${
                currentStep === step.id
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-500'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
