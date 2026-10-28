export type Priority = 'p0' | 'p1' | 'p2'; // P0: 核心产出/攻坚, P1: 稳步推进, P2: 弹性机动

export type Category = 'research' | 'health' | 'mind' | 'work' | 'rest' | 'life';

export type RecurrenceType = 'none' | 'daily' | 'workdays' | 'weekends' | 'weekly';

export interface ScheduleItem {
  id: string;
  title: string;
  titleEn?: string;
  category: Category;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAllDay: boolean;
  priority: Priority;
  completed: boolean;
  completedDates?: string[];
  completedAt?: string;
  repeat: RecurrenceType;
  note?: string;
  noteEn?: string;
  focusMinutes?: number;
}

export interface HabitItem {
  id: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  icon: string;
  color: string;
  targetCount: number;
  unit: string;
  unitEn?: string;
  frequency: 'daily' | 'workdays' | 'weekends';
  reminderTime?: string;
  history: Record<string, number>;
  streak: number;
  createdAt: string;
}

export interface FocusRecord {
  id: string;
  taskId?: string;
  taskTitle: string;
  category: Category;
  durationMinutes: number;
  date: string;
  timestamp: string;
}

export interface DayReflection {
  date: string;
  mood: 'super' | 'good' | 'normal' | 'tired';
  energyLevel?: number; // 1 to 5
  note: string;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  targetGroup: string; // e.g. "深度思考 / 攻坚创作者"
  targetGroupEn?: string;
  citation: string;
  citationEn?: string;
  tag: string;
  tagEn?: string;
  tasks: (Omit<ScheduleItem, 'id' | 'date' | 'completed' | 'completedDates'> & { titleEn?: string; noteEn?: string })[];
  habits: (Omit<HabitItem, 'id' | 'history' | 'streak' | 'createdAt'> & { titleEn?: string; subtitleEn?: string; unitEn?: string })[];
}
