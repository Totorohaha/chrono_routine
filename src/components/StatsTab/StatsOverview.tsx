import React, { useState } from 'react';
import { 
  Smile, 
  Meh, 
  Frown, 
  TrendingUp,
  Save,
  BatteryCharging,
  Zap,
  Activity,
  CheckCircle2,
  Copy,
  FileSpreadsheet
} from 'lucide-react';
import { ScheduleItem, HabitItem, FocusRecord, DayReflection } from '../../types';
import { CATEGORY_CONFIG } from '../ScheduleTab/TaskItemCard';
import { StorageService } from '../../services/storage';
import { soundManager } from '../../services/audio';
import { HapticsService } from '../../services/haptics';
import { getTodayStr, formatDate, parseLocalDate } from '../../utils/date';
import { useToast } from '../UI/Toast';
import { useLanguage } from '../../i18n/LanguageContext';

interface StatsOverviewProps {
  tasks: ScheduleItem[];
  habits: HabitItem[];
  focusRecords: FocusRecord[];
  currentDate: string;
  isTaskCompleted: (task: ScheduleItem, date: string) => boolean;
  isTaskActiveOnDate: (task: ScheduleItem, date: string) => boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  tasks,
  habits,
  focusRecords,
  currentDate,
  isTaskCompleted,
  isTaskActiveOnDate,
}) => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [reflectionNote, setReflectionNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<'super' | 'good' | 'normal' | 'tired'>('good');
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing reflection
  React.useEffect(() => {
    const reflections = StorageService.getReflections();
    const existing = reflections[currentDate];
    if (existing) {
      setReflectionNote(existing.note);
      setSelectedMood(existing.mood);
      setEnergyLevel(existing.energyLevel || 4);
    } else {
      setReflectionNote('');
      setSelectedMood('good');
      setEnergyLevel(4);
    }
  }, [currentDate]);

  // Tasks active on current date
  const dayTasks = tasks.filter((t) => isTaskActiveOnDate(t, currentDate));
  const totalTasksCount = dayTasks.length;
  const completedTasksCount = dayTasks.filter((t) => isTaskCompleted(t, currentDate)).length;
  const taskRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 100;

  const totalHabitsCount = habits.length;
  const completedHabitsCount = habits.filter((h) => (h.history[currentDate] || 0) >= h.targetCount).length;
  const habitRate = totalHabitsCount > 0 ? (completedHabitsCount / totalHabitsCount) * 100 : 100;

  // Deep work and recharge time
  const dayFocusRecords = focusRecords.filter(
    (r) => r.date === currentDate || r.timestamp.startsWith(currentDate)
  );
  const totalFocusMinutes = dayFocusRecords.reduce((acc, r) => acc + r.durationMinutes, 0);

  // Cognitive Energy & Execution Score (0-100)
  const restBonus = Math.min(20, (totalFocusMinutes / 60) * 20);
  const balanceScore = Math.round(
    (totalTasksCount > 0 ? (taskRate * 0.4) : 40) +
    (totalHabitsCount > 0 ? (habitRate * 0.4) : 40) +
    restBonus
  );

  const getScoreGrade = (score: number) => {
    if (language === 'zh') {
      if (score >= 88) return { label: '心流巅峰 ⚡', tip: '认知效率处于最高区间，精力分配极其均衡' };
      if (score >= 70) return { label: '稳健交付 🚀', tip: '核心事项有序落地，身体维护到位' };
      if (score >= 50) return { label: '负荷平衡 🌱', tip: '保持节奏，避免长时间连续脑力消耗' };
      return { label: '蓄力休整 🔋', tip: '当前需要充足睡眠，注意及时关机休息' };
    } else {
      if (score >= 88) return { label: 'Flow Peak ⚡', tip: 'Optimal cognitive performance and balanced energy allocation' };
      if (score >= 70) return { label: 'Steady Delivery 🚀', tip: 'Core tasks on track with healthy physical maintenance' };
      if (score >= 50) return { label: 'Balanced Load 🌱', tip: 'Maintain steady pacing to prevent mental fatigue' };
      return { label: 'Recharge Mode 🔋', tip: 'Prioritize deep sleep and mental recovery today' };
    }
  };

  const grade = getScoreGrade(balanceScore);

  // Past 14 days activity heatmap generator
  const getHeatmapDays = () => {
    const days: { dateStr: string; dayNum: number; count: number }[] = [];
    const baseDate = parseLocalDate(currentDate);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(baseDate.getTime());
      d.setDate(baseDate.getDate() - i);
      const str = formatDate(d);

      const tComp = tasks.filter((t) => isTaskActiveOnDate(t, str) && isTaskCompleted(t, str)).length;
      const hComp = habits.filter((h) => (h.history[str] || 0) >= h.targetCount).length;
      days.push({
        dateStr: str,
        dayNum: d.getDate(),
        count: tComp + hComp,
      });
    }
    return days;
  };

  const heatmapDays = getHeatmapDays();

  // Category distribution
  const categoryStats: Record<string, number> = {};
  dayTasks.forEach((t) => {
    categoryStats[t.category] = (categoryStats[t.category] || 0) + 1;
  });

  const handleExportWeeklyReport = async () => {
    HapticsService.light();
    const baseDate = parseLocalDate(currentDate);
    const dayOfWeek = baseDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate.getTime());
    monday.setDate(baseDate.getDate() + diffToMonday);

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime());
      d.setDate(monday.getDate() + i);
      weekDates.push(formatDate(d));
    }
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];

    const completedWeekTasks: { task: ScheduleItem; date: string }[] = [];
    weekDates.forEach((dateStr) => {
      tasks.forEach((t) => {
        if (isTaskActiveOnDate(t, dateStr) && isTaskCompleted(t, dateStr)) {
          completedWeekTasks.push({ task: t, date: dateStr });
        }
      });
    });

    const weekFocusRecords = focusRecords.filter((r) => weekDates.includes(r.date) || weekDates.some(w => r.timestamp.startsWith(w)));
    const totalWeekFocusMinutes = weekFocusRecords.reduce((acc, r) => acc + r.durationMinutes, 0);
    const weekFocusHours = (totalWeekFocusMinutes / 60).toFixed(1);

    const p0Tasks = completedWeekTasks.filter((item) => item.task.priority === 'p0');
    const p1Tasks = completedWeekTasks.filter((item) => item.task.priority === 'p1');

    let md = '';
    if (language === 'zh') {
      md += `### 🌿 脉律 PulseFlow · 本周个人精力与心流复盘\n`;
      md += `> **复盘周期**: ${weekStart} ~ ${weekEnd} (本周共完成 ${completedWeekTasks.length} 项日程)\n\n`;

      md += `#### 🎯 核心要事回顾 (P0)\n`;
      if (p0Tasks.length === 0) {
        md += `- 本周未设置独立 P0 事项，整体节奏平稳蓄力\n`;
      } else {
        const uniqueTitles = Array.from(new Set(p0Tasks.map((i) => i.task.title)));
        uniqueTitles.forEach((title) => {
          md += `- [x] ${title}\n`;
        });
      }

      md += `\n#### 🚀 进阶推进与日常交付 (P1)\n`;
      if (p1Tasks.length === 0) {
        md += `- 暂无独立 P1 事项\n`;
      } else {
        const uniqueTitles = Array.from(new Set(p1Tasks.map((i) => i.task.title)));
        uniqueTitles.slice(0, 8).forEach((title) => {
          md += `- [x] ${title}\n`;
        });
        if (uniqueTitles.length > 8) {
          md += `- *(及其他 ${uniqueTitles.length - 8} 项稳步推进事项)*\n`;
        }
      }

      md += `\n#### ⏱️ 心流投入与习惯自律\n`;
      md += `- **深度心流累计**: ${weekFocusHours} 小时 (${totalWeekFocusMinutes} 分钟)\n`;
      md += `- **习惯维护连续性**: 当前最高连续维持 ${habits.length > 0 ? Math.max(0, ...habits.map((h) => h.streak || 0)) : 0} 天\n`;
      md += `\n#### 💡 给自己的周度寄语\n`;
      md += `- 遵循个人超昼夜节律，在精力波峰攻坚、波谷沉淀休息。每一次平静心流都是对自我的积淀，下周继续保持节奏！\n`;
      md += `\n---\n*由「脉律 PulseFlow」生成 · 专注自我成长与认知能量管理*`;
    } else {
      md += `### 🌿 PulseFlow · Weekly Personal Energy & Flow Review\n`;
      md += `> **Review Period**: ${weekStart} ~ ${weekEnd} (${completedWeekTasks.length} items completed this week)\n\n`;

      md += `#### 🎯 Core Milestones Review (P0)\n`;
      if (p0Tasks.length === 0) {
        md += `- No independent P0 items logged this week; focused on steady baseline progression\n`;
      } else {
        const uniqueTitles = Array.from(new Set(p0Tasks.map((i) => i.task.title)));
        uniqueTitles.forEach((title) => {
          md += `- [x] ${title}\n`;
        });
      }

      md += `\n#### 🚀 Key Progression & Deliverables (P1)\n`;
      if (p1Tasks.length === 0) {
        md += `- None\n`;
      } else {
        const uniqueTitles = Array.from(new Set(p1Tasks.map((i) => i.task.title)));
        uniqueTitles.slice(0, 8).forEach((title) => {
          md += `- [x] ${title}\n`;
        });
        if (uniqueTitles.length > 8) {
          md += `- *(plus ${uniqueTitles.length - 8} more completed tasks)*\n`;
        }
      }

      md += `\n#### ⏱️ Focus Time & Habit Consistency\n`;
      md += `- **Cumulative Deep Flow**: ${weekFocusHours} hours (${totalWeekFocusMinutes} mins)\n`;
      md += `- **Top Habit Consistency**: ${habits.length > 0 ? Math.max(0, ...habits.map((h) => h.streak || 0)) : 0} days streak\n`;
      md += `\n#### 💡 Personal Reflection Note\n`;
      md += `- Honor your natural circadian rhythm—sprint during energetic peaks, recharge during troughs. Carry this steady momentum into the upcoming week.\n`;
      md += `\n---\n*Generated by PulseFlow · Personal Growth & Circadian Alignment*`;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(md);
      } else {
        const ta = document.createElement('textarea');
        ta.value = md;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      soundManager.playChime();
      HapticsService.success();
      showToast(t('weeklyReportSuccess'), 'success');
    } catch {
      showToast('复制失败，请重试', 'warning');
    }
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    const ref: DayReflection = {
      date: currentDate,
      mood: selectedMood,
      energyLevel,
      note: reflectionNote.trim(),
    };
    StorageService.saveReflection(currentDate, ref);
    setSavedSuccess(true);
    soundManager.playChime();
    HapticsService.success();
    showToast(language === 'zh' ? '已保存今日科研/工作复盘笔记' : 'Daily retro note saved successfully', 'success');
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="px-4 py-3 w-full max-w-2xl mx-auto space-y-3.5 select-none pb-4">
      {/* Score Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-5 shadow-xl shadow-teal-900/20 border border-teal-600/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200 font-mono">
              {t('dailyScoreTitle')}
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md font-mono">
            {grade.label}
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-5xl font-black tracking-tight font-mono">
            {balanceScore}
          </span>
          <span className="text-teal-300 text-sm font-semibold font-mono">/ 100</span>
        </div>

        <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">
          {grade.tip}
        </p>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center font-mono">
          <div>
            <span className="text-xs text-teal-200 block truncate">{t('tasksDeliveredMetric')}</span>
            <span className="font-bold text-lg">
              {completedTasksCount}/{totalTasksCount}
            </span>
          </div>
          <div>
            <span className="text-xs text-teal-200 block truncate">{t('statusMaintainedMetric')}</span>
            <span className="font-bold text-lg">
              {completedHabitsCount}/{totalHabitsCount}
            </span>
          </div>
          <div>
            <span className="text-xs text-teal-200 block truncate">{t('focusTimeMetric')}</span>
            <span className="font-bold text-lg">{totalFocusMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Weekly Report Standup Generator Button */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 rounded-2xl p-3.5 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-between">
        <div className="min-w-0 pr-3">
          <h4 className="text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-200 flex items-center space-x-1.5 font-mono">
            <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="truncate">{t('weeklyStandupTitle')}</span>
          </h4>
          <p className="text-xs text-teal-700/80 dark:text-teal-400/80 mt-0.5 truncate">
            {t('weeklyStandupSub')}
          </p>
        </div>
        <button
          onClick={handleExportWeeklyReport}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center space-x-1 transition font-mono"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{t('copyWeeklyReportBtn')}</span>
        </button>
      </div>

      {/* 14-day Heatmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 font-mono">
            <Activity className="w-4 h-4 text-teal-500 shrink-0" />
            <span className="truncate">{t('heatmapTitle')}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono shrink-0">{t('heatmapHigh')}</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {heatmapDays.map((d) => {
            const isToday = d.dateStr === getTodayStr();
            const intensity =
              d.count === 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                : d.count <= 2
                ? 'bg-teal-100 dark:bg-teal-950 text-teal-700'
                : d.count <= 4
                ? 'bg-teal-300 dark:bg-teal-800 text-teal-900 dark:text-white'
                : 'bg-teal-600 dark:bg-teal-500 text-white font-bold shadow-xs';

            return (
              <div
                key={d.dateStr}
                title={`${d.dateStr}: ${d.count}`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${intensity} ${
                  isToday ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                }`}
              >
                <span className="text-xs font-mono font-medium">{d.dayNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      {dayTasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">
            <TrendingUp className="w-4 h-4 text-teal-500 shrink-0" />
            <span>{t('timeAllocationTitle')}</span>
          </div>

          <div className="space-y-2">
            {Object.entries(categoryStats).map(([catKey, count]) => {
              const conf = CATEGORY_CONFIG[catKey as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.research;
              const percent = Math.round((count / dayTasks.length) * 100);
              const label = language === 'zh' ? conf.label : conf.labelEn;

              return (
                <div key={catKey}>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                    <span>{label}</span>
                    <span className="font-mono text-slate-400">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Retrospective Note */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>{t('dailyRetroTitle')}</span>
          </div>
          {savedSuccess && (
            <span className="text-xs text-teal-600 font-semibold animate-pulse">
              {t('retroSaved')}
            </span>
          )}
        </div>

        {/* Cognitive Energy Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span className="flex items-center space-x-1">
              <BatteryCharging className="w-4 h-4 text-teal-500" />
              <span>{t('cognitiveBattery')}</span>
            </span>
            <span className="font-semibold text-teal-600">{energyLevel * 20}%</span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setEnergyLevel(lvl)}
                className={`flex-1 h-2.5 rounded-full transition-all ${
                  lvl <= energyLevel ? 'bg-teal-500' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mental focus state */}
        <div>
          <span className="text-xs text-slate-400 block mb-1 font-mono">{t('mentalStateLabel')}</span>
          <div className="flex items-center justify-around py-1">
            {[
              { id: 'super' as const, label: t('moodFlow'), icon: Zap, color: 'text-amber-500' },
              { id: 'good' as const, label: t('moodSteady'), icon: Smile, color: 'text-teal-500' },
              { id: 'normal' as const, label: t('moodStuck'), icon: Meh, color: 'text-blue-500' },
              { id: 'tired' as const, label: t('moodBurnout'), icon: Frown, color: 'text-rose-400' },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.id)}
                  className={`flex flex-col items-center p-2 rounded-xl transition ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${m.color}`} />
                  <span className="text-xs">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSaveReflection} className="space-y-2 pt-1">
          <textarea
            rows={2}
            value={reflectionNote}
            onChange={(e) => setReflectionNote(e.target.value)}
            placeholder={t('retroPlaceholder')}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono placeholder:text-slate-400 resize-none"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-semibold flex items-center justify-center space-x-1 transition active:scale-95 font-mono"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('saveRetroBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
