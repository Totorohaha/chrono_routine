import React from 'react';
import { ScheduleItem } from '../../types';
import { TaskItemCard } from './TaskItemCard';
import { getTodayStr } from '../../utils/date';
import { useLanguage } from '../../i18n/LanguageContext';

interface TimelineViewProps {
  tasks: ScheduleItem[];
  selectedDate: string;
  isTaskCompleted: (task: ScheduleItem, date: string) => boolean;
  onToggleComplete: (task: ScheduleItem, date: string) => void;
  onStartFocus: (task: ScheduleItem) => void;
  onEditTask: (task: ScheduleItem) => void;
  onDeleteTask: (id: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  selectedDate,
  isTaskCompleted,
  onToggleComplete,
  onStartFocus,
  onEditTask,
  onDeleteTask,
}) => {
  const { t } = useLanguage();
  const isToday = selectedDate === getTodayStr();

  // Current time representation for time indicator
  const currentTimeStr = React.useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
  }, []);

  // Sort tasks chronologically
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return a.startTime.localeCompare(b.startTime);
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3 shadow-xs">
          <span className="text-2xl">⚡</span>
        </div>
        <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">
          {t('noTasksTitle')}
        </p>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
          {t('noTasksDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="relative px-3 py-2">
      <div className="space-y-3">
        {sortedTasks.map((task, idx) => {
          const completed = isTaskCompleted(task, selectedDate);
          const isOngoing =
            isToday &&
            !completed &&
            !task.isAllDay &&
            task.startTime <= currentTimeStr &&
            task.endTime >= currentTimeStr;

          return (
            <div key={task.id} className="relative flex items-start space-x-2.5">
              {/* Left Time Column & Node */}
              <div className="w-12 pt-3 text-right flex flex-col items-end shrink-0">
                <span className={`text-[11px] font-mono font-semibold tracking-tight ${
                  isOngoing ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {task.isAllDay ? t('allDay') : task.startTime}
                </span>
                <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600">
                  {task.isAllDay ? '' : task.endTime}
                </span>
              </div>

              {/* Node Indicator */}
              <div className="pt-4 flex flex-col items-center shrink-0">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    completed
                      ? 'bg-teal-500 border-white dark:border-slate-900 shadow-xs'
                      : isOngoing
                      ? 'bg-teal-400 border-teal-200 ring-4 ring-teal-500/20 animate-pulse'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                  }`}
                />
                {idx < sortedTasks.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 my-1 min-h-[36px]" />
                )}
              </div>

              {/* Task Card */}
              <div className="flex-1 min-w-0">
                <TaskItemCard
                  task={task}
                  isCompleted={completed}
                  onToggleComplete={() => onToggleComplete(task, selectedDate)}
                  onStartFocus={onStartFocus}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
