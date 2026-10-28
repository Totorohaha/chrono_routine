import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  Check
} from 'lucide-react';
import { HabitItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<HabitItem, 'id' | 'history' | 'streak' | 'createdAt'> | HabitItem) => void;
  initialHabit?: HabitItem | null;
}

const AVAILABLE_ICONS = [
  { name: 'Sun', key: 'iconSun' as const, icon: Sun },
  { name: 'Droplet', key: 'iconDroplet' as const, icon: Droplet },
  { name: 'Wind', key: 'iconWind' as const, icon: Wind },
  { name: 'Activity', key: 'iconActivity' as const, icon: Activity },
  { name: 'Moon', key: 'iconMoon' as const, icon: Moon },
  { name: 'Heart', key: 'iconHeart' as const, icon: Heart },
  { name: 'Coffee', key: 'iconCoffee' as const, icon: Coffee },
  { name: 'BookOpen', key: 'iconBookOpen' as const, icon: BookOpen },
  { name: 'Sparkles', key: 'iconSparkles' as const, icon: Sparkles },
  { name: 'Smile', key: 'iconSmile' as const, icon: Smile },
  { name: 'Smartphone', key: 'iconSmartphone' as const, icon: Smartphone },
  { name: 'Eye', key: 'iconEye' as const, icon: Eye },
];

const AVAILABLE_COLORS = [
  '#10b981', // sage emerald
  '#06b6d4', // cyan water
  '#3b82f6', // sky blue
  '#8b5cf6', // gentle purple
  '#f59e0b', // morning amber
  '#ec4899', // rose
  '#6366f1', // soft indigo
  '#14b8a6', // soothing teal
];

const PRESET_HABITS_ZH = [
  { title: '晨光采光 15分钟', subtitle: '校准体内生物钟主时钟', icon: 'Sun', color: '#f59e0b', target: 1, unit: '次' },
  { title: '温水慢饮润体', subtitle: '细胞与新陈代谢自然唤醒', icon: 'Droplet', color: '#06b6d4', target: 6, unit: '杯' },
  { title: '4-7-8 舒缓深呼吸', subtitle: '平复副交感神经与紧绷感', icon: 'Wind', color: '#10b981', target: 2, unit: '次' },
  { title: '久坐舒展与远眺', subtitle: '每90分钟给身体一次喘息', icon: 'Activity', color: '#3b82f6', target: 4, unit: '次' },
  { title: '睡前 1小时远离屏幕', subtitle: '留出无蓝光安心入眠缓冲期', icon: 'Moon', color: '#8b5cf6', target: 1, unit: '次' },
  { title: '日常感恩三件小事', subtitle: '关注微小美好，促进心理韧性', icon: 'Heart', color: '#ec4899', target: 1, unit: '次' },
];

const PRESET_HABITS_EN = [
  { title: 'Morning Sunlight 15m', subtitle: 'Calibrate master circadian clock', icon: 'Sun', color: '#f59e0b', target: 1, unit: 'times' },
  { title: 'Hydration & Warm Water', subtitle: 'Awaken metabolic and cellular vitality', icon: 'Droplet', color: '#06b6d4', target: 6, unit: 'cups' },
  { title: '4-7-8 Resonance Breath', subtitle: 'Activate parasympathetic calm', icon: 'Wind', color: '#10b981', target: 2, unit: 'times' },
  { title: 'Sedentary Spine Stretch & Eye Rest', subtitle: 'Body reset every 90 minutes', icon: 'Activity', color: '#3b82f6', target: 4, unit: 'times' },
  { title: 'Screen-Free 1h Before Sleep', subtitle: 'Low-light buffer for melatonin release', icon: 'Moon', color: '#8b5cf6', target: 1, unit: 'times' },
  { title: 'Daily Gratitude Notes', subtitle: 'Nurture mental resilience and calm', icon: 'Heart', color: '#ec4899', target: 1, unit: 'times' },
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const { language, t } = useLanguage();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [icon, setIcon] = useState('Sun');
  const [color, setColor] = useState('#10b981');
  const [targetCount, setTargetCount] = useState(1);
  const [unit, setUnit] = useState('次');
  const [frequency, setFrequency] = useState<'daily' | 'workdays' | 'weekends'>('daily');

  const presetHabits = language === 'zh' ? PRESET_HABITS_ZH : PRESET_HABITS_EN;

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setSubtitle(initialHabit.subtitle || '');
      setIcon(initialHabit.icon);
      setColor(initialHabit.color);
      setTargetCount(initialHabit.targetCount);
      setUnit(initialHabit.unit);
      setFrequency(initialHabit.frequency);
    } else {
      setTitle('');
      setSubtitle('');
      setIcon('Sun');
      setColor('#10b981');
      setTargetCount(1);
      setUnit(language === 'zh' ? '次' : 'times');
      setFrequency('daily');
    }
  }, [initialHabit, isOpen, language]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const fallbackUnit = language === 'zh' ? '次' : 'times';

    if (initialHabit) {
      onSave({
        ...initialHabit,
        title: title.trim(),
        subtitle: subtitle.trim(),
        icon,
        color,
        targetCount: Number(targetCount) || 1,
        unit: unit.trim() || fallbackUnit,
        frequency,
      });
    } else {
      onSave({
        title: title.trim(),
        subtitle: subtitle.trim(),
        icon,
        color,
        targetCount: Number(targetCount) || 1,
        unit: unit.trim() || fallbackUnit,
        frequency,
      });
    }
    onClose();
  };

  const handleApplyPreset = (p: typeof presetHabits[0]) => {
    setTitle(p.title);
    setSubtitle(p.subtitle);
    setIcon(p.icon);
    setColor(p.color);
    setTargetCount(p.target);
    setUnit(p.unit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {initialHabit ? t('habitModalEdit') : t('habitModalNew')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick preset chips */}
          {!initialHabit && (
            <div>
              <span className="block text-xs font-semibold text-slate-400 mb-1.5">
                {t('habitModalPresets')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presetHabits.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 transition"
                  >
                    + {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('habitNameLabel')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('habitNamePlaceholder')}
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Subtitle / Meaning */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('habitMeaningLabel')}
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={t('habitMeaningPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {t('habitIconLabel')}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] mt-1 truncate">{t(item.key)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {t('habitColorPalette')}
            </label>
            <div className="flex items-center space-x-3">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Target Count & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('habitTargetLabel')}
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('habitUnitLabel')}
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t('habitUnitPlaceholder')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('habitCycleLabel')}
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'workdays' | 'weekends')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="daily">{t('cycleDaily')}</option>
              <option value="workdays">{t('cycleWorkdays')}</option>
              <option value="weekends">{t('cycleWeekends')}</option>
            </select>
          </div>

          {/* Actions */}
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/30 hover:opacity-95 transition"
            >
              {t('saveHabitBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
