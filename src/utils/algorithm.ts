import { AlgorithmConfig, ScheduleResult, ScheduleSession, StudyDay, Topic } from '../types/planner';

export const DEFAULT_ALGORITHM_CONFIG: AlgorithmConfig = {
  baseTime: 2.0,
  difficultyFactors: [0, 0.8, 1.0, 1.4, 1.8],
  volumeFactors: [0, 0.7, 1.0, 1.5, 2.0],
  knowledgeFactors: [0, 1.7, 1.4, 1.0, 0.7],
  importanceWeight: 0.35,
  difficultyWeight: 0.25,
  understandingWeight: 0.25,
};

/**
 * Calculates estimated study time for a topic in hours
 * Corresponds to calculate_time() in C:
 * base_time * difficulty[t.difficulty] * volume[t.volume] * knowledge[t.understanding]
 */
export function calculateTopicTime(
  topic: Pick<Topic, 'difficulty' | 'volume' | 'understanding'>,
  config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG
): number {
  const diffFactor = config.difficultyFactors[topic.difficulty] ?? 1.0;
  const volFactor = config.volumeFactors[topic.volume] ?? 1.0;
  const knowFactor = config.knowledgeFactors[topic.understanding] ?? 1.0;
  const result = config.baseTime * diffFactor * volFactor * knowFactor;
  return Math.round(result * 100) / 100;
}

/**
 * Calculates priority score for a topic
 * Corresponds to calculate_priority() in C:
 * (importance * 0.35) + (difficulty * 0.25) + ((5 - understanding) * 0.25)
 */
export function calculateTopicPriority(
  topic: Pick<Topic, 'difficulty' | 'understanding' | 'importance'>,
  config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG
): number {
  const priority =
    topic.importance * config.importanceWeight +
    topic.difficulty * config.difficultyWeight +
    (5 - topic.understanding) * config.understandingWeight;
  return Math.round(priority * 100) / 100;
}

/**
 * Prepares and updates topic estimated hours, remaining hours, and priority
 */
export function enrichTopic(
  topic: Omit<Topic, 'estimatedHours' | 'remainingHours' | 'priority'>,
  config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG
): Topic {
  const estimatedHours = calculateTopicTime(topic, config);
  const priority = calculateTopicPriority(topic, config);
  return {
    ...topic,
    estimatedHours,
    remainingHours: estimatedHours,
    priority,
  };
}

/**
 * Feasibility Check corresponding to check_feasibility() in C
 */
export function checkFeasibility(
  topics: Topic[],
  days: StudyDay[]
): { requiredHours: number; availableHours: number; isFeasible: boolean; deltaHours: number } {
  const requiredHours = topics.reduce((acc, t) => acc + t.estimatedHours, 0);
  const totalMinutes = days.reduce((acc, d) => acc + d.availableMinutes, 0);
  const availableHours = totalMinutes / 60.0;
  const isFeasible = availableHours >= requiredHours;
  const deltaHours = availableHours - requiredHours;

  return {
    requiredHours: Math.round(requiredHours * 100) / 100,
    availableHours: Math.round(availableHours * 100) / 100,
    isFeasible,
    deltaHours: Math.round(deltaHours * 100) / 100,
  };
}

/**
 * Generates study schedule using greedy priority allocation
 * Corresponds directly to sort_topics() + generate_schedule() in C
 */
export function generateSchedule(
  topics: Topic[],
  days: StudyDay[],
  config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG
): ScheduleResult {
  // Deep clone topics and days to avoid mutating original state
  const sortedTopics = [...topics].map((t) => ({
    ...t,
    estimatedHours: calculateTopicTime(t, config),
    priority: calculateTopicPriority(t, config),
  }));

  // Sort descending by priority: highest priority first
  sortedTopics.sort((a, b) => b.priority - a.priority);

  // Initialize days state
  const workingDays: StudyDay[] = days.map((d, index) => ({
    dayNumber: d.dayNumber || index + 1,
    dateString: d.dateString,
    availableMinutes: Math.max(0, d.availableMinutes),
    usedMinutes: 0,
  }));

  const sessions: ScheduleSession[] = [];
  const unallocatedTopics: ScheduleResult['unallocatedTopics'] = [];

  for (let i = 0; i < sortedTopics.length; i++) {
    const currentTopic = sortedTopics[i];
    let remaining = currentTopic.estimatedHours;

    for (let d = 0; d < workingDays.length && remaining > 0.001; d++) {
      const available = workingDays[d].availableMinutes - workingDays[d].usedMinutes;
      if (available <= 0) continue;

      const availableHours = available / 60.0;
      let sessionHours = remaining;

      if (sessionHours > availableHours) {
        sessionHours = availableHours;
      }

      const minutes = Math.floor(sessionHours * 60);
      if (minutes <= 0) continue;

      workingDays[d].usedMinutes += minutes;
      remaining -= minutes / 60.0;

      sessions.push({
        id: `sess-${d}-${currentTopic.id}-${minutes}`,
        dayIndex: d,
        dayNumber: workingDays[d].dayNumber,
        topicId: currentTopic.id,
        topicName: currentTopic.name,
        minutes,
        hours: Math.round((minutes / 60.0) * 100) / 100,
        completed: false,
      });
    }

    if (remaining > 0.001) {
      const coveredHours = currentTopic.estimatedHours - remaining;
      const percentCovered =
        currentTopic.estimatedHours > 0
          ? Math.round((coveredHours / currentTopic.estimatedHours) * 100)
          : 0;
      unallocatedTopics.push({
        topic: currentTopic,
        remainingHours: Math.round(remaining * 100) / 100,
        percentCovered,
      });
    }
  }

  const { requiredHours, availableHours, isFeasible } = checkFeasibility(topics, days);

  const daySummaries = workingDays.map((d) => {
    const daySessions = sessions.filter((s) => s.dayNumber === d.dayNumber);
    return {
      dayNumber: d.dayNumber,
      dateString: d.dateString,
      availableMinutes: d.availableMinutes,
      usedMinutes: d.usedMinutes,
      remainingMinutes: Math.max(0, d.availableMinutes - d.usedMinutes),
      sessions: daySessions,
    };
  });

  return {
    sessions,
    requiredHours,
    availableHours,
    isFeasible,
    unallocatedTopics,
    daySummaries,
  };
}

/**
 * Generates exact terminal CLI simulation matching the C program output
 */
export function generateCliTerminalOutput(
  topics: Topic[],
  days: StudyDay[],
  config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG
): string {
  const result = generateSchedule(topics, days, config);
  const lines: string[] = [];

  lines.push('SMART STUDY PLANNER');
  lines.push(`Enter number of topics: ${topics.length}`);
  lines.push('');

  topics.forEach((t, i) => {
    lines.push(`Topic ${i + 1}`);
    lines.push(`Topic name: ${t.name}`);
    lines.push(`Difficulty (1-4): ${t.difficulty}`);
    lines.push(`Volume (1-4): ${t.volume}`);
    lines.push(`Understanding (1-4): ${t.understanding}`);
    lines.push(`Importance (1-5): ${t.importance}`);
    lines.push(`Estimated time: ${t.estimatedHours.toFixed(2)} hours`);
    lines.push('');
  });

  lines.push(`Enter remaining study days: ${days.length}`);
  days.forEach((d, i) => {
    lines.push(`Available minutes on day ${i + 1}: ${d.availableMinutes}`);
  });

  lines.push('');
  lines.push('========== FEASIBILITY ==========');
  lines.push(`Required hours: ${result.requiredHours.toFixed(2)}`);
  lines.push(`Available hours: ${result.availableHours.toFixed(2)}`);
  lines.push(`Status: ${result.isFeasible ? 'ENOUGH TIME' : 'NOT ENOUGH TIME'}`);

  lines.push('');
  lines.push('========== STUDY SCHEDULE ==========');
  if (result.sessions.length === 0) {
    lines.push('(No sessions scheduled)');
  } else {
    result.sessions.forEach((s) => {
      lines.push(
        `Day ${s.dayNumber} | ${s.topicName.padEnd(25, ' ')} | ${s.minutes} minutes`
      );
    });
  }

  if (result.unallocatedTopics.length > 0) {
    result.unallocatedTopics.forEach((u) => {
      lines.push(`WARNING: Not enough time for ${u.topic.name}`);
    });
  }

  return lines.join('\n');
}

/**
 * Generates fully working, compilable C source code populated with current state
 */
export function generateCSourceCode(
  topics: Topic[],
  days: StudyDay[],
  config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG
): string {
  const topicAssignments = topics
    .map(
      (t, i) => `    // Topic ${i + 1}: ${t.name}
    strncpy(topics[${i}].name, "${t.name.replace(/"/g, '\\"')}", 99);
    topics[${i}].difficulty = ${t.difficulty};
    topics[${i}].volume = ${t.volume};
    topics[${i}].understanding = ${t.understanding};
    topics[${i}].importance = ${t.importance};
    topics[${i}].estimated_hours = calculate_time(topics[${i}]);
    topics[${i}].remaining_hours = topics[${i}].estimated_hours;
    topics[${i}].priority = calculate_priority(topics[${i}]);`
    )
    .join('\n\n');

  const dayAssignments = days
    .map(
      (d, i) => `    days[${i}].available_minutes = ${d.availableMinutes};
    days[${i}].used_minutes = 0;`
    )
    .join('\n');

  return `/*
 * SMART STUDY PLANNER
 * Algorithmic Study Schedule Generator
 * Compiled from user configuration
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_TOPICS ${Math.max(100, topics.length + 10)}
#define MAX_DAYS ${Math.max(365, days.length + 10)}

typedef struct {
    char name[100];
    int difficulty;
    int volume;
    int understanding;
    int importance;
    double estimated_hours;
    double remaining_hours;
    double priority;
} Topic;

typedef struct {
    int available_minutes;
    int used_minutes;
} StudyDay;

Topic topics[MAX_TOPICS];
StudyDay days[MAX_DAYS];

int topic_count = ${topics.length};
int total_days = ${days.length};

// คำนวณเวลาที่ต้องใช้ (Calculate required study hours)
double calculate_time(Topic t) {
    double difficulty[] = {0, ${config.difficultyFactors.slice(1).join(', ')}};
    double volume[] = {0, ${config.volumeFactors.slice(1).join(', ')}};
    double knowledge[] = {0, ${config.knowledgeFactors.slice(1).join(', ')}};

    double base_time = ${config.baseTime.toFixed(1)};

    return base_time *
           difficulty[t.difficulty] *
           volume[t.volume] *
           knowledge[t.understanding];
}

// คำนวณลำดับความสำคัญ (Calculate priority score)
double calculate_priority(Topic t) {
    return (t.importance * ${config.importanceWeight}) +
           (t.difficulty * ${config.difficultyWeight}) +
           ((5 - t.understanding) * ${config.understandingWeight});
}

// เรียงหัวข้อตามความสำคัญ (Sort topics by priority descending)
void sort_topics() {
    for (int i = 0; i < topic_count - 1; i++) {
        for (int j = i + 1; j < topic_count; j++) {
            if (topics[j].priority > topics[i].priority) {
                Topic temp = topics[i];
                topics[i] = topics[j];
                topics[j] = temp;
            }
        }
    }
}

// สร้างตารางอ่านหนังสือ (Generate study schedule)
void generate_schedule() {
    printf("\\n========== STUDY SCHEDULE ==========\\n");

    for (int i = 0; i < topic_count; i++) {
        double remaining = topics[i].remaining_hours;

        for (int d = 0; d < total_days && remaining > 0.001; d++) {

            int available =
                days[d].available_minutes -
                days[d].used_minutes;

            if (available <= 0) continue;

            double available_hours = available / 60.0;

            double session = remaining;

            if (session > available_hours)
                session = available_hours;

            int minutes = (int)(session * 60);

            if (minutes <= 0) continue;

            days[d].used_minutes += minutes;
            remaining -= minutes / 60.0;

            printf("Day %d | %-25s | %d minutes\\n",
                   d + 1,
                   topics[i].name,
                   minutes);
        }

        if (remaining > 0.001) {
            printf("WARNING: Not enough time for %s\\n",
                   topics[i].name);
        }
    }
}

// ตรวจสอบเวลารวม (Check feasibility)
void check_feasibility() {
    double required = 0;
    double available = 0;

    for (int i = 0; i < topic_count; i++)
        required += topics[i].estimated_hours;

    for (int i = 0; i < total_days; i++)
        available += days[i].available_minutes / 60.0;

    printf("\\n========== FEASIBILITY ==========\\n");
    printf("Required hours: %.2f\\n", required);
    printf("Available hours: %.2f\\n", available);

    if (available >= required)
        printf("Status: ENOUGH TIME\\n");
    else
        printf("Status: NOT ENOUGH TIME\\n");
}

int main() {
    printf("SMART STUDY PLANNER (Pre-loaded with ${topics.length} topics, ${days.length} days)\\n");

${topicAssignments}

${dayAssignments}

    sort_topics();
    check_feasibility();
    generate_schedule();

    return 0;
}
`;
}
