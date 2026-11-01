import React from 'react';
import { Plus, Edit2, Trash2, Copy, HelpCircle, ArrowUpDown } from 'lucide-react';
import { Language, Topic } from '../types/planner';
import { getT } from '../data/translations';

interface TopicsViewProps {
  topics: Topic[];
  lang: Language;
  onOpenAddTopic: () => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
  onDuplicateTopic: (topic: Topic) => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({
  topics,
  lang,
  onOpenAddTopic,
  onEditTopic,
  onDeleteTopic,
  onDuplicateTopic,
}) => {
  const t = getT(lang);

  // Difficulty, Volume, Understanding labels mapping
  const diffLabels: Record<number, string> = {
    1: '1 (0.8x)',
    2: '2 (1.0x)',
    3: '3 (1.4x)',
    4: '4 (1.8x)',
  };

  const volLabels: Record<number, string> = {
    1: '1 (0.7x)',
    2: '2 (1.0x)',
    3: '3 (1.5x)',
    4: '4 (2.0x)',
  };

  const knowLabels: Record<number, string> = {
    1: '1 (1.7x)',
    2: '2 (1.4x)',
    3: '3 (1.0x)',
    4: '4 (0.7x)',
  };

  // Sort topics by priority descending (matching C `sort_topics()`)
  const sortedTopics = [...topics].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-6">
      {/* Top Header / Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.navTopics}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by Priority = (Importance × 0.35) + (Difficulty × 0.25) + ((5 - Understanding) × 0.25)
          </p>
        </div>

        <button
          onClick={onOpenAddTopic}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTopic}</span>
        </button>
      </div>

      {/* Topics Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">{t.topicName}</th>
                <th className="py-3 px-3 text-center" title="Difficulty rating (1-4)">
                  {t.difficultyShort}
                </th>
                <th className="py-3 px-3 text-center" title="Volume rating (1-4)">
                  {t.volumeShort}
                </th>
                <th className="py-3 px-3 text-center" title="Understanding rating (1-4)">
                  {t.understandingShort}
                </th>
                <th className="py-3 px-3 text-center" title="Importance rating (1-5)">
                  {t.importanceShort}
                </th>
                <th className="py-3 px-4 text-right">{t.estimatedTime}</th>
                <th className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>{t.priorityScore}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTopics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No topics added yet. Click &quot;Add New Topic&quot; or choose a preset.
                  </td>
                </tr>
              ) : (
                sortedTopics.map((topic, index) => (
                  <tr
                    key={topic.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: topic.color || '#6366f1' }}
                        />
                        <span className="font-semibold text-slate-900 text-sm">
                          {topic.name}
                        </span>
                        {topic.category && (
                          <span className="text-slate-400 font-normal">
                            ({topic.category})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-700">
                      {diffLabels[topic.difficulty] || topic.difficulty}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-700">
                      {volLabels[topic.volume] || topic.volume}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-700">
                      {knowLabels[topic.understanding] || topic.understanding}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold text-slate-800">
                      {topic.importance}/5
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {topic.estimatedHours.toFixed(2)}h
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-indigo-600">
                      {topic.priority.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTopic(topic)}
                          title="Edit"
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateTopic(topic)}
                          title="Duplicate"
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTopic(topic.id)}
                          title="Delete"
                          className="p-1 hover:bg-red-100 rounded text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
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

      {/* Formula & Factor Reference Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>{t.formulaExplanation}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 bg-white p-3.5 rounded border border-slate-200">
            <span className="font-semibold text-slate-900 block">1. Time Calculation Formula:</span>
            <code className="text-indigo-600 font-mono block">
              estimated_hours = base_time (2.0) × difficulty × volume × knowledge
            </code>
            <ul className="list-disc list-inside text-slate-500 space-y-0.5 mt-1">
              <li>Difficulty: 1 (0.8x) · 2 (1.0x) · 3 (1.4x) · 4 (1.8x)</li>
              <li>Volume: 1 (0.7x) · 2 (1.0x) · 3 (1.5x) · 4 (2.0x)</li>
              <li>Knowledge: 1 (1.7x) · 2 (1.4x) · 3 (1.0x) · 4 (0.7x)</li>
            </ul>
          </div>

          <div className="space-y-1.5 bg-white p-3.5 rounded border border-slate-200">
            <span className="font-semibold text-slate-900 block">2. Priority Score Formula:</span>
            <code className="text-indigo-600 font-mono block">
              priority = (importance × 0.35) + (difficulty × 0.25) + ((5 - understanding) × 0.25)
            </code>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Topics with high exam importance, high difficulty, and lower current understanding rank first so you master the hardest, most vital subjects early.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
