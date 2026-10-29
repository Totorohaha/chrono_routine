import React, { useState, useEffect } from 'react';
import { 
  StorageService, 
} from './services/storage';
import { 
  ScheduleItem, 
  HabitItem, 
  FocusRecord, 
  RoutineTemplate,
  Category,
  TransactionItem
} from './types';
import { getTodayStr, parseLocalDate, formatDate } from './utils/date';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { WeekCalendar } from './components/ScheduleTab/WeekCalendar';
import { TimelineView } from './components/ScheduleTab/TimelineView';
import { TaskListView } from './components/ScheduleTab/TaskListView';
import { TaskModal } from './components/ScheduleTab/TaskModal';
import { HabitCard } from './components/HabitsTab/HabitCard';
import { HabitModal } from './components/HabitsTab/HabitModal';
import { FinanceTab } from './components/FinanceTab/FinanceTab';
import { TransactionModal } from './components/FinanceTab/TransactionModal';
import { MindOasis } from './components/FocusTab/MindOasis';
import { StatsOverview } from './components/StatsTab/StatsOverview';
import { TemplateLibraryModal } from './components/SettingsTab/TemplateLibraryModal';
import { SettingsModal } from './components/SettingsTab/SettingsModal';
import { AIScheduleImportModal } from './components/ScheduleTab/AIScheduleImportModal';
import { LayoutList, GitCommitHorizontal, Plus, Search, X, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from './services/audio';
import { HapticsService } from './services/haptics';
import { App as CapApp } from '@capacitor/app';
import { ToastProvider, useToast } from './components/UI/Toast';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [scheduleViewMode, setScheduleViewMode] = useState<'timeline' | 'list'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  // Search & Filter state
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  
  // Theme & Frame
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('pulseflow_dark_mode') === 'true';
  });
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // App Data
  const [tasks, setTasks] = useState<ScheduleItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [focusRecords, setFocusRecords] = useState<FocusRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleItem | null>(null);

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIImportOpen, setIsAIImportOpen] = useState(false);

  // Task being focused in timer
  const [focusTargetTask, setFocusTargetTask] = useState<ScheduleItem | null>(null);

  // Initialize data on load
  const loadData = () => {
    setTasks(StorageService.getSchedules());
    setHabits(StorageService.getHabits());
    setFocusRecords(StorageService.getFocusRecords());
    setTransactions(StorageService.getTransactions());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Android Hardware Back Button lifecycle handling
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    const setupBackButton = async () => {
      try {
        const handler = await CapApp.addListener('backButton', () => {
          if (isAIImportOpen) {
            setIsAIImportOpen(false);
            return;
          }
          if (isTaskModalOpen) {
            setIsTaskModalOpen(false);
            setEditingTask(null);
            return;
          }
          if (isHabitModalOpen) {
            setIsHabitModalOpen(false);
            setEditingHabit(null);
            return;
          }
          if (isTransactionModalOpen) {
            setIsTransactionModalOpen(false);
            setEditingTransaction(null);
            return;
          }
          if (isTemplatesOpen) {
            setIsTemplatesOpen(false);
            return;
          }
          if (isSettingsOpen) {
            setIsSettingsOpen(false);
            return;
          }
          if (activeTab !== 'schedule') {
            setActiveTab('schedule');
            return;
          }
          CapApp.exitApp();
        });
        removeListener = () => handler.remove();
      } catch {
        // Not on native device or plugin unavailable
      }
    };
    setupBackButton();
    return () => {
      if (removeListener) removeListener();
    };
  }, [isAIImportOpen, isTaskModalOpen, isHabitModalOpen, isTransactionModalOpen, isTemplatesOpen, isSettingsOpen, activeTab]);

  // Sync dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pulseflow_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pulseflow_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Recurrence rule evaluation
  const isTaskActiveOnDate = (task: ScheduleItem, targetDate: string): boolean => {
    if (task.repeat === 'none') {
      return task.date === targetDate;
    }
    if (targetDate < task.date) {
      return false;
    }

    if (task.repeat === 'daily') return true;

    const dayOfWeek = parseLocalDate(targetDate).getDay();
    if (task.repeat === 'workdays') {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    if (task.repeat === 'weekends') {
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    if (task.repeat === 'weekly') {
      return parseLocalDate(targetDate).getDay() === parseLocalDate(task.date).getDay();
    }
    return false;
  };

  // Check if a task is completed on a specific date
  const isTaskCompleted = (task: ScheduleItem, targetDate: string): boolean => {
    if (task.completedDates && task.completedDates.includes(targetDate)) {
      return true;
    }
    if (task.repeat === 'none') {
      return Boolean(task.completed);
    }
    return false;
  };

  // Active tasks on selectedDate
  const dateTasks = tasks.filter((t) => isTaskActiveOnDate(t, selectedDate));

  // Filter tasks active on selectedDate with category and search filtering
  const filteredTasks = dateTasks.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) {
      return false;
    }
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNote = t.note ? t.note.toLowerCase().includes(q) : false;
      return matchTitle || matchNote;
    }
    return true;
  });

  // Overall streak calculation: max streak from habits (starts fresh at 0)
  const totalStreak = habits.length > 0
    ? Math.max(0, ...habits.map((h) => h.streak || 0))
    : 0;

  // Task counts by date for the calendar
  const getTaskCountsByDate = () => {
    const counts: Record<string, { total: number; completed: number }> = {};
    const cur = parseLocalDate(selectedDate);
    for (let i = -14; i <= 14; i++) {
      const d = new Date(cur.getTime());
      d.setDate(cur.getDate() + i);
      const str = formatDate(d);

      let total = 0;
      let completed = 0;
      tasks.forEach((t) => {
        if (isTaskActiveOnDate(t, str)) {
          total++;
          if (isTaskCompleted(t, str)) {
            completed++;
          }
        }
      });
      counts[str] = { total, completed };
    }
    return counts;
  };

  const taskCountsByDate = getTaskCountsByDate();

  // Task Handlers
  const handleToggleComplete = (task: ScheduleItem, targetDate: string) => {
    const currentlyCompleted = isTaskCompleted(task, targetDate);
    const nextState = !currentlyCompleted;

    if (nextState) {
      soundManager.playChime();
      HapticsService.success();
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.7 },
      });
      showToast(`${t('deliveredCount')}: ${task.title}`, 'success');
    }

    const updated = tasks.map((t) => {
      if (t.id === task.id) {
        const dates = new Set(t.completedDates || []);
        if (nextState) {
          dates.add(targetDate);
        } else {
          dates.delete(targetDate);
        }

        return {
          ...t,
          completed: t.repeat === 'none' ? nextState : t.completed,
          completedDates: Array.from(dates),
          completedAt: nextState ? new Date().toISOString() : t.completedAt,
        };
      }
      return t;
    });

    setTasks(updated);
    StorageService.saveSchedules(updated);
  };

  const handleSaveTask = (taskData: Omit<ScheduleItem, 'id'> | ScheduleItem) => {
    let updated: ScheduleItem[];
    if ('id' in taskData) {
      updated = tasks.map((t) => (t.id === taskData.id ? (taskData as ScheduleItem) : t));
      showToast(t('taskUpdated'), 'info');
    } else {
      const newTask: ScheduleItem = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        completedDates: [],
      };
      updated = [newTask, ...tasks];
      showToast(t('taskAdded'), 'success');
    }
    setTasks(updated);
    StorageService.saveSchedules(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    StorageService.saveSchedules(updated);
    showToast(t('taskDeleted'), 'info');
  };

  const handleStartFocus = (task: ScheduleItem) => {
    setFocusTargetTask(task);
    setActiveTab('focus');
  };

  // Habit Handlers
  const handleIncrementHabit = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const currentCount = h.history[selectedDate] || 0;
        const newCount = currentCount + 1;
        const reachedTarget = newCount >= h.targetCount && currentCount < h.targetCount;
        
        return {
          ...h,
          streak: reachedTarget ? (h.streak || 0) + 1 : h.streak,
          history: {
            ...h.history,
            [selectedDate]: newCount,
          },
        };
      }
      return h;
    });
    setHabits(updated);
    StorageService.saveHabits(updated);
  };

  const handleDecrementHabit = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const currentCount = h.history[selectedDate] || 0;
        if (currentCount <= 0) return h;
        const newCount = currentCount - 1;
        const droppedBelow = currentCount >= h.targetCount && newCount < h.targetCount;

        return {
          ...h,
          streak: droppedBelow ? Math.max(0, (h.streak || 0) - 1) : h.streak,
          history: {
            ...h.history,
            [selectedDate]: newCount,
          },
        };
      }
      return h;
    });
    setHabits(updated);
    StorageService.saveHabits(updated);
  };

  const handleResetHabitToday = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const currentCount = h.history[selectedDate] || 0;
        const droppedBelow = currentCount >= h.targetCount;
        const newHistory = { ...h.history };
        delete newHistory[selectedDate];

        return {
          ...h,
          streak: droppedBelow ? Math.max(0, (h.streak || 0) - 1) : h.streak,
          history: newHistory,
        };
      }
      return h;
    });
    setHabits(updated);
    StorageService.saveHabits(updated);
    showToast(t('habitCleared'), 'info');
  };

  const handleSaveHabit = (habitData: Omit<HabitItem, 'id' | 'history' | 'streak' | 'createdAt'> | HabitItem) => {
    let updated: HabitItem[];
    if ('id' in habitData) {
      updated = habits.map((h) => (h.id === habitData.id ? (habitData as HabitItem) : h));
      showToast(t('habitUpdated'), 'info');
    } else {
      const newHabit: HabitItem = {
        ...habitData,
        id: `habit_${Date.now()}`,
        history: {},
        streak: 0,
        createdAt: getTodayStr(),
      };
      updated = [...habits, newHabit];
      showToast(t('habitAdded'), 'success');
    }
    setHabits(updated);
    StorageService.saveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    StorageService.saveHabits(updated);
    showToast(t('habitDeleted'), 'info');
  };

  // Focus Handlers
  const handleRecordFocus = (record: Omit<FocusRecord, 'id'>, taskId?: string) => {
    const newRecord: FocusRecord = {
      ...record,
      id: `f_${Date.now()}`,
    };
    const updatedRecords = [newRecord, ...focusRecords];
    setFocusRecords(updatedRecords);
    StorageService.saveFocusRecords(updatedRecords);

    if (taskId) {
      const updatedTasks = tasks.map((t) => {
        if (t.id === taskId) {
          const dates = new Set(t.completedDates || []);
          dates.add(selectedDate);

          return {
            ...t,
            focusMinutes: (t.focusMinutes || 0) + record.durationMinutes,
            completed: t.repeat === 'none' ? true : t.completed,
            completedDates: Array.from(dates),
          };
        }
        return t;
      });
      setTasks(updatedTasks);
      StorageService.saveSchedules(updatedTasks);
    }

    showToast(t('focusRecorded').replace('{duration}', String(record.durationMinutes)), 'success');
  };

  // Apply Routine Template
  const handleApplyTemplate = (tpl: RoutineTemplate) => {
    const newTasks: ScheduleItem[] = tpl.tasks.map((t, idx) => ({
      ...t,
      title: language === 'zh' ? t.title : (t.titleEn || t.title),
      note: language === 'zh' ? t.note : (t.noteEn || t.note),
      id: `tpl_task_${Date.now()}_${idx}`,
      date: selectedDate,
      completed: false,
      completedDates: [],
      focusMinutes: 0,
    }));

    const newHabits: HabitItem[] = tpl.habits.map((h, idx) => ({
      ...h,
      title: language === 'zh' ? h.title : (h.titleEn || h.title),
      subtitle: language === 'zh' ? h.subtitle : (h.subtitleEn || h.subtitle),
      unit: language === 'zh' ? h.unit : (h.unitEn || h.unit),
      id: `tpl_habit_${Date.now()}_${idx}`,
      history: {},
      streak: 0,
      createdAt: getTodayStr(),
    }));

    const updatedTasks = [...newTasks, ...tasks];
    setTasks(updatedTasks);
    StorageService.saveSchedules(updatedTasks);

    const existingTitles = new Set(habits.map((h) => h.title));
    const nonDuplicatedHabits = newHabits.filter((h) => !existingTitles.has(h.title));
    const updatedHabits = [...habits, ...nonDuplicatedHabits];
    setHabits(updatedHabits);
    StorageService.saveHabits(updatedHabits);

    soundManager.playChime();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
    const templateTitle = language === 'zh' ? tpl.title : (tpl.titleEn || tpl.title);
    showToast(t('templateApplied').replace('{title}', templateTitle), 'success');
  };

  // AI Schedule Import Handler
  const handleImportAITasks = (newImportedTasks: ScheduleItem[]) => {
    const updatedTasks = [...newImportedTasks, ...tasks];
    setTasks(updatedTasks);
    StorageService.saveSchedules(updatedTasks);
  };

  // Transaction Handlers
  const handleSaveTransaction = (data: {
    id?: string;
    type: 'expense' | 'income';
    amount: number;
    category: string;
    categoryLabel: string;
    categoryLabelEn: string;
    date: string;
    note: string;
  }) => {
    let updated: TransactionItem[];
    if (data.id) {
      updated = transactions.map((tx) =>
        tx.id === data.id
          ? {
              ...tx,
              type: data.type,
              amount: data.amount,
              category: data.category,
              categoryLabel: data.categoryLabel,
              categoryLabelEn: data.categoryLabelEn,
              date: data.date,
              note: data.note,
            }
          : tx
      );
    } else {
      const newTx: TransactionItem = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: data.type,
        amount: data.amount,
        category: data.category,
        categoryLabel: data.categoryLabel,
        categoryLabelEn: data.categoryLabelEn,
        date: data.date,
        note: data.note,
        createdAt: new Date().toISOString(),
      };
      updated = [newTx, ...transactions];
    }
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    soundManager.playChime();
    showToast(t('saveTransSuccess'), 'success');
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    showToast(t('deleteSuccess'), 'info');
  };

  const handleQuickAdd = () => {
    HapticsService.light();
    if (activeTab === 'habits') {
      setEditingHabit(null);
      setIsHabitModalOpen(true);
    } else if (activeTab === 'finance') {
      setEditingTransaction(null);
      setIsTransactionModalOpen(true);
    } else {
      setEditingTask(null);
      setIsTaskModalOpen(true);
    }
  };

  const todayStr = getTodayStr();
  const todayTasks = tasks.filter((t) => isTaskActiveOnDate(t, todayStr));

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 flex items-center justify-center sm:p-4 select-none">
      {/* Outer Mobile Frame or Fullscreen Canvas */}
      <div
        className={`w-full bg-slate-50 dark:bg-slate-950 flex flex-col relative transition-all duration-300 ${
          isMobileFrame
            ? 'sm:max-w-md h-[100dvh] sm:h-[860px] sm:rounded-[44px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 dark:sm:border-slate-800 overflow-hidden'
            : 'max-w-2xl h-[100dvh] shadow-lg overflow-hidden'
        }`}
      >
        {isMobileFrame && (
          <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 z-40 items-center justify-center w-24 h-4 bg-slate-800 dark:bg-slate-900 rounded-full" />
        )}

        {/* Top Header */}
        <Header
          currentDate={selectedDate}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          totalStreak={totalStreak}
        />

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {/* Schedule Tab */}
          <div className={`flex-1 flex-col overflow-hidden min-h-0 relative ${activeTab === 'schedule' ? 'flex' : 'hidden'}`}>
            {/* Pinned Top Navigation & Filtering Controls (Fixed Aspect & Stability) */}
            <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 z-10 shadow-xs">
              <WeekCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                taskCountsByDate={taskCountsByDate}
              />

              {/* Search, AI Import & Category Filter Pills */}
              <div className="px-3.5 pt-2 pb-1 space-y-2">
                {/* Search Bar + AI Import Pill + New Task Button */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder={t('searchPlaceholder')}
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono transition"
                    />
                    {searchKeyword && (
                      <button
                        onClick={() => setSearchKeyword('')}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* AI Import Shortcut Button */}
                  <button
                    onClick={() => {
                      HapticsService.light();
                      setIsAIImportOpen(true);
                    }}
                    title={t('aiImport')}
                    className="shrink-0 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition active:scale-95 flex items-center space-x-1 font-mono"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{t('aiImport')}</span>
                  </button>

                  {/* New Task Button */}
                  <button
                    onClick={() => {
                      HapticsService.light();
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    title={t('newTaskBtn')}
                    className="shrink-0 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span className="hidden sm:inline">{t('newTaskBtn')}</span>
                  </button>
                </div>

                {/* Horizontal Category Filter Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all' as const, label: t('filterAll') },
                    { id: 'research' as const, label: `🎓 ${t('catResearch')}` },
                    { id: 'health' as const, label: `🫀 ${t('catHealth')}` },
                    { id: 'mind' as const, label: `✨ ${t('catMind')}` },
                    { id: 'work' as const, label: `💼 ${t('catWork')}` },
                    { id: 'rest' as const, label: `🌙 ${t('catRest')}` },
                    { id: 'life' as const, label: `☕ ${t('catLife')}` },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        HapticsService.selection();
                        setSelectedCategory(cat.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                        selectedCategory === cat.id
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="px-3.5 pt-1.5 pb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">
                    {selectedCategory !== 'all' || searchKeyword.trim() ? t('filteredTitle') : t('scheduleTitle')} ({filteredTasks.length} {t('scheduleItemsCount')})
                  </span>
                  <span className="text-xs sm:text-sm text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-full font-mono">
                    {t('deliveredCount')} {filteredTasks.filter((t) => isTaskCompleted(t, selectedDate)).length}
                  </span>
                  {(selectedCategory !== 'all' || searchKeyword.trim()) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchKeyword('');
                      }}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                    >
                      {t('resetFilter')}
                    </button>
                  )}
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setScheduleViewMode('timeline')}
                    className={`p-1.5 rounded-lg transition ${
                      scheduleViewMode === 'timeline'
                        ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={t('viewTimeline')}
                  >
                    <GitCommitHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setScheduleViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      scheduleViewMode === 'list'
                        ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={t('viewList')}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Schedule Body with Gutter Stabilization */}
            <div className="flex-1 overflow-y-auto min-h-0 stable-scroll">
              {scheduleViewMode === 'timeline' ? (
                <TimelineView
                  tasks={filteredTasks}
                  selectedDate={selectedDate}
                  isTaskCompleted={isTaskCompleted}
                  onToggleComplete={handleToggleComplete}
                  onStartFocus={handleStartFocus}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                />
              ) : (
                <TaskListView
                  tasks={filteredTasks}
                  selectedDate={selectedDate}
                  isTaskCompleted={isTaskCompleted}
                  onToggleComplete={handleToggleComplete}
                  onStartFocus={handleStartFocus}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                />
              )}
            </div>

            {/* Floating Quick Add FAB in Bottom-Right of Schedule Tab */}
            <div className="absolute bottom-4 right-4 z-20">
              <button
                onClick={() => {
                  HapticsService.light();
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                title={t('newTaskBtn')}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 via-emerald-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/35 hover:scale-105 active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Habits Tab */}
          <div className={`flex-1 flex-col overflow-y-auto px-4 py-3 space-y-3 stable-scroll ${activeTab === 'habits' ? 'flex' : 'hidden'}`}>
            <div className="flex items-center justify-between pb-1 shrink-0">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                  {t('maintenanceHeading')}
                </h2>
                <p className="text-xs text-slate-400">
                  {t('maintenanceSubheading')}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingHabit(null);
                  setIsHabitModalOpen(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('newMaintenanceBtn')}</span>
              </button>
            </div>

            <div className="space-y-3 pb-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  currentDate={selectedDate}
                  onIncrement={handleIncrementHabit}
                  onDecrement={handleDecrementHabit}
                  onResetToday={handleResetHabitToday}
                  onEditHabit={(h) => {
                    setEditingHabit(h);
                    setIsHabitModalOpen(true);
                  }}
                  onDeleteHabit={handleDeleteHabit}
                />
              ))}
            </div>
          </div>

          {/* Finance Tab (Daily Bookkeeping) */}
          <div className={`flex-1 flex-col min-h-0 relative ${activeTab === 'finance' ? 'flex' : 'hidden'}`}>
            <FinanceTab
              transactions={transactions}
              onAddTransaction={() => {
                setEditingTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onEditTransaction={(item) => {
                setEditingTransaction(item);
                setIsTransactionModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              selectedCalendarDate={selectedDate}
            />
          </div>

          {/* Mind Oasis (Relaxation Mini-Games) Tab */}
          <div className={`flex-1 flex-col overflow-y-auto stable-scroll ${activeTab === 'focus' ? 'flex' : 'hidden'}`}>
            <MindOasis />
          </div>

          {/* Stats Tab */}
          <div className={`flex-1 flex-col overflow-y-auto stable-scroll ${activeTab === 'stats' ? 'flex' : 'hidden'}`}>
            <StatsOverview
              tasks={tasks}
              habits={habits}
              focusRecords={focusRecords}
              currentDate={selectedDate}
              isTaskCompleted={isTaskCompleted}
              isTaskActiveOnDate={isTaskActiveOnDate}
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onQuickAdd={handleQuickAdd}
        />

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          initialTask={editingTask}
          defaultDate={selectedDate}
        />

        <HabitModal
          isOpen={isHabitModalOpen}
          onClose={() => {
            setIsHabitModalOpen(false);
            setEditingHabit(null);
          }}
          onSave={handleSaveHabit}
          initialHabit={editingHabit}
        />

        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => {
            setIsTransactionModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          onDelete={handleDeleteTransaction}
          initialData={editingTransaction}
          defaultDate={selectedDate}
        />

        <TemplateLibraryModal
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
          onApplyTemplate={handleApplyTemplate}
        />

        <AIScheduleImportModal
          isOpen={isAIImportOpen}
          onClose={() => setIsAIImportOpen(false)}
          targetDate={selectedDate}
          onImportTasks={handleImportAITasks}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          tasks={tasks}
          habits={habits}
          focusRecords={focusRecords}
          onDataRestored={loadData}
        />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ToastProvider>
  );
};

export default App;
