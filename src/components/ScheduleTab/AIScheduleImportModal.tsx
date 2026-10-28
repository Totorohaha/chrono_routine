import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Clock, 
  Calendar,
  AlertCircle,
  FileCode2,
  CheckCircle2
} from 'lucide-react';
import { ScheduleItem } from '../../types';
import { 
  AI_PROMPT_TEMPLATE_ZH, 
  AI_PROMPT_TEMPLATE_EN, 
  parseAIScheduleString 
} from '../../services/aiScheduleParser';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../UI/Toast';
import { HapticsService } from '../../services/haptics';
import { soundManager } from '../../services/audio';
import { CATEGORY_CONFIG } from './TaskItemCard';

interface AIScheduleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: string;
  onImportTasks: (tasks: ScheduleItem[]) => void;
}

export const AIScheduleImportModal: React.FC<AIScheduleImportModalProps> = ({
  isOpen,
  onClose,
  targetDate,
  onImportTasks,
}) => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ScheduleItem[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [hasParsed, setHasParsed] = useState(false);

  if (!isOpen) return null;

  const promptTemplate = language === 'zh' ? AI_PROMPT_TEMPLATE_ZH : AI_PROMPT_TEMPLATE_EN;

  const handleCopyPrompt = async () => {
    HapticsService.light();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(promptTemplate);
      } else {
        const ta = document.createElement('textarea');
        ta.value = promptTemplate;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedPrompt(true);
      soundManager.playChime();
      HapticsService.success();
      showToast(t('promptCopied'), 'success');
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      showToast(t('copyFailedWarn'), 'error');
    }
  };

  const handleParse = () => {
    HapticsService.medium();
    if (!rawInput.trim()) {
      showToast(t('emptyInputWarn'), 'warning');
      return;
    }

    const tasks = parseAIScheduleString(rawInput, targetDate);
    setHasParsed(true);

    if (tasks.length === 0) {
      setParsedTasks([]);
      setSelectedTaskIds(new Set());
      showToast(t('noTasksParsed'), 'error');
    } else {
      setParsedTasks(tasks);
      setSelectedTaskIds(new Set(tasks.map((t) => t.id)));
      soundManager.playChime();
      HapticsService.success();
      showToast(t('parsedTasksCount', { count: tasks.length }), 'success');
    }
  };

  const handleToggleSelectTask = (id: string) => {
    HapticsService.light();
    const next = new Set(selectedTaskIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTaskIds(next);
  };

  const handleToggleSelectAll = () => {
    HapticsService.light();
    if (selectedTaskIds.size === parsedTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(parsedTasks.map((t) => t.id)));
    }
  };

  const handleConfirmImport = () => {
    const tasksToImport = parsedTasks.filter((t) => selectedTaskIds.has(t.id));
    if (tasksToImport.length === 0) {
      showToast(t('selectImportNotice'), 'warning');
      return;
    }

    onImportTasks(tasksToImport);
    soundManager.playChime();
    HapticsService.success();
    showToast(t('importSuccessMsg', { count: tasksToImport.length, date: targetDate }), 'success');
    onClose();
  };

  const handleLoadSample = () => {
    HapticsService.light();
    const sample = `\`\`\`json
[
  {
    "title": "顶会论文前沿引言与Motivation梳理",
    "startTime": "09:30",
    "endTime": "11:00",
    "category": "research",
    "priority": "p0",
    "note": "90m超昼夜单线程攻坚，免打扰"
  },
  {
    "title": "午间进食与 NSDR 神经低功耗快充",
    "startTime": "12:30",
    "endTime": "13:30",
    "category": "rest",
    "priority": "p1",
    "note": "离桌离开屏幕，15分钟闭目身体扫描"
  },
  {
    "title": "模型微调实验跑数与指标可视化分析",
    "startTime": "14:00",
    "endTime": "16:00",
    "category": "research",
    "priority": "p0",
    "note": "对比消融实验 Baseline 性能曲线"
  },
  {
    "title": "课题组科研进度同步与导师沟通",
    "startTime": "16:30",
    "endTime": "17:30",
    "category": "work",
    "priority": "p1",
    "note": "汇报本周实验结果与遇到的理论瓶颈"
  },
  {
    "title": "晚间户外慢跑与物理断联修复",
    "startTime": "19:00",
    "endTime": "20:00",
    "category": "health",
    "priority": "p2",
    "note": "有氧心率保持，抑制夜间反刍焦虑"
  }
]
\`\`\``;
    setRawInput(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center space-x-1.5 font-mono">
                <span>{t('aiImportModalTitle')}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('aiImportModalSub')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Step 1: Prompt Template */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 font-mono">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[11px]">1</span>
                <span>{t('step1PromptTitle')}</span>
              </span>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-xs transition active:scale-95 font-mono"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('copiedCode')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('copyPromptBtn')}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('step1PromptDesc')}
            </p>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto select-text leading-relaxed">
              <span className="text-teal-600 dark:text-teal-400 font-semibold">{t('sampleInputNotice')}</span>
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1 rounded">
                {t('sampleInputPlaceholder')}
              </span>
            </div>
          </div>

          {/* Step 2: Paste LLM Response */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 font-mono">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[11px]">2</span>
                <span>{t('step2InputTitle')}</span>
              </span>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1 font-mono"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>{t('copySampleBtn')}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={t('pasteInputPlaceholder')}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none placeholder:text-slate-400"
            />
            <button
              onClick={handleParse}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-teal-500/20 flex items-center justify-center space-x-1.5 transition font-mono"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('parseBtn')}</span>
            </button>
          </div>

          {/* Step 3: Parsed Preview */}
          {hasParsed && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 font-mono">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[11px]">3</span>
                  <span>{t('step3PreviewTitle')}</span>
                </span>
                {parsedTasks.length > 0 && (
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    {selectedTaskIds.size === parsedTasks.length ? t('deselectAll') : t('selectAll')}
                  </button>
                )}
              </div>

              {parsedTasks.length === 0 ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 text-xs text-rose-600 dark:text-rose-400 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t('noTasksParsed')}</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {parsedTasks.map((task) => {
                    const isSelected = selectedTaskIds.has(task.id);
                    const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.research;
                    const CatIcon = cat.icon;

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleToggleSelectTask(task.id)}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 shrink-0 transition ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {task.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 ml-2 shrink-0">
                              {task.startTime} - {task.endTime}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-[10px]">
                            <span className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                              <CatIcon className="w-2.5 h-2.5" />
                              <span>{language === 'zh' ? cat.label : cat.labelEn}</span>
                            </span>
                            <span className={`font-mono font-semibold ${
                              task.priority === 'p0' ? 'text-rose-500' : task.priority === 'p1' ? 'text-amber-500' : 'text-slate-400'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                            {task.note && (
                              <span className="text-slate-400 truncate max-w-[150px]">
                                {task.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            {t('targetDateLabel')}<span className="text-teal-600 dark:text-teal-400 font-semibold">{targetDate}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('cancel')}
            </button>
            <button
              disabled={selectedTaskIds.size === 0}
              onClick={handleConfirmImport}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-md shadow-teal-500/25 flex items-center space-x-1.5 transition active:scale-95 font-mono"
            >
              <span>{t('importBtn')} ({selectedTaskIds.size})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
