import React from 'react';
import { X, BookTemplate, Check, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { PRESET_TEMPLATES } from '../../services/templates';
import { RoutineTemplate } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: RoutineTemplate) => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <BookTemplate className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {t('templateModalTitle')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('templateModalSub')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates list */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {PRESET_TEMPLATES.map((tpl) => {
            const title = language === 'zh' ? tpl.title : (tpl.titleEn || tpl.title);
            const subtitle = language === 'zh' ? tpl.subtitle : (tpl.subtitleEn || tpl.subtitle);
            const targetGroup = language === 'zh' ? tpl.targetGroup : (tpl.targetGroupEn || tpl.targetGroup);
            const citation = language === 'zh' ? tpl.citation : (tpl.citationEn || tpl.citation);
            const tag = language === 'zh' ? tpl.tag : (tpl.tagEn || tpl.tag);

            return (
              <div
                key={tpl.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 hover:border-teal-500/50 transition-all space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {title}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                      {tag}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{t('targetAudience')}: {targetGroup}</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {subtitle}
                  </p>

                  {/* Scientific Authority Citation */}
                  <div className="mt-2 flex items-start space-x-1.5 p-2 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/40 text-[11px] text-teal-800 dark:text-teal-300 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" />
                    <span>{citation}</span>
                  </div>
                </div>

                {/* Tasks preview */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    {t('matchingTasks')} ({tpl.tasks.length} {t('scheduleItemsCount')}):
                  </span>
                  <div className="space-y-1">
                    {tpl.tasks.map((taskItem, idx) => {
                      const taskTitle = language === 'zh' ? taskItem.title : (taskItem.titleEn || taskItem.title);
                      return (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
                        >
                          <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                          <span className="font-mono text-slate-400 text-[11px] shrink-0">
                            {taskItem.startTime}
                          </span>
                          <span className="truncate">{taskTitle}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Habits preview */}
                {tpl.habits.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      {t('matchingHabits')} ({tpl.habits.length} {t('scheduleItemsCount')}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.habits.map((habitItem, idx) => {
                        const habitTitle = language === 'zh' ? habitItem.title : (habitItem.titleEn || habitItem.title);
                        return (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-medium border border-teal-200/60 dark:border-teal-800/40"
                          >
                            {habitTitle}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Apply button */}
                <button
                  onClick={() => {
                    onApplyTemplate(tpl);
                    onClose();
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center space-x-1 shadow-sm transition active:scale-95 font-mono"
                >
                  <span>{t('loadProtocolBtn')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
