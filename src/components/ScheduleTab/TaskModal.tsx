import React, { useState, useEffect } from 'react';
import { X, Clock, Repeat, Flag, Tag, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { ScheduleItem, Category, Priority, RecurrenceType } from '../../types';
import { CATEGORY_CONFIG } from './TaskItemCard';
import { getTodayStr, parseLocalDate, formatDate } from '../../utils/date';
import { useLanguage } from '../../i18n/LanguageContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<ScheduleItem, 'id'> | ScheduleItem) => void;
  initialTask?: ScheduleItem | null;
  defaultDate: string;
}

const PRESET_QUICK_TASKS_ZH = [
  { title: '文献精读与理论推演 · 90m单线程', category: 'research' as Category, start: '09:30', end: '11:00', prio: 'p0' as Priority },
  { title: '核心代码与论文实验攻坚 · 90m心流', category: 'research' as Category, start: '10:45', end: '12:15', prio: 'p0' as Priority },
  { title: '午后 NSDR 神经快充 · 15m闭目', category: 'rest' as Category, start: '13:30', end: '13:50', prio: 'p1' as Priority },
  { title: '异步沟通与工作邮件批量处理', category: 'work' as Category, start: '14:00', end: '14:45', prio: 'p1' as Priority },
  { title: '颈椎拉伸 & 护眼远眺 20-20-20', category: 'health' as Category, start: '15:30', end: '15:45', prio: 'p1' as Priority },
  { title: '下班交接便签 & 心理物理断联', category: 'life' as Category, start: '18:30', end: '19:00', prio: 'p0' as Priority },
];

const PRESET_QUICK_TASKS_EN = [
  { title: 'Literature Deep Reading · 90m Sprint', category: 'research' as Category, start: '09:30', end: '11:00', prio: 'p0' as Priority },
  { title: 'Core Code & Model Experiments · 90m Flow', category: 'research' as Category, start: '10:45', end: '12:15', prio: 'p0' as Priority },
  { title: 'Afternoon NSDR Power Recharge · 15m Rest', category: 'rest' as Category, start: '13:30', end: '13:50', prio: 'p1' as Priority },
  { title: 'Async Inbox & Team Communication Sync', category: 'work' as Category, start: '14:00', end: '14:45', prio: 'p1' as Priority },
  { title: 'Cervical Spine Stretch & 20-20-20 Distant View', category: 'health' as Category, start: '15:30', end: '15:45', prio: 'p1' as Priority },
  { title: 'Evening Wrap-Up & Digital Disconnect', category: 'life' as Category, start: '18:30', end: '19:00', prio: 'p0' as Priority },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate,
}) => {
  const { language, t } = useLanguage();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('research');
  const [priority, setPriority] = useState<Priority>('p0');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('11:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeat, setRepeat] = useState<RecurrenceType>('none');
  const [note, setNote] = useState('');

  const presetList = language === 'zh' ? PRESET_QUICK_TASKS_ZH : PRESET_QUICK_TASKS_EN;

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setDate(initialTask.date);
      setStartTime(initialTask.startTime);
      setEndTime(initialTask.endTime);
      setIsAllDay(initialTask.isAllDay);
      setRepeat(initialTask.repeat);
      setNote(initialTask.note || '');
    } else {
      setTitle('');
      setCategory('research');
      setPriority('p0');
      setDate(defaultDate);
      setStartTime('09:30');
      setEndTime('11:00');
      setIsAllDay(false);
      setRepeat('none');
      setNote('');
    }
  }, [initialTask, defaultDate, isOpen]);

  if (!isOpen) return null;

  const todayStr = getTodayStr();
  const tomorrowStr = (() => {
    const d = parseLocalDate(todayStr);
    d.setDate(d.getDate() + 1);
    return formatDate(d);
  })();
  const dayAfterTomorrowStr = (() => {
    const d = parseLocalDate(todayStr);
    d.setDate(d.getDate() + 2);
    return formatDate(d);
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalEnd = endTime;
    if (!isAllDay && endTime < startTime) {
      finalEnd = startTime;
    }

    if (initialTask) {
      onSave({
        ...initialTask,
        title: title.trim(),
        category,
        priority,
        date,
        startTime,
        endTime: finalEnd,
        isAllDay,
        repeat,
        note: note.trim(),
      });
    } else {
      onSave({
        title: title.trim(),
        category,
        priority,
        date,
        startTime,
        endTime: finalEnd,
        isAllDay,
        repeat,
        note: note.trim(),
        completed: false,
        completedDates: [],
        focusMinutes: 0,
      });
    }
    onClose();
  };

  const handleApplyPreset = (preset: typeof presetList[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setStartTime(preset.start);
    setEndTime(preset.end);
    setPriority(preset.prio);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {initialTask ? t('taskModalEdit') : t('taskModalNew')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Preset quick pills */}
          {!initialTask && (
            <div>
              <div className="flex items-center space-x-1 text-xs text-slate-400 mb-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span>{t('presetAcademicPill')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presetList.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 text-slate-600 dark:text-slate-300 transition"
                  >
                    + {preset.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('taskTitleRequired')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('taskTitlePlaceholder')}
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Date Picker Row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{t('taskDateLabel')}</span>
              </label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setDate(todayStr)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition ${
                    date === todayStr
                      ? 'bg-teal-500 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('todayPill')}
                </button>
                <button
                  type="button"
                  onClick={() => setDate(tomorrowStr)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition ${
                    date === tomorrowStr
                      ? 'bg-teal-500 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('tomorrowPill')}
                </button>
                <button
                  type="button"
                  onClick={() => setDate(dayAfterTomorrowStr)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition ${
                    date === dayAfterTomorrowStr
                      ? 'bg-teal-500 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t('afterTomorrowPill')}
                </button>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {t('categorySection')}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map((catKey) => {
                const conf = CATEGORY_CONFIG[catKey];
                const Icon = conf.icon;
                const isSelected = category === catKey;
                const catLabel = language === 'zh' ? conf.label : conf.labelEn;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => setCategory(catKey)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{catLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & All-day row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('taskTimeRange')}</span>
              </label>
              <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded text-teal-500 focus:ring-teal-400"
                />
                <span>{t('allDayPill')}</span>
              </label>
            </div>

            {!isAllDay && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">{t('startTime')}</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">{t('endTime')}</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Priority & Repetition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
                <Flag className="w-3.5 h-3.5" />
                <span>{t('prioritySection')}</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="p0">{t('priorityP0')}</option>
                <option value="p1">{t('priorityP1')}</option>
                <option value="p2">{t('priorityP2')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
                <Repeat className="w-3.5 h-3.5" />
                <span>{t('repeatSection')}</span>
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="none">{t('repeatNone')}</option>
                <option value="daily">{t('repeatDaily')}</option>
                <option value="workdays">{t('repeatWorkdays')}</option>
                <option value="weekends">{t('repeatWeekends')}</option>
                <option value="weekly">{t('repeatWeekly')}</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{t('protocolLabel')}</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('protocolPlaceholder')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white text-xs font-semibold shadow-md shadow-teal-500/30 hover:opacity-95 transition"
            >
              {t('saveTaskBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
