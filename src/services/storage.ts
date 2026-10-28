import { ScheduleItem, HabitItem, FocusRecord, DayReflection } from '../types';
import { getTodayStr, formatDate, parseLocalDate } from '../utils/date';

export { getTodayStr, formatDate, parseLocalDate };

const STORAGE_KEYS = {
  SCHEDULES: 'pulseflow_schedules_v4',
  HABITS: 'pulseflow_habits_v4',
  FOCUS_RECORDS: 'pulseflow_focus_records_v4',
  REFLECTIONS: 'pulseflow_reflections_v4',
  DARK_MODE: 'pulseflow_dark_mode',
};

// Default habits for grad students, PhDs, and young professionals
const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'habit-1',
    title: '晨光采光 15分钟',
    titleEn: 'Morning Sunlight 15m',
    subtitle: '校准生物钟，阻断学术/工作失眠',
    subtitleEn: 'Calibrate master circadian clock, prevent insomnia',
    icon: 'Sun',
    color: '#f59e0b',
    targetCount: 1,
    unit: '次',
    unitEn: 'times',
    frequency: 'daily',
    history: {},
    streak: 6,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-2',
    title: '单线程深度心流攻坚',
    titleEn: 'Single-Thread Deep Flow',
    subtitle: '保证每日连续大块专注输出',
    subtitleEn: 'Ensure solid uninterrupted cognitive blocks daily',
    icon: 'GraduationCap',
    color: '#8b5cf6',
    targetCount: 2,
    unit: '波段',
    unitEn: 'blocks',
    frequency: 'workdays',
    history: {},
    streak: 9,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-3',
    title: '4-7-8 脑雾清理呼吸',
    titleEn: '4-7-8 Brain Fog Clearing Breath',
    subtitle: '推演/编码卡壳时快速降噪',
    subtitleEn: 'Decompress rapidly when stuck on tough problems',
    icon: 'Wind',
    color: '#10b981',
    targetCount: 2,
    unit: '次',
    unitEn: 'times',
    frequency: 'daily',
    history: {},
    streak: 5,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-4',
    title: '防久坐起身舒展',
    titleEn: 'Anti-Sedentary Work Breaks',
    subtitle: '缓解颈椎反弓与腰椎负荷',
    subtitleEn: 'Relieve cervical strain and lumbar compression',
    icon: 'Activity',
    color: '#3b82f6',
    targetCount: 4,
    unit: '次',
    unitEn: 'times',
    frequency: 'workdays',
    history: {},
    streak: 7,
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-5',
    title: '夜间物理断网与低暖光',
    titleEn: 'Night Disconnect & Low Warm Light',
    subtitle: '避免深夜情绪反刍，保持心境平和',
    subtitleEn: 'Shield circadian melatonin from night-time rumination',
    icon: 'Moon',
    color: '#6366f1',
    targetCount: 1,
    unit: '次',
    unitEn: 'times',
    frequency: 'daily',
    history: {},
    streak: 4,
    createdAt: '2026-10-01',
  },
];

// Initial tasks for today
const createInitialTasks = (): ScheduleItem[] => {
  const today = getTodayStr();
  return [
    {
      id: 'task-1',
      title: '晨光采光 15分钟 & 温水慢饮',
      titleEn: 'Morning Sunlight 15m & Hydration',
      category: 'health',
      date: today,
      startTime: '07:30',
      endTime: '08:00',
      isAllDay: false,
      priority: 'p0',
      completed: true,
      completedDates: [today],
      repeat: 'daily',
      note: '户外采光唤醒大脑视网膜神经元，重置全天昼夜节律',
      noteEn: 'Outdoor sunlight exposure resets retinal neurons and circadian baseline',
      focusMinutes: 15,
    },
    {
      id: 'task-2',
      title: '文献精读与核心理论推演 · 90m单线程',
      titleEn: 'Literature Deep Review & Theory · 90m',
      category: 'research',
      date: today,
      startTime: '09:30',
      endTime: '11:00',
      isAllDay: false,
      priority: 'p0',
      completed: true,
      completedDates: [today],
      repeat: 'workdays',
      note: '关闭一切通讯工具，只攻坚今天最核心的 Paper 或系统架构设计',
      noteEn: 'Notifications muted, single-thread attack on today top paper/architecture',
      focusMinutes: 90,
    },
    {
      id: 'task-3',
      title: '离桌健康午餐 & 户外慢走 15分钟',
      titleEn: 'Off-Desk Healthy Lunch & 15m Walk',
      category: 'life',
      date: today,
      startTime: '12:00',
      endTime: '13:00',
      isAllDay: false,
      priority: 'p1',
      completed: true,
      completedDates: [today],
      repeat: 'daily',
      note: '脱离工位与实验室环境，平稳血糖，促进潜意识思维联想',
      noteEn: 'Step away from desk, stabilize blood glucose, allow mental incubation',
      focusMinutes: 0,
    },
    {
      id: 'task-4',
      title: '午后 NSDR 神经快充 · 15m闭目',
      titleEn: 'Afternoon NSDR Neurological Fast Recharge · 15m',
      category: 'rest',
      date: today,
      startTime: '13:30',
      endTime: '13:50',
      isAllDay: false,
      priority: 'p1',
      completed: false,
      completedDates: [],
      repeat: 'daily',
      note: '非睡眠深度休息，恢复额叶多巴胺储备，杜绝下午困倦',
      noteEn: 'Non-Sleep Deep Rest restores dopamine and executive alertness',
      focusMinutes: 15,
    },
    {
      id: 'task-5',
      title: '代码实验实现与业务交付物推进 · 90m',
      titleEn: 'Codebase Experiments & Delivery Sprint · 90m',
      category: 'work',
      date: today,
      startTime: '14:30',
      endTime: '16:00',
      isAllDay: false,
      priority: 'p0',
      completed: false,
      completedDates: [],
      repeat: 'workdays',
      note: '单线程操作，记录实验/开发 Log',
      noteEn: 'Single-thread focus, keep detailed dev/experiment logs',
      focusMinutes: 60,
    },
    {
      id: 'task-6',
      title: '下班离线归零便签 & 晚间低暖光',
      titleEn: 'Shutdown Ritual & Evening Low Warm Light',
      category: 'life',
      date: today,
      startTime: '21:30',
      endTime: '22:15',
      isAllDay: false,
      priority: 'p1',
      completed: false,
      completedDates: [],
      repeat: 'daily',
      note: '关闭 IDE 与工程标签页，写下明日起点，享受个人夜晚',
      noteEn: 'Close tabs and IDE, note down tomorrow first task, enjoy personal evening',
      focusMinutes: 0,
    },
  ];
};

export const StorageService = {
  getSchedules: (): ScheduleItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      if (!data) {
        const init = createInitialTasks();
        localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(init));
        return init;
      }
      return JSON.parse(data);
    } catch {
      return createInitialTasks();
    }
  },

  saveSchedules: (items: ScheduleItem[]) => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(items));
  },

  getHabits: (): HabitItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (!data) {
        const today = getTodayStr();
        const habits = INITIAL_HABITS.map((h, idx) => ({
          ...h,
          history: {
            [today]: idx < 3 ? h.targetCount : (idx === 3 ? 3 : 0),
          },
        }));
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
        return habits;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_HABITS;
    }
  },

  saveHabits: (habits: HabitItem[]) => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getFocusRecords: (): FocusRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOCUS_RECORDS);
      if (!data) {
        const today = getTodayStr();
        const mock: FocusRecord[] = [
          {
            id: 'f-1',
            taskTitle: '文献精读与核心理论推演',
            category: 'research',
            durationMinutes: 90,
            date: today,
            timestamp: `${today} 10:15`,
          },
          {
            id: 'f-2',
            taskTitle: '4-7-8 脑雾清理',
            category: 'mind',
            durationMinutes: 15,
            date: today,
            timestamp: `${today} 13:40`,
          },
        ];
        localStorage.setItem(STORAGE_KEYS.FOCUS_RECORDS, JSON.stringify(mock));
        return mock;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveFocusRecords: (records: FocusRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.FOCUS_RECORDS, JSON.stringify(records));
  },

  getReflections: (): Record<string, DayReflection> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveReflection: (date: string, reflection: DayReflection) => {
    const reflections = StorageService.getReflections();
    reflections[date] = reflection;
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
  },

  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.FOCUS_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
  },
};
