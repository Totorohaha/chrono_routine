import React from 'react';
import { Calendar, Zap, Wallet, Wind, BarChart3 } from 'lucide-react';
import { HapticsService } from '../services/haptics';
import { useLanguage } from '../i18n/LanguageContext';

export type ActiveTab = 'schedule' | 'habits' | 'finance' | 'focus' | 'stats';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onQuickAdd?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const { t } = useLanguage();

  const handleTabClick = (tab: ActiveTab) => {
    HapticsService.selection();
    onChangeTab(tab);
  };

  return (
    <nav className="w-full shrink-0 z-30 px-3 pb-safe pt-1">
      <div className="mx-auto max-w-sm mb-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-2xl px-1.5 py-1.5 flex items-center justify-around transition-colors">
        {/* Schedule */}
        <button
          onClick={() => handleTabClick('schedule')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition ${
            activeTab === 'schedule'
              ? 'text-teal-600 dark:text-teal-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium truncate w-full text-center px-0.5">{t('navSchedule')}</span>
        </button>

        {/* Maintenance / Habits */}
        <button
          onClick={() => handleTabClick('habits')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition ${
            activeTab === 'habits'
              ? 'text-teal-600 dark:text-teal-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Zap className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium truncate w-full text-center px-0.5">{t('navHabits')}</span>
        </button>

        {/* Bookkeeping / Finance */}
        <button
          onClick={() => handleTabClick('finance')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition ${
            activeTab === 'finance'
              ? 'text-teal-600 dark:text-teal-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium truncate w-full text-center px-0.5">{t('navFinance')}</span>
        </button>

        {/* Brain Fog / Focus */}
        <button
          onClick={() => handleTabClick('focus')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition ${
            activeTab === 'focus'
              ? 'text-teal-600 dark:text-teal-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Wind className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium truncate w-full text-center px-0.5">{t('navFocus')}</span>
        </button>

        {/* Energy Analytics */}
        <button
          onClick={() => handleTabClick('stats')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition ${
            activeTab === 'stats'
              ? 'text-teal-600 dark:text-teal-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium truncate w-full text-center px-0.5">{t('navStats')}</span>
        </button>
      </div>
    </nav>
  );
};

