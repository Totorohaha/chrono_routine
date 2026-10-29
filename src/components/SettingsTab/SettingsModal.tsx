import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Copy, 
  Check,
  Languages
} from 'lucide-react';
import { ScheduleItem, HabitItem, FocusRecord } from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../UI/Toast';
import { useLanguage } from '../../i18n/LanguageContext';
import { HapticsService } from '../../services/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ScheduleItem[];
  habits: HabitItem[];
  focusRecords: FocusRecord[];
  onDataRestored: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  habits,
  focusRecords,
  onDataRestored,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const [copiedCmd, setCopiedCmd] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportData = () => {
    const backup = {
      version: '5.0-pulseflow',
      exportDate: new Date().toISOString(),
      schedules: tasks,
      habits: habits,
      focusRecords: focusRecords,
      reflections: StorageService.getReflections(),
      transactions: StorageService.getTransactions(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulseflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('exportSuccessMsg'), 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.schedules) StorageService.saveSchedules(json.schedules);
        if (json.habits) StorageService.saveHabits(json.habits);
        if (json.focusRecords) StorageService.saveFocusRecords(json.focusRecords);
        if (json.reflections) {
          StorageService.saveAllReflections(json.reflections);
        }
        if (json.transactions) {
          StorageService.saveTransactions(json.transactions);
        }
        showToast(t('restoreSuccessMsg'), 'success');
        onDataRestored();
        onClose();
      } catch {
        showToast(t('restoreErrorMsg'), 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input so re-selecting works!
  };

  const handleResetData = () => {
    if (confirm(t('resetConfirmMsg'))) {
      StorageService.clearAllData();
      onDataRestored();
      showToast(t('resetSuccessMsg'), 'info');
      onClose();
    }
  };

  const androidBuildSteps = `npm run build:android\nnpx cap open android`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(androidBuildSteps);
    setCopiedCmd(true);
    showToast(t('copiedCode'), 'success');
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
            {t('settingsModalTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* Concept Box */}
          <div className="rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 p-4 border border-teal-100 dark:border-teal-900/40 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center space-x-1.5 text-teal-800 dark:text-teal-300 font-semibold font-mono">
              <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t('settingsMissionTitle')}</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
              {t('settingsMissionDesc')}
            </p>
          </div>

          {/* Android Export Box */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold text-xs font-mono">
                <Smartphone className="w-4 h-4 text-teal-500" />
                <span>{t('androidBuildTitle')}</span>
              </div>
              <button
                onClick={handleCopyCmd}
                className="flex items-center space-x-1 text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium font-mono"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? t('copiedCode') : t('copyCode')}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
              {androidBuildSteps}
            </pre>
            <p className="text-[11px] text-slate-400">
              {t('androidBuildHelp')}
            </p>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1.5">
              <Languages className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{language === 'zh' ? '界面语言 / Language' : 'Language / 界面语言'}</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (language !== 'zh') {
                    HapticsService.selection();
                    toggleLanguage();
                  }
                }}
                className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition font-mono ${
                  language === 'zh'
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>🇨🇳 简体中文</span>
              </button>
              <button
                onClick={() => {
                  if (language !== 'en') {
                    HapticsService.selection();
                    toggleLanguage();
                  }
                }}
                className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition font-mono ${
                  language === 'en'
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>🇺🇸 English</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
              {t('dataManageTitle')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
              >
                <Download className="w-4 h-4 text-teal-500" />
                <span>{t('exportJson')}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>{t('importJson')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>
          </div>

          {/* Reset Demo Data */}
          <div>
            <button
              onClick={handleResetData}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border border-teal-200 dark:border-teal-900/50 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-xs font-medium text-teal-700 dark:text-teal-300 transition font-mono"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('resetDefaultPlan')}</span>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-400 pt-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>{t('securityNote')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
