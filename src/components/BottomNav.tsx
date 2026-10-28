import React from 'react';
import { Calendar, Zap, Wind, BarChart3, Plus } from 'lucide-react';
import { HapticsService } from '../services/haptics';
import { useLanguage } from '../i18n/LanguageContext';

export type ActiveTab = 'schedule' | 'habits' | 'focus' | 'stats';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onQuickAdd,
}) => {
  const { t } = useLanguage();

  const handleTabClick = (tab: ActiveTab) => {
    HapticsService.selection();
    onChangeTab(tab);
  };

  return (
    <nav className="w-full shrink-0 z-30 px-3 pb-safe pt-1">
      <div className="mx-auto max-w-sm mb-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-2xl px-2 py-1.5 flex items-center justify-around transition-colors">
        {/* Schedule */}
        <button
          onClick={() => handleTabClick('schedule')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
            activeTab === 'schedule'
              ? 'text-teal-600 dark:text-teal-400 font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] truncate max-w-[64px]">{t('navSchedule')}</span>
        </button>

        {/* Maintenance / Habits */}
        <button
          onClick={() => handleTabClick('habits')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
            activeTab === 'habits'
              ? 'text-teal-600 dark:text-teal-400 font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Zap className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] truncate max-w-[64px]">{t('navHabits')}</span>
        </button>

        {/* Center Floating Action Button */}
        <div className="relative -top-4 px-1">
          <button
            onClick={onQuickAdd}
            title={t('quickAdd')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 via-emerald-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/35 hover:shadow-teal-500/50 active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Brain Fog / Recharge */}
        <button
          onClick={() => handleTabClick('focus')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
            activeTab === 'focus'
              ? 'text-teal-600 dark:text-teal-400 font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Wind className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] truncate max-w-[64px]">{t('navFocus')}</span>
        </button>

        {/* Energy Analytics */}
        <button
          onClick={() => handleTabClick('stats')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
            activeTab === 'stats'
              ? 'text-teal-600 dark:text-teal-400 font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] truncate max-w-[64px]">{t('navStats')}</span>
        </button>
      </div>
    </nav>
  );
};
