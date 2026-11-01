import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calculator } from 'lucide-react';
import {
  DifficultyRating,
  ImportanceRating,
  Language,
  Topic,
  UnderstandingRating,
  VolumeRating,
} from '../types/planner';
import { calculateTopicPriority, calculateTopicTime, DEFAULT_ALGORITHM_CONFIG } from '../utils/algorithm';
import { getT } from '../data/translations';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topicData: Omit<Topic, 'id' | 'estimatedHours' | 'remainingHours' | 'priority'>, topicId?: string) => void;
  editingTopic: Topic | null;
  lang: Language;
}

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
];

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTopic,
  lang,
}) => {
  const t = getT(lang);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyRating>(2);
  const [volume, setVolume] = useState<VolumeRating>(2);
  const [understanding, setUnderstanding] = useState<UnderstandingRating>(2);
  const [importance, setImportance] = useState<ImportanceRating>(4);
  const [color, setColor] = useState(COLOR_PALETTE[0]);

  useEffect(() => {
    if (editingTopic) {
      setName(editingTopic.name);
      setCategory(editingTopic.category || '');
      setSummaryNotes(editingTopic.summaryNotes || '');
      setDifficulty(editingTopic.difficulty);
      setVolume(editingTopic.volume);
      setUnderstanding(editingTopic.understanding);
      setImportance(editingTopic.importance);
      setColor(editingTopic.color || COLOR_PALETTE[0]);
    } else {
      setName('');
      setCategory('');
      setSummaryNotes('');
      setDifficulty(2);
      setVolume(2);
      setUnderstanding(2);
      setImportance(4);
      setColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
    }
  }, [editingTopic, isOpen]);

  if (!isOpen) return null;

  // Live preview calculations
  const previewTime = calculateTopicTime({ difficulty, volume, understanding }, DEFAULT_ALGORITHM_CONFIG);
  const previewPriority = calculateTopicPriority({ difficulty, understanding, importance }, DEFAULT_ALGORITHM_CONFIG);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        category: category.trim() || undefined,
        summaryNotes: summaryNotes.trim() || undefined,
        difficulty,
        volume,
        understanding,
        importance,
        color,
      },
      editingTopic?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            {editingTopic ? t.editTopic : t.addTopic}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Topic Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              {t.topicName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.topicNamePlaceholder}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
            />
          </div>

          {/* Category & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Category (Optional)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Finals, Math"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Color Tag</label>
              <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'ring-2 ring-offset-1 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Topic Scope Summary Notes (Optional) */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              {t.topicSummaryLabel}
            </label>
            <textarea
              rows={2}
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder={t.topicSummaryPlaceholder}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Difficulty Rating (1-4) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-800">{t.difficulty} (1-4)</label>
              <span className="font-mono text-indigo-600 font-semibold">
                {t.difficultyLevels[difficulty]}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as DifficultyRating[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`py-1.5 text-center rounded-md font-medium transition-all cursor-pointer border ${
                    difficulty === level
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Rating (1-4) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-800">{t.volume} (1-4)</label>
              <span className="font-mono text-indigo-600 font-semibold">
                {t.volumeLevels[volume]}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as VolumeRating[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setVolume(level)}
                  className={`py-1.5 text-center rounded-md font-medium transition-all cursor-pointer border ${
                    volume === level
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>
          </div>

          {/* Understanding Rating (1-4) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-800">{t.understanding} (1-4)</label>
              <span className="font-mono text-indigo-600 font-semibold truncate max-w-[200px]" title={t.understandingLevels[understanding]}>
                {t.understandingLevels[understanding]}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as UnderstandingRating[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUnderstanding(level)}
                  className={`py-1.5 text-center rounded-md font-medium transition-all cursor-pointer border ${
                    understanding === level
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>
          </div>

          {/* Importance Rating (1-5) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-800">{t.importance} (1-5)</label>
              <span className="font-mono text-indigo-600 font-semibold">
                {t.importanceLevels[importance]}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as ImportanceRating[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setImportance(level)}
                  className={`py-1.5 text-center rounded-md font-medium transition-all cursor-pointer border ${
                    importance === level
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {level}/5
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Live Preview */}
          <div className="bg-slate-100 rounded-lg p-3.5 flex items-center justify-between text-xs border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Calculated Output:</span>
            </div>
            <div className="flex items-center gap-4 font-mono tabular-nums">
              <span>
                Time: <strong className="text-slate-900 font-bold">{previewTime.toFixed(2)} hrs</strong>
              </span>
              <span>·</span>
              <span>
                Priority: <strong className="text-indigo-600 font-bold">{previewPriority.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
