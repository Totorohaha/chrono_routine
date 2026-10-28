import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { formatDate, parseLocalDate, getTodayStr } from '../../utils/date';
import { useLanguage } from '../../i18n/LanguageContext';
import { HapticsService } from '../../services/haptics';

interface WeekCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  taskCountsByDate: Record<string, { total: number; completed: number }>;
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedDate,
  onSelectDate,
  taskCountsByDate,
}) => {
  const { language, t } = useLanguage();
  const today = getTodayStr();

  // Get current week array (Monday to Sunday) centered around selectedDate
  const getWeekDates = () => {
    const cur = parseLocalDate(selectedDate);
    const day = cur.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(cur.getTime());
    monday.setDate(cur.getDate() + diffToMonday);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime());
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const weekDayNamesZh = ['一', '二', '三', '四', '五', '六', '日'];
  const weekDayNamesEn = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handlePrevWeek = () => {
    HapticsService.light();
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() - 7);
    onSelectDate(formatDate(d));
  };

  const handleNextWeek = () => {
    HapticsService.light();
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + 7);
    onSelectDate(formatDate(d));
  };

  const handleGoToday = () => {
    HapticsService.light();
    onSelectDate(today);
  };

  const currentLocal = parseLocalDate(selectedDate);

  const monthYearStr = language === 'zh'
    ? `${currentLocal.getFullYear()}年 ${currentLocal.getMonth() + 1}月`
    : `${monthsEn[currentLocal.getMonth()]} ${currentLocal.getFullYear()}`;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-4 py-2 select-none shrink-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevWeek}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition active:scale-95"
            title={t('prevWeek')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tight">
            {monthYearStr}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition active:scale-95"
            title={t('nextWeek')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {selectedDate !== today && (
          <button
            onClick={handleGoToday}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition active:scale-95 border border-teal-200/50 dark:border-teal-800/50 font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('todayPill')}</span>
          </button>
        )}
      </div>

      {/* 7 Days Row */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDates.map((d, index) => {
          const dateStr = formatDate(d);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const stats = taskCountsByDate[dateStr] || { total: 0, completed: 0 };
          const hasTasks = stats.total > 0;
          const allCompleted = hasTasks && stats.completed === stats.total;

          return (
            <button
              key={dateStr}
              onClick={() => {
                HapticsService.selection();
                onSelectDate(dateStr);
              }}
              className={`flex flex-col items-center py-2 px-0.5 rounded-2xl transition relative ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold ring-2 ring-teal-500/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className={`text-xs font-mono font-medium mb-0.5 ${
                isSelected ? 'text-teal-100' : isToday ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'
              }`}>
                {language === 'zh' ? weekDayNamesZh[index] : weekDayNamesEn[index]}
              </span>
              <span className={`text-sm sm:text-base font-bold font-mono ${isToday && !isSelected ? 'text-teal-600 dark:text-teal-400' : ''}`}>
                {d.getDate()}
              </span>

              {/* Status indicator dot */}
              <div className="h-1.5 flex items-center justify-center mt-0.5">
                {allCompleted ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-500'}`} />
                ) : hasTasks ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-teal-200' : 'bg-amber-400'}`} />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
