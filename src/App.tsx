import React, { useState, useEffect, useMemo } from 'react';
import {
  AlgorithmConfig,
  ExamTarget,
  Language,
  ScheduleSession,
  StepPage,
  StudyDay,
  Topic,
} from './types/planner';
import { DEFAULT_ALGORITHM_CONFIG, enrichTopic, generateSchedule } from './utils/algorithm';
import { MEDICAL_PRESETS } from './data/presets';
import { playChime } from './utils/sound';
import { Header } from './components/Header';
import { WelcomeView } from './components/WelcomeView';
import { TargetSetupView } from './components/TargetSetupView';
import { TopicsSetupView } from './components/TopicsSetupView';
import { FinalScheduleView } from './components/FinalScheduleView';
import { AddTopicModal } from './components/AddTopicModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { DaySuccessModal } from './components/DaySuccessModal';
import { CAlgorithmView } from './components/CAlgorithmView';
import { ShareModal } from './components/ShareModal';
import { X } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('th');
  const [currentStep, setCurrentStep] = useState<StepPage>('welcome');

  // Default Medical Preset: NL1 Comprehensive Exam
  const defaultPreset = MEDICAL_PRESETS[0];

  const [target, setTarget] = useState<ExamTarget>(() => {
    try {
      const saved = localStorage.getItem('med_target');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultPreset.target;
  });

  const [topics, setTopics] = useState<Topic[]>(() => {
    try {
      const saved = localStorage.getItem('med_topics');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultPreset.topics;
  });

  const [days, setDays] = useState<StudyDay[]>(() => {
    try {
      const saved = localStorage.getItem('med_days');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultPreset.days;
  });

  const [config, setConfig] = useState<AlgorithmConfig>(() => {
    try {
      const saved = localStorage.getItem('med_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ALGORITHM_CONFIG;
  });

  const [completedSessionIds, setCompletedSessionIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('med_completed_sessions');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set<string>();
  });

  // Rolled-over session IDs to track visual badge
  const [rolledOverSessionIds, setRolledOverSessionIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('med_rolled_sessions');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set<string>();
  });

  // Modals
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [focusSession, setFocusSession] = useState<ScheduleSession | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);

  const [daySuccessModal, setDaySuccessModal] = useState<{
    isOpen: boolean;
    dayNumber: number;
  }>({
    isOpen: false,
    dayNumber: 1,
  });

  const [isCCodeModalOpen, setIsCCodeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('med_target', JSON.stringify(target));
    } catch {}
  }, [target]);

  useEffect(() => {
    try {
      localStorage.setItem('med_topics', JSON.stringify(topics));
    } catch {}
  }, [topics]);

  useEffect(() => {
    try {
      localStorage.setItem('med_days', JSON.stringify(days));
    } catch {}
  }, [days]);

  useEffect(() => {
    try {
      localStorage.setItem('med_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'med_completed_sessions',
        JSON.stringify(Array.from(completedSessionIds))
      );
    } catch {}
  }, [completedSessionIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'med_rolled_sessions',
        JSON.stringify(Array.from(rolledOverSessionIds))
      );
    } catch {}
  }, [rolledOverSessionIds]);

  // When target.totalDays or target.defaultDailyHours change in Step 2, update days array accordingly
  const handleTargetChange = (newTarget: ExamTarget) => {
    setTarget(newTarget);
    const targetMinutes = Math.round(newTarget.defaultDailyHours * 60);

    const updatedDays: StudyDay[] = Array.from({ length: newTarget.totalDays }, (_, i) => {
      const dayNum = i + 1;
      const existing = days[i];
      let dateString = '';
      if (newTarget.startDate) {
        const d = new Date(newTarget.startDate);
        d.setDate(d.getDate() + i);
        dateString = d.toISOString().split('T')[0];
      }
      return {
        dayNumber: dayNum,
        dateString: dateString || existing?.dateString,
        availableMinutes: existing ? existing.availableMinutes : targetMinutes,
        usedMinutes: 0,
      };
    });
    setDays(updatedDays);
  };

  // Compute schedule from current state
  const rawScheduleResult = useMemo(() => {
    return generateSchedule(topics, days, config);
  }, [topics, days, config]);

  // Decorate sessions with isRolledOver flag
  const scheduleResult = useMemo(() => {
    const sessions = rawScheduleResult.sessions.map((s) => ({
      ...s,
      isRolledOver: rolledOverSessionIds.has(s.id),
    }));

    const daySummaries = rawScheduleResult.daySummaries.map((day) => ({
      ...day,
      sessions: sessions.filter((s) => s.dayNumber === day.dayNumber),
    }));

    return {
      ...rawScheduleResult,
      sessions,
      daySummaries,
    };
  }, [rawScheduleResult, rolledOverSessionIds]);

  // Select Preset Handler
  const handleSelectPreset = (presetId: string) => {
    const found = MEDICAL_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setTarget(found.target);
      setTopics(found.topics);
      setDays(found.days);
      setCompletedSessionIds(new Set());
      setRolledOverSessionIds(new Set());
      setCurrentStep('target');
    }
  };

  // Add / Edit Topic
  const handleSaveTopic = (
    topicData: Omit<Topic, 'id' | 'estimatedHours' | 'remainingHours' | 'priority'>,
    topicId?: string
  ) => {
    if (topicId) {
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? enrichTopic({ ...t, ...topicData }, config) : t))
      );
    } else {
      const newTopic = enrichTopic(
        {
          id: `topic-${Date.now()}`,
          ...topicData,
        },
        config
      );
      setTopics((prev) => [...prev, newTopic]);
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setIsAddTopicModalOpen(true);
  };

  const handleDeleteTopic = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDuplicateTopic = (topic: Topic) => {
    const duplicated = enrichTopic(
      {
        ...topic,
        id: `topic-${Date.now()}`,
        name: `${topic.name} (Copy)`,
      },
      config
    );
    setTopics((prev) => [...prev, duplicated]);
  };

  // Toggle session complete & Check if day is 100% finished
  const handleToggleSessionComplete = (sessionId: string, dayNumber: number) => {
    const nextCompleted = new Set(completedSessionIds);
    const wasCompleted = nextCompleted.has(sessionId);

    if (wasCompleted) {
      nextCompleted.delete(sessionId);
    } else {
      nextCompleted.add(sessionId);
    }
    setCompletedSessionIds(nextCompleted);

    // If session was just marked completed, check if all sessions in this day are now done!
    if (!wasCompleted) {
      const daySessions = scheduleResult.sessions.filter((s) => s.dayNumber === dayNumber);
      const isDayNowComplete = daySessions.every((s) => nextCompleted.has(s.id));
      if (isDayNowComplete && daySessions.length > 0) {
        playChime('complete');
        setDaySuccessModal({
          isOpen: true,
          dayNumber,
        });
      }
    }
  };

  // Auto-Balance (Increase minutes across days when not enough time)
  const handleAutoBalance = () => {
    const requiredMinutes = Math.ceil(scheduleResult.requiredHours * 60);
    const availableMinutes = days.reduce((acc, d) => acc + d.availableMinutes, 0);
    const deficitMinutes = requiredMinutes - availableMinutes;

    if (deficitMinutes <= 0) return;

    const extraPerDay = Math.ceil(deficitMinutes / Math.max(1, days.length));
    const nextDays = days.map((d) => ({
      ...d,
      availableMinutes: Math.min(1440, d.availableMinutes + extraPerDay),
    }));
    setDays(nextDays);
  };

  // Adaptive Roll-Forward / Reschedule
  // When an earlier day had incomplete tasks, roll remaining hours into future days!
  const handleRollOverMissedSessions = () => {
    const incompleteSessions = scheduleResult.sessions.filter(
      (s) => !completedSessionIds.has(s.id)
    );
    if (incompleteSessions.length === 0) return;

    // Calculate how many incomplete minutes exist from earlier days (e.g. Day 1, Day 2...)
    const incompleteMinutesTotal = incompleteSessions.reduce((acc, s) => acc + s.minutes, 0);

    // Add extra buffer to remaining days
    const remainingDaysCount = Math.max(1, Math.floor(days.length / 2));
    const extraMinutesPerRemainingDay = Math.ceil(incompleteMinutesTotal / remainingDaysCount);

    const updatedDays = days.map((d, index) => {
      // Add extra study minutes to latter half of schedule to absorb the rolled over load
      if (index >= days.length - remainingDaysCount) {
        return {
          ...d,
          availableMinutes: Math.min(1440, d.availableMinutes + extraMinutesPerRemainingDay),
        };
      }
      return d;
    });

    // Mark these sessions as rolled over
    const newRolledSet = new Set(rolledOverSessionIds);
    incompleteSessions.forEach((s) => newRolledSet.add(s.id));

    setDays(updatedDays);
    setRolledOverSessionIds(newRolledSet);
    playChime('alert');
  };

  // Start focus timer
  const handleStartFocus = (session: ScheduleSession) => {
    setFocusSession(session);
    setIsFocusModalOpen(true);
  };

  const handleCompleteFocusSession = (sessionId: string) => {
    setCompletedSessionIds((prev) => new Set(prev).add(sessionId));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 4-Step Top Navigation Header */}
      <Header
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        lang={lang}
        setLang={setLang}
        onOpenAddTopic={() => {
          setEditingTopic(null);
          setIsAddTopicModalOpen(true);
        }}
        onSelectPreset={handleSelectPreset}
        onPrint={() => window.print()}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* Main Multi-Step Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step 1: Welcome Page */}
        {currentStep === 'welcome' && (
          <WelcomeView
            lang={lang}
            onStart={() => setCurrentStep('target')}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* Step 2: Target & Time Setup */}
        {currentStep === 'target' && (
          <TargetSetupView
            target={target}
            onChangeTarget={handleTargetChange}
            topicCount={topics.length}
            lang={lang}
            onNext={() => setCurrentStep('topics')}
            onBack={() => setCurrentStep('welcome')}
          />
        )}

        {/* Step 3: Topics & Real-Time Feasibility Check */}
        {currentStep === 'topics' && (
          <TopicsSetupView
            topics={topics}
            days={days}
            lang={lang}
            onOpenAddTopic={() => {
              setEditingTopic(null);
              setIsAddTopicModalOpen(true);
            }}
            onEditTopic={handleEditTopic}
            onDeleteTopic={handleDeleteTopic}
            onDuplicateTopic={handleDuplicateTopic}
            onAutoBalance={handleAutoBalance}
            onNext={() => setCurrentStep('schedule')}
            onBack={() => setCurrentStep('target')}
          />
        )}

        {/* Step 4: Final Study Schedule & Checklist */}
        {currentStep === 'schedule' && (
          <FinalScheduleView
            scheduleResult={scheduleResult}
            topics={topics}
            target={target}
            lang={lang}
            onStartFocus={handleStartFocus}
            onToggleSessionComplete={handleToggleSessionComplete}
            completedSessionIds={completedSessionIds}
            onRollOverMissedSessions={handleRollOverMissedSessions}
            onBackToTopics={() => setCurrentStep('topics')}
            onViewCCode={() => setIsCCodeModalOpen(true)}
            onPrint={() => window.print()}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-700">
            ระบบจัดสรรตารางติวสำหรับนิสิตคณะแพทยศาสตร์ สาขาวิทยาศาสตร์การแพทย์
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>อัลกอริทึมคำนวณตามความสำคัญจริง</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsCCodeModalOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              ดูโค้ด C / CLI
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Topic Modal */}
      <AddTopicModal
        isOpen={isAddTopicModalOpen}
        onClose={() => {
          setIsAddTopicModalOpen(false);
          setEditingTopic(null);
        }}
        onSave={handleSaveTopic}
        editingTopic={editingTopic}
        lang={lang}
      />

      {/* Focus Session Pomodoro Countdown Modal */}
      <FocusTimerModal
        session={focusSession}
        isOpen={isFocusModalOpen}
        onClose={() => {
          setIsFocusModalOpen(false);
          setFocusSession(null);
        }}
        onCompleteSession={handleCompleteFocusSession}
        lang={lang}
      />

      {/* Day Success Celebration Modal */}
      <DaySuccessModal
        dayNumber={daySuccessModal.dayNumber}
        isOpen={daySuccessModal.isOpen}
        onClose={() => setDaySuccessModal({ isOpen: false, dayNumber: 1 })}
        daysUntilExam={target.totalDays}
        lang={lang}
      />

      {/* C Code & Terminal Simulation Modal */}
      {isCCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                ซอร์สโค้ดภาษา C และผลการรันคอนโซล (C Code & CLI Simulation)
              </h3>
              <button
                onClick={() => setIsCCodeModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <CAlgorithmView
                topics={topics}
                days={days}
                config={config}
                onChangeConfig={setConfig}
                lang={lang}
              />
            </div>
          </div>
        </div>
      )}

      {/* Share Website Modal with QR Code and 1-Click Copy */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
