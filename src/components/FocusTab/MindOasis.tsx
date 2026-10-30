import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Wind, 
  CloudRain, 
  Waves, 
  VolumeX
} from 'lucide-react';
import { soundManager } from '../../services/audio';
import { HapticsService } from '../../services/haptics';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../UI/Toast';
import { LuckyMuyuGame } from './LuckyMuyuGame';
import { CyberSmokeLuxury } from './CyberSmokeLuxury';
import { CyberBuskingGame } from './CyberBuskingGame';
import { GravityStarsGame } from './GravityStarsGame';

type OasisMode = 'muyu' | 'smoke' | 'gravity' | 'busking' | 'cat' | 'dog';

export const MindOasis: React.FC = () => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [activeMode, setActiveMode] = useState<OasisMode>('smoke');
  const [ambientSound, setAmbientSound] = useState<'rain' | 'waves' | 'stream' | 'none'>('none');

  // ==========================================
  // 1. 转运木鱼 3D (Lucky Muyu 3D) is encapsulated in <LuckyMuyuGame />
  // 2. 赛博小烟 (Cyber Smoke Luxury Edition) is encapsulated in <CyberSmokeLuxury />
  // 3. 引力星辰 (Gravity Stars) is encapsulated in <GravityStarsGame />
  // 4. 待开发游戏状态与交互: 云端撸猫 (Pet Cat)
  // ==========================================
  // ==========================================
  const [catPets, setCatPets] = useState<number>(() => {
    const s = localStorage.getItem('pulseflow_cat_pets');
    return s ? parseInt(s, 10) || 0 : 0;
  });
  const [isPettingCat, setIsPettingCat] = useState(false);

  const handlePetCat = () => {
    soundManager.playTap();
    HapticsService.medium();
    setIsPettingCat(true);
    setTimeout(() => setIsPettingCat(false), 700);
    setCatPets((prev) => {
      const next = prev + 1;
      localStorage.setItem('pulseflow_cat_pets', next.toString());
      return next;
    });
    showToast(t('catPurr'), 'success');
  };

  // ==========================================
  // 6. 待开发游戏状态与交互: 草地遛狗 (Walk Dog)
  // ==========================================
  const [dogPlays, setDogPlays] = useState<number>(() => {
    const s = localStorage.getItem('pulseflow_dog_plays');
    return s ? parseInt(s, 10) || 0 : 0;
  });
  const [isThrowingFrisbee, setIsThrowingFrisbee] = useState(false);

  const handleThrowFrisbee = () => {
    soundManager.playTap();
    HapticsService.light();
    setIsThrowingFrisbee(true);
    setTimeout(() => setIsThrowingFrisbee(false), 800);
    setDogPlays((prev) => {
      const next = prev + 1;
      localStorage.setItem('pulseflow_dog_plays', next.toString());
      return next;
    });
    showToast(t('dogBark'), 'success');
  };

  // Ambient soundscape toggle
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

  const GAME_TABS: Array<{ id: OasisMode; icon: string; label: string; isPending: boolean }> = [
    { id: 'smoke', icon: '🚬', label: language === 'zh' ? '赛博小烟' : 'Cyber Smoke', isPending: false },
    { id: 'busking', icon: '🎪', label: language === 'zh' ? '街艺打赏' : 'Street Busking', isPending: false },
    { id: 'gravity', icon: '🪐', label: language === 'zh' ? '引力星辰' : 'Gravity Stars', isPending: false },
    { id: 'muyu', icon: '🪵', label: language === 'zh' ? '转运木鱼' : 'Lucky Muyu', isPending: false },
    { id: 'cat', icon: '🐱', label: language === 'zh' ? '云端撸猫' : 'Pet Cat', isPending: true },
    { id: 'dog', icon: '🐕', label: language === 'zh' ? '草地遛狗' : 'Walk Dog', isPending: true },
  ];

  // Horizontal Sliding Tab Bar state & refs
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const tabItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleScrollToTab = useCallback((modeId: OasisMode) => {
    const btn = tabItemRefs.current[modeId];
    const container = sliderRef.current;
    if (btn && container) {
      const btnLeft = btn.offsetLeft;
      const btnWidth = btn.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScroll = btnLeft - (containerWidth / 2) + (btnWidth / 2);
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    handleScrollToTab(activeMode);
  }, [activeMode, handleScrollToTab]);

  useEffect(() => {
    return () => {
      soundManager.stopAmbient();
    };
  }, []);

  return (
    <div className="px-4 py-3 w-full max-w-2xl mx-auto space-y-3.5 select-none pb-4">
      {/* Module Title Card */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5 font-mono">
            <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t('oasisTitle')}</span>
          </h2>
        </div>
      </div>

      {/* Smooth Horizontal Scrolling Tab Bar */}
      <div className="w-full rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 p-1 font-mono">
        <div
          ref={sliderRef}
          className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar scroll-smooth px-0.5 py-0.5"
        >
          {GAME_TABS.map((item) => {
            const isActive = activeMode === item.id;
            return (
              <button
                key={item.id}
                ref={(el) => { tabItemRefs.current[item.id] = el; }}
                onClick={() => {
                  HapticsService.selection();
                  setActiveMode(item.id);
                }}
                className={`shrink-0 py-2 px-3.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center space-x-1.5 whitespace-nowrap active:scale-95 select-none ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm border border-teal-500/40 ring-1 ring-teal-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/40 border border-transparent'
                }`}
              >
                <span className="text-sm shrink-0">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
                {item.isPending && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none ${
                      isActive
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60'
                        : 'bg-slate-200/80 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {language === 'zh' ? '待开发' : 'Soon'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* GAME 1: 赛博小烟 (Cyber Smoke Luxury Edition)                   */}
      {/* ============================================================== */}
      <div className={activeMode === 'smoke' ? 'block' : 'hidden'}>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2 z-10">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
              {t('smokeTitle')}
            </span>
          </div>

          <CyberSmokeLuxury />
        </div>
      </div>

      {/* ============================================================== */}
      {/* GAME 2: 街艺打赏 (Street Busking)                              */}
      {/* ============================================================== */}
      {activeMode === 'busking' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2 z-10">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
              {t('buskingTitle')}
            </span>
          </div>

          <CyberBuskingGame />
        </div>
      )}

      {/* ============================================================== */}
      {/* GAME 3: 引力星辰 (Gravity Stars)                              */}
      {/* ============================================================== */}
      {activeMode === 'gravity' && (
        <GravityStarsGame />
      )}

      {/* ============================================================== */}
      {/* GAME 4: 转运木鱼 (Lucky Muyu 3D)                                */}
      {/* ============================================================== */}
      {activeMode === 'muyu' && (
        <LuckyMuyuGame />
      )}

      {/* ============================================================== */}
      {/* GAME 5: 云端撸猫 (Pet Cat - 待开发)                             */}
      {/* ============================================================== */}
      {activeMode === 'cat' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden min-h-[510px] sm:min-h-[548px]">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between z-10 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono flex items-center space-x-1">
              <span>{t('catTitle')}</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold flex items-center space-x-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{t('underDevBadge')}</span>
            </span>
          </div>

          {/* Unified 400px/430px Cyber Chamber Viewport */}
          <div className="relative w-full h-[400px] sm:h-[430px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 flex flex-col items-center justify-between p-4 select-none shadow-inner">
            {/* Top Chamber Bar */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>PURR THERAPY LAB</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-rose-400">
                DEV: 60%
              </span>
            </div>

            {/* Center Stage Cat Illustration */}
            <div className="relative flex flex-col items-center justify-center my-auto">
              {/* Purr Sound Wave Resonance Ring */}
              <div className={`absolute w-44 h-44 rounded-full border border-rose-500/30 transition-all duration-700 pointer-events-none ${
                isPettingCat ? 'scale-125 opacity-100 animate-ping' : 'scale-90 opacity-20'
              }`} />

              {/* Vector Sleeping Cyber Cat */}
              <div 
                onClick={handlePetCat}
                className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 py-1"
              >
                <svg className="w-44 h-36 filter drop-shadow-xl" viewBox="0 0 160 120" fill="none">
                  <defs>
                    <linearGradient id="catBody" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="50%" stopColor="#fb7185" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* Sleeping Cushion */}
                  <ellipse cx="80" cy="98" rx="60" ry="14" fill="#1e1b4b" stroke="#4338ca" strokeWidth="2" />
                  
                  {/* Curled Body */}
                  <ellipse cx="80" cy="74" rx="42" ry="26" fill="url(#catBody)" />

                  {/* Sleeping Head */}
                  <circle cx="56" cy="62" r="22" fill="#fb7185" />

                  {/* Ears */}
                  <polygon points="42,46 50,30 58,45" fill="#f43f5e" />
                  <polygon points="58,45 66,30 74,46" fill="#f43f5e" />
                  <polygon points="45,44 50,34 55,43" fill="#fbcfe8" />
                  <polygon points="61,43 66,34 71,44" fill="#fbcfe8" />

                  {/* Closed Sleeping Eyes */}
                  <path d="M46 64 Q50 69 54 64" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
                  <path d="M60 64 Q64 69 68 64" stroke="#881337" strokeWidth="2" strokeLinecap="round" />

                  {/* Pink Nose & Mouth */}
                  <polygon points="56,70 58,70 57,72" fill="#ffe4e6" />
                  <path d="M57 72 Q55 76 53 74 M57 72 Q59 76 61 74" stroke="#881337" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Whiskers */}
                  <line x1="42" y1="68" x2="30" y2="66" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="42" y1="72" x2="32" y2="74" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="72" y1="68" x2="84" y2="66" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="72" y1="72" x2="82" y2="74" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                  {/* Tail wrapped around */}
                  <path d="M115 82 C125 78, 126 62, 116 58 C108 55, 102 62, 108 70" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" fill="none" />
                </svg>

                {/* Floating Love Hearts on Pet */}
                {isPettingCat && (
                  <div className="absolute -top-3 right-4 animate-ping text-xl pointer-events-none">
                    ❤️
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 font-mono mt-1">
                {language === 'zh' ? '轻触猫咪抚摸' : 'Tap to pet cat'}
              </p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="w-full space-y-1.5 z-10">
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full w-[60%]" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="truncate">{t('catProgress')}</span>
                <span className="shrink-0 ml-1 text-rose-400 font-bold">60%</span>
              </div>
            </div>
          </div>

          {/* Constant-Height Action Bar Below Chamber */}
          <div className="w-full pt-3 flex items-center justify-between min-h-[56px] z-10 font-mono">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>{t('catPetCount')}: </span>
              <span className="font-bold text-rose-500 dark:text-rose-400 text-sm">{catPets}</span>
              <span className="text-[10px] ml-1">🐾</span>
            </div>

            <button
              onClick={handlePetCat}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold font-mono shadow-md shadow-rose-500/25 active:scale-95 transition flex items-center space-x-1.5"
            >
              <span>{t('catActionPet')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* GAME 6: 草地遛狗 (Walk Dog - 待开发)                             */}
      {/* ============================================================== */}
      {activeMode === 'dog' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden min-h-[510px] sm:min-h-[548px]">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between z-10 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono flex items-center space-x-1">
              <span>{t('dogTitle')}</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold flex items-center space-x-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{t('underDevBadge')}</span>
            </span>
          </div>

          {/* Unified 400px/430px Cyber Chamber Viewport */}
          <div className="relative w-full h-[400px] sm:h-[430px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 flex flex-col items-center justify-between p-4 select-none shadow-inner">
            {/* Top Chamber Bar */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>PARK FRISBEE LAB</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                DEV: 35%
              </span>
            </div>

            {/* Center Stage Dog & Frisbee Illustration */}
            <div className="relative flex flex-col items-center justify-center my-auto">
              <div 
                onClick={handleThrowFrisbee}
                className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 py-1"
              >
                <svg className="w-44 h-36 filter drop-shadow-xl" viewBox="0 0 160 120" fill="none">
                  <defs>
                    <linearGradient id="dogBody" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#065f46" />
                      <stop offset="100%" stopColor="#022c22" />
                    </linearGradient>
                  </defs>

                  {/* Green Park Ground */}
                  <ellipse cx="80" cy="100" rx="65" ry="12" fill="url(#grassGrad)" stroke="#10b981" strokeWidth="1.5" />

                  {/* Cheerful Puppy Body */}
                  <ellipse cx="75" cy="78" rx="28" ry="18" fill="url(#dogBody)" />

                  {/* Tail wagging */}
                  <path d="M102 74 C112 70, 115 56, 110 50" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" className="origin-bottom-left animate-pulse" />

                  {/* Puppy Head */}
                  <circle cx="50" cy="62" r="18" fill="#fbbf24" />

                  {/* Drooping Ears */}
                  <ellipse cx="40" cy="65" rx="6" ry="12" fill="#b45309" />
                  <ellipse cx="60" cy="65" rx="6" ry="12" fill="#b45309" />

                  {/* Happy Eyes */}
                  <circle cx="45" cy="58" r="2.5" fill="#1c1917" />
                  <circle cx="55" cy="58" r="2.5" fill="#1c1917" />

                  {/* Cute Black Snout */}
                  <ellipse cx="50" cy="66" rx="4" ry="3" fill="#1c1917" />
                  {/* Tongue sticking out */}
                  <path d="M50 69 Q50 75 53 74 Q53 69 50 69" fill="#f43f5e" />

                  {/* Paws */}
                  <ellipse cx="58" cy="94" rx="6" ry="4" fill="#fbbf24" />
                  <ellipse cx="72" cy="94" rx="6" ry="4" fill="#fbbf24" />
                  <ellipse cx="86" cy="94" rx="6" ry="4" fill="#fbbf24" />

                  {/* Frisbee in Flight */}
                  <ellipse cx="120" cy="40" rx="14" ry="4" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1.5" />
                  <ellipse cx="120" cy="39" rx="10" ry="2.5" fill="#0284c7" />
                </svg>

                {/* Flying Frisbee Action Sparkles */}
                {isThrowingFrisbee && (
                  <div className="absolute -top-4 right-0 animate-ping text-xl pointer-events-none">
                    🥏
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 font-mono mt-1">
                {language === 'zh' ? '点击扔出飞盘' : 'Tap to throw frisbee'}
              </p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="w-full space-y-1.5 z-10">
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[35%]" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="truncate">{t('dogProgress')}</span>
                <span className="shrink-0 ml-1 text-emerald-400 font-bold">35%</span>
              </div>
            </div>
          </div>

          {/* Constant-Height Action Bar Below Chamber */}
          <div className="w-full pt-3 flex items-center justify-between min-h-[56px] z-10 font-mono">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>{t('dogPlayCount')}: </span>
              <span className="font-bold text-emerald-500 dark:text-emerald-400 text-sm">{dogPlays}</span>
              <span className="text-[10px] ml-1">🥏</span>
            </div>

            <button
              onClick={handleThrowFrisbee}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold font-mono shadow-md shadow-emerald-500/25 active:scale-95 transition flex items-center space-x-1.5"
            >
              <span>{t('dogActionFrisbee')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. 离线自然白噪音播放器 (Ambient Soundscapes)                   */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">
            <span>{t('soundscapeTitle')}</span>
          </div>
          {ambientSound !== 'none' && (
            <button
              onClick={() => {
                soundManager.stopAmbient();
                setAmbientSound('none');
              }}
              className="text-[11px] text-rose-500 hover:underline flex items-center space-x-1 font-mono"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>{t('mute')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5">
          {[
            { id: 'rain' as const, label: t('soundRain'), icon: CloudRain, activeColor: 'bg-blue-500 text-white' },
            { id: 'waves' as const, label: t('soundWaves'), icon: Waves, activeColor: 'bg-teal-500 text-white' },
            { id: 'stream' as const, label: t('soundStream'), icon: Wind, activeColor: 'bg-emerald-500 text-white' },
          ].map((item) => {
            const Icon = item.icon;
            const isPlaying = ambientSound === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleToggleSound(item.id)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-medium transition flex items-center justify-center space-x-1.5 active:scale-95 ${
                  isPlaying
                    ? `${item.activeColor} border-transparent shadow-xs font-bold`
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
