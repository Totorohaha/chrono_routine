import React from 'react';
import { 
  Moon, 
  Sun, 
  Smartphone, 
  Monitor, 
  BookTemplate, 
  Settings2, 
  Zap, 
  Languages 
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { HapticsService } from '../services/haptics';

interface HeaderProps {
  currentDate: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  totalStreak: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  isDarkMode,
  onToggleDarkMode,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenTemplates,
  onOpenSettings,
  totalStreak,
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  const d = new Date(currentDate.replace(/-/g, '/') + ' 12:00:00');
  const weekdaysZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dateFormatted = language === 'zh'
    ? `${d.getMonth() + 1}月${d.getDate()}日 ${weekdaysZh[d.getDay()]}`
    : `${monthsEn[d.getMonth()]} ${d.getDate()}, ${weekdaysEn[d.getDay()]}`;

  const handleLangClick = () => {
    HapticsService.selection();
    toggleLanguage();
  };

  return (
    <header className="px-3.5 pt-3 pb-2 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="flex items-center justify-between">
        {/* Brand & Date */}
        <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/25 shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 truncate">
              <h1 className="font-extrabold text-slate-800 dark:text-slate-100 text-base sm:text-lg leading-tight tracking-tight truncate">
                {t('appName')}
              </h1>
              <div className="flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-[11px] font-mono font-bold shrink-0">
                <span>⚡ {totalStreak}{t('days')}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
              <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold mr-1">{dateFormatted}</span>
              <span className="hidden sm:inline">· {t('appTagline')}</span>
            </p>
          </div>
        </div>

        {/* Action icons bar */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Bilingual Switch Toggle */}
          <button
            onClick={handleLangClick}
            title={language === 'zh' ? 'Switch to English' : '切换为简体中文'}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex items-center space-x-0.5 text-xs font-bold font-mono px-2"
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
              {language === 'zh' ? 'EN' : '中'}
            </span>
          </button>

          {/* Templates Library */}
          <button
            onClick={onOpenTemplates}
            title={t('protocols')}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            <BookTemplate className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </button>

          {/* Toggle Mobile Preview Frame */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? t('mobileFrameOff') : t('mobileFrameOn')}
            className="hidden sm:flex p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            {isMobileFrame ? <Smartphone className="w-4 h-4 text-teal-600" /> : <Monitor className="w-4 h-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? t('lightMode') : t('darkMode')}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            title={t('settings')}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
