import React from 'react';
import { 
  Briefcase, 
  HeartPulse, 
  Sparkles, 
  Coffee, 
  Moon, 
  Clock, 
  Check, 
  Trash2, 
  Pencil,
  GraduationCap
} from 'lucide-react';
import { ScheduleItem, Category, Priority } from '../../types';
import { HapticsService } from '../../services/haptics';
import { useLanguage } from '../../i18n/LanguageContext';

interface TaskItemCardProps {
  task: ScheduleItem;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onStartFocus?: (task: ScheduleItem) => void;
  onEditTask: (task: ScheduleItem) => void;
  onDeleteTask: (id: string) => void;
}

export const CATEGORY_CONFIG: Record<Category, { label: string; labelEn: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string }> = {
  research: { label: '科研攻坚', labelEn: 'Research', icon: GraduationCap, bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400' },
  health: { label: '身体充能', labelEn: 'Health', icon: HeartPulse, bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
  mind: { label: '脑雾清理', labelEn: 'Mind', icon: Sparkles, bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-400' },
  work: { label: '事务协同', labelEn: 'Work', icon: Briefcase, bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
  rest: { label: '深度休整', labelEn: 'Rest', icon: Moon, bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400' },
  life: { label: '生活节奏', labelEn: 'Life', icon: Coffee, bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
};

const PRIORITY_BADGE: Record<Priority, { label: string; labelEn: string; dot: string; text: string }> = {
  p0: { label: 'P0 核心攻坚', labelEn: 'P0 Core', dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400 font-bold' },
  p1: { label: 'P1 稳步推进', labelEn: 'P1 Steady', dot: 'bg-amber-400', text: 'text-slate-600 dark:text-slate-300' },
  p2: { label: 'P2 弹性机动', labelEn: 'P2 Flex', dot: 'bg-slate-300 dark:bg-slate-600', text: 'text-slate-400' },
};

export const TaskItemCard: React.FC<TaskItemCardProps> = ({
  task,
  isCompleted,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const { language, t } = useLanguage();

  const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.research;
  const CatIcon = cat.icon;
  const prio = PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.p1;

  const catLabel = language === 'zh' ? cat.label : cat.labelEn;
  const prioLabel = language === 'zh' ? prio.label : prio.labelEn;
  const taskTitle = language === 'zh' ? task.title : (task.titleEn || task.title);
  const taskNote = language === 'zh' ? task.note : (task.noteEn || task.note);

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 p-3 select-none ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md'
      }`}
    >
      <div className="flex items-start space-x-2.5">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            HapticsService.light();
            onToggleComplete();
          }}
          className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
            isCompleted
              ? 'bg-teal-500 text-white shadow-xs shadow-teal-500/30'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-teal-500'
          }`}
          title={isCompleted ? t('markUndone') : t('markDone')}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content clickable */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEditTask(task)}>
          <div className="flex items-center space-x-1.5 mb-1">
            <span
              title={taskTitle}
              className={`text-sm font-semibold truncate leading-snug tracking-tight ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {taskTitle}
            </span>
          </div>

          {/* Time & tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 leading-none">
            <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>
                {task.isAllDay ? t('allDay') : `${task.startTime} - ${task.endTime}`}
              </span>
            </div>

            {/* Category Pill */}
            <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md ${cat.bg} ${cat.text} font-medium text-[10px]`}>
              <CatIcon className="w-2.5 h-2.5" />
              <span>{catLabel}</span>
            </span>

            {/* Priority dot */}
            <span className={`inline-flex items-center space-x-1 text-[10px] ${prio.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
              <span>{prioLabel}</span>
            </span>

            {/* Focus time spent if any */}
            {(task.focusMinutes || 0) > 0 && (
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-medium">
                ⏱️ {task.focusMinutes}m
              </span>
            )}
          </div>

          {/* Note if present */}
          {taskNote && (
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 leading-normal font-mono">
              💡 {taskNote}
            </p>
          )}
        </div>

        {/* Action buttons: Edit & Delete */}
        <div className="flex items-center space-x-1 shrink-0 self-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              HapticsService.light();
              onEditTask(task);
            }}
            title={t('editTask')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              HapticsService.light();
              onDeleteTask(task.id);
            }}
            title={t('deleteTask')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
