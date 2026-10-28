import React from 'react';
import { 
  Moon, 
  Sun, 
  Smartphone, 
  Monitor, 
  BookTemplate, 
  Settings2, 
  Languages 
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { HapticsService } from '../services/haptics';

interface HeaderProps {
  currentDate?: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  totalStreak: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenTemplates,
  onOpenSettings,
  totalStreak,
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  const handleLangClick = () => {
    HapticsService.selection();
    toggleLanguage();
  };

  return (
    <header className="px-3 sm:px-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 transition-colors pt-safe pb-2 shrink-0">
      <div className="flex items-center justify-between">
        {/* Left Cluster: Streak Pill & Bilingual Switch */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Streak Pill */}
          <div 
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs sm:text-sm font-mono font-bold shadow-2xs"
            title={t('streak')}
          >
            <span>⚡ {totalStreak} {t('days')}</span>
          </div>

          {/* Bilingual Switch Toggle (Moved safely to the left edge to avoid top camera hole / notch) */}
          <button
            onClick={handleLangClick}
            title={language === 'zh' ? 'Switch to English' : '切换为简体中文'}
            className="p-1 sm:p-1.5 px-2 sm:px-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex items-center space-x-1 text-xs sm:text-sm font-bold font-mono border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40"
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-teal-600 dark:text-teal-400">
              {language === 'zh' ? 'EN' : '中'}
            </span>
          </button>
        </div>

        {/* Center Exclusion Area: Reserved buffer for top camera cutout / punch hole / Dynamic Island. ABSOLUTELY NO CONTROLS OR TEXT HERE. */}
        <div className="flex-1 min-w-[32px] sm:min-w-[72px] pointer-events-none" aria-hidden="true" />

        {/* Right Cluster: Templates, Theme, Settings */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 justify-end">
          {/* Templates Library */}
          <button
            onClick={onOpenTemplates}
            title={t('protocols')}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            <BookTemplate className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </button>

          {/* Toggle Mobile Preview Frame */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? t('mobileFrameOff') : t('mobileFrameOn')}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            {isMobileFrame ? <Smartphone className="w-4 h-4 text-teal-600" /> : <Monitor className="w-4 h-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? t('lightMode') : t('darkMode')}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            title={t('settings')}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
