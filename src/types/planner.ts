export type DifficultyRating = 1 | 2 | 3 | 4;
export type VolumeRating = 1 | 2 | 3 | 4;
export type UnderstandingRating = 1 | 2 | 3 | 4;
export type ImportanceRating = 1 | 2 | 3 | 4 | 5;

export interface Topic {
  id: string;
  name: string;
  difficulty: DifficultyRating;       // 1 to 4
  volume: VolumeRating;               // 1 to 4
  understanding: UnderstandingRating; // 1 to 4
  importance: ImportanceRating;       // 1 to 5
  estimatedHours: number;
  remainingHours: number;
  priority: number;
  category?: string;
  color?: string;
  summaryNotes?: string;              // Optional topic summary / sub-topics notes
}

export interface StudyDay {
  dayNumber: number;      // 1-indexed (1, 2, 3...)
  dateString?: string;    // e.g. "2026-11-02"
  availableMinutes: number; // 0 to 1440
  usedMinutes: number;
}

export interface ScheduleSession {
  id: string;
  dayNumber: number;
  dayIndex: number;
  topicId: string;
  topicName: string;
  minutes: number;
  hours: number;
  completed: boolean;
  notes?: string;
  isRolledOver?: boolean; // Flagged if rolled over from a previous uncompleted day
}

export interface ScheduleResult {
  sessions: ScheduleSession[];
  requiredHours: number;
  availableHours: number;
  isFeasible: boolean;
  unallocatedTopics: {
    topic: Topic;
    remainingHours: number;
    percentCovered: number;
  }[];
  daySummaries: {
    dayNumber: number;
    dateString?: string;
    availableMinutes: number;
    usedMinutes: number;
    remainingMinutes: number;
    sessions: ScheduleSession[];
  }[];
}

export interface ExamTarget {
  examName: string;          // e.g. "NL1 (ศรว. ขั้นที่ 1)", "Final Block: Nervous System"
  studentDepartment: string; // "นิสิตคณะแพทยศาสตร์ สาขาวิทยาศาสตร์การแพทย์"
  examDate: string;          // YYYY-MM-DD
  startDate: string;         // YYYY-MM-DD
  totalDays: number;
  defaultDailyHours: number; // Default daily study hours
}

export interface AlgorithmConfig {
  baseTime: number; // default 2.0 hours
  difficultyFactors: [number, number, number, number, number];
  volumeFactors: [number, number, number, number, number];
  knowledgeFactors: [number, number, number, number, number];
  importanceWeight: number;
  difficultyWeight: number;
  understandingWeight: number;
}

export type StepPage = 'welcome' | 'target' | 'topics' | 'schedule';
export type Language = 'th' | 'en';
