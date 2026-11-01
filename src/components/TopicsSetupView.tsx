import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  Copy,
  Clock,
  BookOpen,
  Info,
  Wand2,
} from 'lucide-react';
import { Language, StudyDay, Topic } from '../types/planner';
import { checkFeasibility } from '../utils/algorithm';
import { getT } from '../data/translations';

interface TopicsSetupViewProps {
  topics: Topic[];
  days: StudyDay[];
  lang: Language;
  onOpenAddTopic: () => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
  onDuplicateTopic: (topic: Topic) => void;
  onAutoBalance: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const TopicsSetupView: React.FC<TopicsSetupViewProps> = ({
  topics,
  days,
  lang,
  onOpenAddTopic,
  onEditTopic,
  onDeleteTopic,
  onDuplicateTopic,
  onAutoBalance,
  onNext,
  onBack,
}) => {
  const t = getT(lang);

  const { requiredHours, availableHours, isFeasible, deltaHours } = checkFeasibility(topics, days);
  const deficit = Math.abs(deltaHours);

  // Sort descending by priority (matching C sort_topics)
  const sortedTopics = [...topics].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-6 py-6">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            03 · รายวิชาและเวลา
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.topicsPageTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {t.topicsPageSubtitle}
          </p>
        </div>

        <button
          onClick={onOpenAddTopic}
          className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTopicBtn}</span>
        </button>
      </div>

      {/* FEASIBILITY WARNING BANNER — Minimal, clean, high-contrast */}
      {topics.length > 0 && !isFeasible && (
        <div className="bg-white border border-amber-300 rounded-xl p-5 text-slate-900 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  {t.notEnoughTimeAlertTitle}
                </span>
                <span className="text-[11px] font-mono text-amber-700 font-semibold">
                  (เวลาขาดอีก {deficit.toFixed(1)} ชม.)
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                คุณมีเวลาอ่าน {availableHours.toFixed(1)} ชม. แต่ต้องใช้ {requiredHours.toFixed(1)} ชม. เพื่อให้อ่านทันก่อนวันสอบ คุณสามารถปรับเวลาอัตโนมัติ หรือปรับลดเนื้อหาของแต่ละวิชา
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onAutoBalance}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>ปรับเวลาในแต่ละวันเพิ่มอัตโนมัติ (+{deficit.toFixed(1)}h)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {topics.length > 0 && isFeasible && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 text-xs flex items-center justify-between gap-3 text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              เวลาเพียงพอ: มีเวลาอ่าน {availableHours.toFixed(1)} ชม. ครอบคลุมเนื้อหาทั้งหมด {requiredHours.toFixed(1)} ชม. (เหลือสำรอง {deltaHours.toFixed(1)} ชม.)
            </span>
          </div>
          <span className="font-mono text-emerald-700 text-[11px] font-medium">
            ENOUGH TIME
          </span>
        </div>
      )}

      {/* Topics Table List */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4 w-12 text-center font-mono font-normal">#</th>
                <th className="py-3 px-4 font-normal">วิชา / หัวข้อ</th>
                <th className="py-3 px-3 text-center font-normal" title="Difficulty rating (1-4)">
                  {t.difficultyShort}
                </th>
                <th className="py-3 px-3 text-center font-normal" title="Volume rating (1-4)">
                  {t.volumeShort}
                </th>
                <th className="py-3 px-3 text-center font-normal" title="Understanding rating (1-4)">
                  {t.understandingShort}
                </th>
                <th className="py-3 px-3 text-center font-normal" title="Importance rating (1-5)">
                  {t.importanceShort}
                </th>
                <th className="py-3 px-4 text-right font-normal">{t.estimatedTime}</th>
                <th className="py-3 px-4 text-right font-normal">{t.priorityScore}</th>
                <th className="py-3 px-4 text-right w-24 font-normal">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTopics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 space-y-2">
                    <p className="text-xs">ยังไม่มีวิชาในตารางติวของคุณ</p>
                    <button
                      onClick={onOpenAddTopic}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addTopicBtn}</span>
                    </button>
                  </td>
                </tr>
              ) : (
                sortedTopics.map((topic, index) => (
                  <tr key={topic.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: topic.color || '#0f172a' }}
                          />
                          <span className="font-medium text-slate-900 text-xs">
                            {topic.name}
                          </span>
                          {topic.category && (
                            <span className="text-slate-400 font-mono text-[11px]">
                              ({topic.category})
                            </span>
                          )}
                        </div>
                        {topic.summaryNotes && (
                          <p className="text-[11px] text-slate-400 pl-4 italic truncate max-w-md">
                            {topic.summaryNotes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600">
                      {topic.difficulty}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600">
                      {topic.volume}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600">
                      {topic.understanding}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-medium text-slate-800">
                      {topic.importance}/5
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {topic.estimatedHours.toFixed(2)}h
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {topic.priority.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTopic(topic)}
                          title="แก้ไข"
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateTopic(topic)}
                          title="ทำสำเนา"
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTopic(topic.id)}
                          title="ลบ"
                          className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.backToTargetBtn}</span>
        </button>

        <button
          onClick={onNext}
          disabled={topics.length === 0}
          className="px-5 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span>{t.generateScheduleBtn}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
