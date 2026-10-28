import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Droplet, 
  BookOpen, 
  Coffee, 
  Moon, 
  Activity, 
  Sparkles, 
  Smile, 
  Sun, 
  Heart, 
  Smartphone, 
  Eye, 
  Plus, 
  Minus, 
  Check, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  RotateCcw, 
  Wind,
  GraduationCap
} from 'lucide-react';
import { HabitItem } from '../../types';
import { soundManager } from '../../services/audio';
import { HapticsService } from '../../services/haptics';
import { useClickOutside } from '../../hooks/useClickOutside';
import { parseLocalDate, formatDate } from '../../utils/date';
import { useLanguage } from '../../i18n/LanguageContext';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplet,
  BookOpen,
  Coffee,
  Moon,
  Activity,
  Sparkles,
  Smile,
  Sun,
  Heart,
  Smartphone,
  Eye,
  Wind,
  GraduationCap,
};

interface HabitCardProps {
  habit: HabitItem;
  currentDate: string;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onResetToday: (id: string) => void;
  onEditHabit: (habit: HabitItem) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  currentDate,
  onIncrement,
  onDecrement,
  onResetToday,
  onEditHabit,
  onDeleteHabit,
}) => {
  const { language, t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false));

  const IconComponent = ICON_MAP[habit.icon] || Sparkles;
  const currentCount = habit.history[currentDate] || 0;
  const isCompleted = currentCount >= habit.targetCount;
  const progressPercent = Math.min(100, Math.round((currentCount / habit.targetCount) * 100));

  const habitTitle = language === 'zh' ? habit.title : (habit.titleEn || habit.title);
  const habitSubtitle = language === 'zh' ? habit.subtitle : (habit.subtitleEn || habit.subtitle);
  const habitUnit = language === 'zh' ? habit.unit : (habit.unitEn || habit.unit);

  // 7-day consistency strip
  const last7Days = React.useMemo(() => {
    const list: { dateStr: string; dayLabel: string; isToday: boolean; isTargetMet: boolean; count: number }[] = [];
    const base = parseLocalDate(currentDate);
    const dayNamesZh = ['日', '一', '二', '三', '四', '五', '六'];
    const dayNamesEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dayNames = language === 'zh' ? dayNamesZh : dayNamesEn;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(base.getTime());
      d.setDate(base.getDate() - i);
      const str = formatDate(d);
      const c = habit.history[str] || 0;
      list.push({
        dateStr: str,
        dayLabel: dayNames[d.getDay()],
        isToday: str === currentDate,
        isTargetMet: c >= habit.targetCount,
        count: c,
      });
    }
    return list;
  }, [currentDate, habit.history, habit.targetCount, language]);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticsService.light();
    onIncrement(habit.id);
    
    if (currentCount + 1 >= habit.targetCount && currentCount < habit.targetCount) {
      soundManager.playChime();
      HapticsService.success();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#38bdf8'],
      });
    }
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticsService.light();
    onDecrement(habit.id);
  };

  return (
    <div
      className={`group relative rounded-2xl border p-3.5 transition-all duration-200 select-none ${
        isCompleted
          ? 'bg-teal-50/30 dark:bg-teal-950/20 border-teal-200/60 dark:border-teal-800/50 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
          {/* Habit Icon */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs transition-transform shrink-0"
            style={{ backgroundColor: habit.color || '#10b981' }}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-1.5 truncate leading-tight">
              <span className="truncate">{habitTitle}</span>
              {isCompleted && (
                <span className="inline-flex items-center text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                  {t('energyCharged')}
                </span>
              )}
            </h3>

            {habitSubtitle && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {habitSubtitle}
              </p>
            )}

            <div className="flex items-center space-x-2.5 mt-1 text-xs text-slate-400">
              <span className="flex items-center space-x-0.5 text-teal-600 dark:text-teal-400 font-medium shrink-0 font-mono text-[11px]">
                <span>⚡ {t('habitStreakPrefix')} {habit.streak} {t('habitStreakSuffix')}</span>
              </span>
              <span className="truncate text-[11px] font-mono">
                {t('habitTargetPrefix')}{habit.targetCount} {habitUnit}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {currentCount > 0 && (
            <button
              onClick={handleMinus}
              title={t('stepBackOne')}
              className="w-7 h-7 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition active:scale-90"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}

          <button
            onClick={handleTap}
            title={isCompleted ? t('markDone') : "+1"}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
              isCompleted
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-600 dark:text-slate-300 hover:text-teal-600'
            }`}
          >
            {isCompleted ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>

          {/* Menu with click-outside protection */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                {currentCount > 0 && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onResetToday(habit.id);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('clearTodayRecord')}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditHabit(habit);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('editHabitTitle')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteHabit(habit.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('removeHabitTitle')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2.5">
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
          <span>{t('todayStatusLabel')}</span>
          <span className="font-semibold font-mono text-slate-600 dark:text-slate-300">
            {currentCount} / {habit.targetCount} {habitUnit} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: habit.color || '#10b981',
            }}
          />
        </div>
      </div>

      {/* 7-Day Consistency Dot Matrix */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">{t('last7DaysLabel')}</span>
        <div className="flex items-center space-x-1.5">
          {last7Days.map((d) => (
            <div
              key={d.dateStr}
              title={`${d.dateStr} (${d.dayLabel}): ${d.count}/${habit.targetCount} ${habitUnit}`}
              className="flex flex-col items-center justify-center"
            >
              <span className={`text-[9px] mb-0.5 font-mono ${d.isToday ? 'font-bold text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
                {d.dayLabel}
              </span>
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  d.isTargetMet
                    ? 'text-white shadow-xs'
                    : d.count > 0
                    ? 'ring-1 ring-inset ring-teal-400/50 bg-teal-50 dark:bg-teal-950/40'
                    : 'bg-slate-100 dark:bg-slate-800'
                } ${d.isToday ? 'ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
                style={{
                  backgroundColor: d.isTargetMet ? (habit.color || '#10b981') : undefined,
                }}
              >
                {d.isTargetMet && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
