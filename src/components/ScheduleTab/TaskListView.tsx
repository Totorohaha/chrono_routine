import React from 'react';
import { ScheduleItem } from '../../types';
import { TaskItemCard } from './TaskItemCard';
import { Sunrise, Zap, Coffee, Moon, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface TaskListViewProps {
  tasks: ScheduleItem[];
  selectedDate: string;
  isTaskCompleted: (task: ScheduleItem, date: string) => boolean;
  onToggleComplete: (task: ScheduleItem, date: string) => void;
  onStartFocus: (task: ScheduleItem) => void;
  onEditTask: (task: ScheduleItem) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  selectedDate,
  isTaskCompleted,
  onToggleComplete,
  onStartFocus,
  onEditTask,
  onDeleteTask,
}) => {
  const { t } = useLanguage();

  const morningTasks = tasks.filter((t) => !t.isAllDay && t.startTime < '09:30');
  const deepWorkTasks = tasks.filter((t) => !t.isAllDay && t.startTime >= '09:30' && t.startTime < '13:00');
  const afternoonTasks = tasks.filter((t) => !t.isAllDay && t.startTime >= '13:00' && t.startTime < '18:00');
  const eveningTasks = tasks.filter((t) => !t.isAllDay && t.startTime >= '18:00');
  const allDayTasks = tasks.filter((t) => t.isAllDay);

  const sections = [
    { 
      title: t('phaseMorning'), 
      subtitle: t('phaseMorningSub'), 
      icon: Sunrise, 
      tasks: morningTasks, 
      color: 'text-amber-500' 
    },
    { 
      title: t('phaseDeepWork'), 
      subtitle: t('phaseDeepWorkSub'), 
      icon: Zap, 
      tasks: deepWorkTasks, 
      color: 'text-teal-500' 
    },
    { 
      title: t('phaseAfternoon'), 
      subtitle: t('phaseAfternoonSub'), 
      icon: Coffee, 
      tasks: afternoonTasks, 
      color: 'text-orange-400' 
    },
    { 
      title: t('phaseEvening'), 
      subtitle: t('phaseEveningSub'), 
      icon: Moon, 
      tasks: eveningTasks, 
      color: 'text-indigo-400' 
    },
    { 
      title: t('phaseAllDay'), 
      subtitle: t('phaseAllDaySub'), 
      icon: Sparkles, 
      tasks: allDayTasks, 
      color: 'text-slate-400' 
    },
  ].filter((s) => s.tasks.length > 0);

  if (tasks.length === 0) {
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
    <div className="space-y-4 px-3 py-2 pb-8">
      {sections.map((section) => {
        const Icon = section.icon;
        const completedCount = section.tasks.filter((task) => isTaskCompleted(task, selectedDate)).length;

        return (
          <div key={section.title} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-baseline space-x-1.5 min-w-0 flex-1 mr-2">
                <Icon className={`w-4 h-4 ${section.color} shrink-0 self-center`} />
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                  {section.title}
                </h3>
                <span className="text-xs text-slate-400 truncate hidden sm:inline">
                  {section.subtitle}
                </span>
              </div>
              <span className="text-xs text-teal-700 dark:text-teal-400 font-mono font-medium px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200/40 dark:border-teal-800/40 shrink-0">
                {completedCount}/{section.tasks.length} {t('deliveredCount')}
              </span>
            </div>

            <div className="space-y-2">
              {section.tasks.map((task) => (
                <TaskItemCard
                  key={task.id}
                  task={task}
                  isCompleted={isTaskCompleted(task, selectedDate)}
                  onToggleComplete={() => onToggleComplete(task, selectedDate)}
                  onStartFocus={onStartFocus}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
