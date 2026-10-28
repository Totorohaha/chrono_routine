import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, CloudRain, Waves, Wind, VolumeX, Sparkles, CheckCircle2, Heart, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleItem, FocusRecord, Category } from '../../types';
import { soundManager } from '../../services/audio';
import { HapticsService } from '../../services/haptics';
import { getTodayStr } from '../../utils/date';
import { useLanguage } from '../../i18n/LanguageContext';

interface FocusTimerProps {
  tasks: ScheduleItem[];
  selectedTask?: ScheduleItem | null;
  onRecordFocus: (record: Omit<FocusRecord, 'id'>, taskId?: string) => void;
}

type ToolMode = 'breathing' | 'nsdr' | 'ultradian';

export const FocusTimer: React.FC<FocusTimerProps> = ({
  tasks,
  selectedTask,
  onRecordFocus,
}) => {
  const { t } = useLanguage();
  const [toolMode, setToolMode] = useState<ToolMode>('breathing');
  
  // Timer states
  const [presetDuration, setPresetDuration] = useState<number>(25 * 60); // 25 mins
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTaskId, setActiveTaskId] = useState<string>(selectedTask?.id || '');
  const [ambientSound, setAmbientSound] = useState<'rain' | 'waves' | 'stream' | 'none'>('none');

  // 4-7-8 Breathing states: Inhale 4s -> Hold 7s -> Exhale 8s
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState<number>(4);
  const [completedBreathRounds, setCompletedBreathRounds] = useState<number>(0);

  // References to guarantee no stale closures in timer loops
  const timerRef = useRef<number | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const timeLeftRef = useRef<number>(25 * 60);
  const breathPhaseRef = useRef<'inhale' | 'hold' | 'exhale'>('inhale');
  const breathCountRef = useRef<number>(4);

  // Keep timeLeftRef in sync
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (selectedTask) {
      setActiveTaskId(selectedTask.id);
    }
  }, [selectedTask]);

  const handleTimerFinish = useCallback(() => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    soundManager.playBell();
    HapticsService.success();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#38bdf8'],
    });

    const durationMinutes = Math.max(1, Math.round(presetDuration / 60));
    const matchedTask = tasks.find((t) => t.id === activeTaskId);
    const today = getTodayStr();

    onRecordFocus(
      {
        taskId: activeTaskId || undefined,
        taskTitle: matchedTask ? matchedTask.title : (toolMode === 'nsdr' ? t('toolNsdr') : t('toolUltradian')),
        category: (matchedTask ? matchedTask.category : (toolMode === 'nsdr' ? 'rest' : 'research')) as Category,
        durationMinutes,
        date: today,
        timestamp: new Date().toISOString(),
      },
      activeTaskId || undefined
    );
  }, [presetDuration, tasks, activeTaskId, toolMode, onRecordFocus, t]);

  // Background-safe tick loop using wall-clock timestamp differential
  useEffect(() => {
    if (isRunning && toolMode !== 'breathing') {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeftRef.current * 1000;
      }

      timerRef.current = window.setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const diffSecs = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
        setTimeLeft(diffSecs);

        if (diffSecs <= 0) {
          handleTimerFinish();
        }
      }, 500);

      // Instantly synchronize when app resumes from background or screen unlock
      const handleAppResume = () => {
        if (targetEndTimeRef.current) {
          const diffSecs = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
          setTimeLeft(diffSecs);
          if (diffSecs <= 0) {
            handleTimerFinish();
          }
        }
      };

      document.addEventListener('visibilitychange', handleAppResume);
      window.addEventListener('focus', handleAppResume);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        document.removeEventListener('visibilitychange', handleAppResume);
        window.removeEventListener('focus', handleAppResume);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRunning, toolMode, handleTimerFinish]);

  // Tactile 4-7-8 Breathing loop with gentle haptic guidance
  useEffect(() => {
    if (isRunning && toolMode === 'breathing') {
      const interval = window.setInterval(() => {
        breathCountRef.current -= 1;

        if (breathCountRef.current <= 0) {
          if (breathPhaseRef.current === 'inhale') {
            breathPhaseRef.current = 'hold';
            breathCountRef.current = 7;
            HapticsService.light();
          } else if (breathPhaseRef.current === 'hold') {
            breathPhaseRef.current = 'exhale';
            breathCountRef.current = 8;
            HapticsService.light();
          } else {
            breathPhaseRef.current = 'inhale';
            breathCountRef.current = 4;
            setCompletedBreathRounds((r) => r + 1);
            HapticsService.medium();
          }
        }

        setBreathPhase(breathPhaseRef.current);
        setBreathCount(breathCountRef.current);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, toolMode]);

  const handleToggleSound = (type: 'rain' | 'waves' | 'stream') => {
    HapticsService.light();
    if (ambientSound === type) {
      soundManager.stopAmbient();
      setAmbientSound('none');
    } else {
      soundManager.startAmbient(type);
      setAmbientSound(type);
    }
  };

  const handleStopSound = () => {
    HapticsService.light();
    soundManager.stopAmbient();
    setAmbientSound('none');
  };

  const handleTogglePlay = () => {
    HapticsService.medium();
    if (!isRunning) {
      if (toolMode !== 'breathing') {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }
      setIsRunning(true);
    } else {
      if (toolMode !== 'breathing' && targetEndTimeRef.current) {
        const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        targetEndTimeRef.current = null;
      }
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    HapticsService.light();
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (toolMode === 'breathing') {
      breathPhaseRef.current = 'inhale';
      breathCountRef.current = 4;
      setBreathPhase('inhale');
      setBreathCount(4);
      setCompletedBreathRounds(0);
    } else {
      setTimeLeft(presetDuration);
    }
  };

  const handleSelectMode = (mode: ToolMode) => {
    HapticsService.light();
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setToolMode(mode);
    if (mode === 'nsdr') {
      const secs = 15 * 60;
      setPresetDuration(secs);
      setTimeLeft(secs);
    } else if (mode === 'ultradian') {
      const secs = 90 * 60; // 90 min ultradian sprint
      setPresetDuration(secs);
      setTimeLeft(secs);
    } else {
      breathPhaseRef.current = 'inhale';
      breathCountRef.current = 4;
      setBreathPhase('inhale');
      setBreathCount(4);
      setCompletedBreathRounds(0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = (presetDuration - timeLeft) / presetDuration;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const currentTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="px-4 py-3 max-w-md mx-auto space-y-3.5 select-none pb-4">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 gap-1">
        <button
          onClick={() => handleSelectMode('breathing')}
          className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1 ${
            toolMode === 'breathing'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Wind className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('toolBreathing')}</span>
        </button>
        <button
          onClick={() => handleSelectMode('nsdr')}
          className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1 ${
            toolMode === 'nsdr'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('toolNsdr')}</span>
        </button>
        <button
          onClick={() => handleSelectMode('ultradian')}
          className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1 ${
            toolMode === 'ultradian'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('toolUltradian')}</span>
        </button>
      </div>

      {/* Task selector if in timer mode */}
      {toolMode !== 'breathing' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            {t('bindTaskLabel')}
          </label>
          <select
            value={activeTaskId}
            onChange={(e) => setActiveTaskId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
          >
            <option value="">{t('bindTaskNone')}</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.startTime} - {t.endTime})
              </option>
            ))}
          </select>
          {currentTask && (
            <div className="mt-2 flex items-center justify-between text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1.5 rounded-xl font-medium">
              <span className="truncate">{t('targetTaskPrefix')}{currentTask.title}</span>
              <span className="text-[11px] shrink-0 ml-2 font-mono">{t('cumFocusTime')} {currentTask.focusMinutes || 0}m</span>
            </div>
          )}
        </div>
      )}

      {/* 4-7-8 Breathing Mode Canvas */}
      {toolMode === 'breathing' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-center">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300">
              {t('toolBreathing')}
            </span>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {t('breathingSub')}
            </p>
          </div>

          {/* Organic Pulsing Breathing Circle */}
          <div className="relative w-52 h-52 flex items-center justify-center">
            <div
              className={`absolute rounded-full transition-all duration-1000 ease-in-out ${
                !isRunning
                  ? 'w-32 h-32 bg-teal-100 dark:bg-teal-950/40'
                  : breathPhase === 'inhale'
                  ? 'w-48 h-48 bg-teal-200 dark:bg-teal-900/60 scale-105'
                  : breathPhase === 'hold'
                  ? 'w-48 h-48 bg-emerald-200 dark:bg-emerald-900/60 ring-8 ring-teal-300/30'
                  : 'w-28 h-28 bg-teal-100 dark:bg-teal-950/40'
              }`}
            />
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-xl font-bold text-teal-800 dark:text-teal-100 leading-snug">
                {!isRunning
                  ? t('breathingHintReady')
                  : breathPhase === 'inhale'
                  ? t('breathingInhale')
                  : breathPhase === 'hold'
                  ? t('breathingHold')
                  : t('breathingExhale')}
              </span>
              <span className="text-4xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                {isRunning ? breathCount : '4·7·8'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>{t('completedRounds')}：{completedBreathRounds} {t('roundsUnit')}</span>
            <span>·</span>
            <span>{t('recommendedRounds')}</span>
          </div>
        </div>
      ) : (
        /* Pomodoro / NSDR Dial */
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-60 h-60 -rotate-90 transform">
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-500 ease-linear ${
                toolMode === 'nsdr' ? 'text-indigo-500' : 'text-teal-500'
              }`}
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1 flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 text-teal-500" />
              <span>
                {toolMode === 'nsdr'
                  ? (isRunning ? t('nsdrRunning') : t('nsdrIdle'))
                  : (isRunning ? t('ultradianRunning') : t('ultradianIdle'))}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Preset pills for Ultradian / NSDR */}
      {toolMode !== 'breathing' && (
        <div className="flex justify-center space-x-2">
          {toolMode === 'nsdr' ? (
            [10, 15, 20].map((m) => (
              <button
                key={m}
                disabled={isRunning}
                onClick={() => {
                  const secs = m * 60;
                  setPresetDuration(secs);
                  setTimeLeft(secs);
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                  presetDuration === m * 60
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 disabled:opacity-50'
                }`}
              >
                {m} {t('minFastCharge')}
              </button>
            ))
          ) : (
            [25, 45, 60, 90].map((m) => (
              <button
                key={m}
                disabled={isRunning}
                onClick={() => {
                  const secs = m * 60;
                  setPresetDuration(secs);
                  setTimeLeft(secs);
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                  presetDuration === m * 60
                    ? 'bg-teal-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 disabled:opacity-50'
                }`}
              >
                {m === 90 ? t('ultradianGoldCycle') : `${m} ${t('minPresetSuffix')}`}
              </button>
            ))
          )}
        </div>
      )}

      {/* Timer Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleReset}
          className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition active:scale-90"
          title={t('resetBtn')}
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleTogglePlay}
          className={`w-16 h-16 rounded-3xl text-white flex items-center justify-center shadow-lg transition active:scale-95 ${
            toolMode === 'breathing'
              ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-teal-500/35 hover:shadow-teal-500/50'
              : toolMode === 'nsdr'
              ? 'bg-gradient-to-tr from-indigo-500 to-teal-500 shadow-indigo-500/35 hover:shadow-indigo-500/50'
              : 'bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-teal-500/35 hover:shadow-teal-500/50'
          }`}
        >
          {isRunning ? (
            <Pause className="w-7 h-7 stroke-[2.5]" />
          ) : (
            <Play className="w-7 h-7 stroke-[2.5] ml-0.5" />
          )}
        </button>

        {toolMode !== 'breathing' && (
          <button
            onClick={handleTimerFinish}
            className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition active:scale-90"
            title={t('settleRecord')}
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Ambient Sound Generator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span>{t('whiteNoiseTitle')}</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded-full font-normal">
              {t('whiteNoiseSub')}
            </span>
          </div>
          {ambientSound !== 'none' && (
            <button
              onClick={handleStopSound}
              className="text-xs text-red-500 flex items-center space-x-1 hover:underline"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>{t('mute')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleToggleSound('rain')}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-medium border transition ${
              ambientSound === 'rain'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 font-semibold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span>{t('soundRain')}</span>
          </button>
          <button
            onClick={() => handleToggleSound('waves')}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-medium border transition ${
              ambientSound === 'waves'
                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-600 font-semibold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>{t('soundWaves')}</span>
          </button>
          <button
            onClick={() => handleToggleSound('stream')}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-medium border transition ${
              ambientSound === 'stream'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 font-semibold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>{t('soundStream')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
