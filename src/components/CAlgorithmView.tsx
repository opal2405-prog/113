import React, { useState } from 'react';
import { Copy, Download, Terminal, Code2, Sliders, Check, RotateCcw } from 'lucide-react';
import { AlgorithmConfig, Language, StudyDay, Topic } from '../types/planner';
import { generateCliTerminalOutput, generateCSourceCode, DEFAULT_ALGORITHM_CONFIG } from '../utils/algorithm';
import { getT } from '../data/translations';

interface CAlgorithmViewProps {
  topics: Topic[];
  days: StudyDay[];
  config: AlgorithmConfig;
  onChangeConfig: (config: AlgorithmConfig) => void;
  lang: Language;
}

export const CAlgorithmView: React.FC<CAlgorithmViewProps> = ({
  topics,
  days,
  config,
  onChangeConfig,
  lang,
}) => {
  const t = getT(lang);
  const [activeTab, setActiveTab] = useState<'terminal' | 'source' | 'parameters'>('terminal');
  const [copied, setCopied] = useState(false);

  const cCode = generateCSourceCode(topics, days, config);
  const cliOutput = generateCliTerminalOutput(topics, days, config);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadCFile = () => {
    const blob = new Blob([cCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart_study_planner.c';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetConfig = () => {
    onChangeConfig(DEFAULT_ALGORITHM_CONFIG);
  };

  return (
    <div className="space-y-6">
      {/* Header and action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.cCodeTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.cCodeSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : t.copyCCode}</span>
          </button>
          <button
            onClick={handleDownloadCFile}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadCCode}</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'terminal'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{t.terminalOutput}</span>
        </button>
        <button
          onClick={() => setActiveTab('source')}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'source'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>C Source Code (main.c)</span>
        </button>
        <button
          onClick={() => setActiveTab('parameters')}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'parameters'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Algorithm Tuning</span>
        </button>
      </div>

      {/* Tab 1: Terminal Simulation */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 p-5 overflow-x-auto shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
              <span className="ml-2 font-mono">study_planner_cli — gcc 13.2.0</span>
            </div>
            <span>./smart_planner</span>
          </div>
          <pre className="whitespace-pre font-mono leading-relaxed select-text">
            {cliOutput}
          </pre>
        </div>
      )}

      {/* Tab 2: C Source Code */}
      {activeTab === 'source' && (
        <div className="bg-slate-900 text-slate-100 font-mono text-xs rounded-lg border border-slate-800 p-5 overflow-x-auto shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
            <span>smart_study_planner.c — Ready to compile</span>
            <span>ANSI C / C99</span>
          </div>
          <pre className="whitespace-pre font-mono leading-relaxed select-text text-slate-200">
            {cCode}
          </pre>
        </div>
      )}

      {/* Tab 3: Interactive Parameter Tuning */}
      {activeTab === 'parameters' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Algorithm Tuning Parameters
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust base study hours or weight multipliers to observe how topic priorities rebalance.
              </p>
            </div>
            <button
              onClick={handleResetConfig}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Base Time */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800">
                  Base Time (base_time in C)
                </label>
                <span className="font-mono font-bold text-indigo-600 tabular-nums">
                  {config.baseTime.toFixed(1)} hours
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.5}
                value={config.baseTime}
                onChange={(e) =>
                  onChangeConfig({ ...config, baseTime: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-slate-400 text-[11px]">
                Default is 2.0 hours. Multiplied by difficulty, volume, and knowledge factors.
              </p>
            </div>

            {/* Importance Weight */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800">
                  Importance Weight (C code: 0.35)
                </label>
                <span className="font-mono font-bold text-indigo-600 tabular-nums">
                  {config.importanceWeight.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.6}
                step={0.05}
                value={config.importanceWeight}
                onChange={(e) =>
                  onChangeConfig({ ...config, importanceWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-slate-400 text-[11px]">
                Weight given to how critical the topic is for the exam grade.
              </p>
            </div>

            {/* Difficulty Priority Weight */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800">
                  Difficulty Weight (C code: 0.25)
                </label>
                <span className="font-mono font-bold text-indigo-600 tabular-nums">
                  {config.difficultyWeight.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.5}
                step={0.05}
                value={config.difficultyWeight}
                onChange={(e) =>
                  onChangeConfig({ ...config, difficultyWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-slate-400 text-[11px]">
                Higher weight pushes hard topics earlier into the schedule.
              </p>
            </div>

            {/* Understanding Priority Weight */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800">
                  Knowledge Deficit Weight (C code: 0.25)
                </label>
                <span className="font-mono font-bold text-indigo-600 tabular-nums">
                  {config.understandingWeight.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.5}
                step={0.05}
                value={config.understandingWeight}
                onChange={(e) =>
                  onChangeConfig({ ...config, understandingWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-slate-400 text-[11px]">
                Weight applied to (5 - understanding); gives top priority to unfamiliar topics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
