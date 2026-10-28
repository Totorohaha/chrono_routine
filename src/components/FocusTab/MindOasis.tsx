import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Wind, 
  RotateCcw, 
  Play, 
  Pause, 
  CloudRain, 
  Waves, 
  VolumeX, 
  Flame, 
  Check, 
  ChevronDown
} from 'lucide-react';
import { soundManager } from '../../services/audio';
import { HapticsService } from '../../services/haptics';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../UI/Toast';
import { CyberSmokeLuxury } from './CyberSmokeLuxury';
import { CyberBuskingGame } from './CyberBuskingGame';

type OasisMode = 'muyu' | 'smoke' | 'gravity' | 'busking' | 'cat' | 'dog';

interface FloatingTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface StarParticleItem {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
}

export const MindOasis: React.FC = () => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [activeMode, setActiveMode] = useState<OasisMode>('muyu');
  const [ambientSound, setAmbientSound] = useState<'rain' | 'waves' | 'stream' | 'none'>('none');

  // ==========================================
  // 1. 赛博木鱼 (Cyber Muyu) State & Logic
  // ==========================================
  const [meritCount, setMeritCount] = useState<number>(() => {
    const saved = localStorage.getItem('pulseflow_cyber_merit');
    return saved ? parseInt(saved, 10) || 0 : 66;
  });
  const [isKnocking, setIsKnocking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [starParticles, setStarParticles] = useState<StarParticleItem[]>([]);
  const [selectedWordingKey, setSelectedWordingKey] = useState<string>('meritDefaultText');
  const [isAutoKnocking, setIsAutoKnocking] = useState<boolean>(false);
  const autoKnockIntervalRef = useRef<number | null>(null);

  const WORDING_OPTIONS = [
    { key: 'meritDefaultText', label: t('meritDefaultText'), color: '#f59e0b' },
    { key: 'meritHair', label: t('meritHair'), color: '#10b981' },
    { key: 'meritBug', label: t('meritBug'), color: '#3b82f6' },
    { key: 'meritAnxiety', label: t('meritAnxiety'), color: '#8b5cf6' },
    { key: 'meritAccept', label: t('meritAccept'), color: '#ec4899' },
  ];

  const handleKnock = (e?: React.MouseEvent | React.TouchEvent) => {
    // Play authentic resonant wooden fish sound
    soundManager.playWoodenFish();
    HapticsService.light();

    // Animate fish & mallet
    setIsKnocking(true);
    setTimeout(() => setIsKnocking(false), 120);

    // Increment merit
    setMeritCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('pulseflow_cyber_merit', next.toString());
      return next;
    });

    // Spawn floating text
    const textOption = WORDING_OPTIONS.find((o) => o.key === selectedWordingKey) || WORDING_OPTIONS[0];
    const textId = `txt_${Date.now()}_${Math.random()}`;
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 20;

    setFloatingTexts((prev) => [
      ...prev.slice(-8), // Keep max 8 active floating texts
      {
        id: textId,
        text: textOption.label,
        x: offsetX,
        y: offsetY,
        color: textOption.color,
      },
    ]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== textId));
    }, 1100);

    // Spawn 6 - 8 little stars exploding around the fish
    const starColors = ['#f59e0b', '#fbbf24', '#38bdf8', '#34d399', '#a78bfa'];
    const newStars: StarParticleItem[] = Array.from({ length: 7 }).map((_, idx) => {
      const angle = (Math.PI * 2 * idx) / 7 + (Math.random() - 0.5) * 0.5;
      const speed = 25 + Math.random() * 45;
      return {
        id: `star_${Date.now()}_${idx}`,
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        size: 10 + Math.random() * 8,
        color: starColors[idx % starColors.length],
        rotation: Math.random() * 360,
      };
    });

    setStarParticles((prev) => [...prev.slice(-14), ...newStars]);
    setTimeout(() => {
      setStarParticles((prev) => prev.filter((s) => !newStars.some((ns) => ns.id === s.id)));
    }, 800);
  };

  // Auto-knock loop
  useEffect(() => {
    if (isAutoKnocking && activeMode === 'muyu') {
      autoKnockIntervalRef.current = window.setInterval(() => {
        handleKnock();
      }, 1000);
    } else {
      if (autoKnockIntervalRef.current) {
        clearInterval(autoKnockIntervalRef.current);
        autoKnockIntervalRef.current = null;
      }
    }
    return () => {
      if (autoKnockIntervalRef.current) {
        clearInterval(autoKnockIntervalRef.current);
      }
    };
  }, [isAutoKnocking, activeMode, selectedWordingKey]);

  // ==========================================
  // 2. 赛博小烟 (Cyber Smoke Luxury Edition) is now fully encapsulated in <CyberSmokeLuxury />
  // ==========================================

  // ==========================================
  // 3. 引力星辰 (Gravity Stars)
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }>>([]);
  const mouseRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: -1000, y: -1000, isDown: false });

  const initStardust = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = (canvas.width = canvas.offsetWidth || 340);
    const height = (canvas.height = canvas.offsetHeight || 300);

    const colors = ['#38bdf8', '#34d399', '#a78bfa', '#f472b6', '#f59e0b', '#2dd4bf'];
    const particles = [];
    for (let i = 0; i < 110; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.0,
        vy: (Math.random() - 0.5) * 1.0,
        radius: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.6,
      });
    }
    particlesRef.current = particles;
  };

  useEffect(() => {
    if (activeMode !== 'gravity') return;
    initStardust();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let chimeThrottle = 0;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Soft trail fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.fillRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isDown = mouseRef.current.isDown;

      particlesRef.current.forEach((p, idx) => {
        // Gravitational attraction to finger/cursor
        if (isDown) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 8) {
            const force = 32 / dist;
            p.vx += (dx / dist) * force * 0.12;
            p.vy += (dy / dist) * force * 0.12;
          }
        }

        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundary
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        // Render glowing stardust
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      // Play soothing pentatonic chime occasionally on drag
      if (isDown) {
        chimeThrottle++;
        if (chimeThrottle % 36 === 0) {
          soundManager.playPentatonicChime();
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeMode]);

  // ==========================================
  // 4. 待开发游戏状态与交互: 云端撸猫 (Pet Cat)
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
    { id: 'muyu', icon: '🪵', label: language === 'zh' ? '赛博木鱼' : 'Cyber Muyu', isPending: false },
    { id: 'smoke', icon: '🚬', label: language === 'zh' ? '赛博小烟' : 'Cyber Smoke', isPending: false },
    { id: 'gravity', icon: '🪐', label: language === 'zh' ? '引力星辰' : 'Gravity Stars', isPending: false },
    { id: 'busking', icon: '🎪', label: language === 'zh' ? '赛博街艺' : 'Cyber Street Arts', isPending: false },
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
      {/* GAME 1: 赛博木鱼 (Cyber Wooden Fish)                           */}
      {/* ============================================================== */}
      {activeMode === 'muyu' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden min-h-[380px]">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between z-10 mb-2">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono flex items-center space-x-1">
                <span>{t('muyuTitle')}</span>
              </span>
            </div>

            {/* Auto-knock Toggle Button */}
            <button
              onClick={() => {
                HapticsService.light();
                setIsAutoKnocking(!isAutoKnocking);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition active:scale-95 border ${
                isAutoKnocking
                  ? 'bg-teal-500 text-white border-teal-500 shadow-xs shadow-teal-500/20 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-teal-600'
              }`}
            >
              {isAutoKnocking ? t('autoKnockOn') : t('autoKnockOff')}
            </button>
          </div>

          {/* Merit Counter Board */}
          <div className="my-2 px-4 py-1.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center font-mono">
            <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mr-1.5">{t('meritLabel')}:</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {meritCount}
            </span>
          </div>

          {/* Interactive Wooden Fish & Mallet Stage */}
          <div 
            onClick={handleKnock}
            className="flex-1 w-full flex flex-col items-center justify-center relative cursor-pointer py-4"
          >
            {/* Floating "+1 Merit" Texts */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {floatingTexts.map((item) => (
                <div
                  key={item.id}
                  style={{
                    transform: `translate(${item.x}px, ${item.y - 65}px)`,
                    color: item.color,
                  }}
                  className="absolute font-black font-mono text-base tracking-wider drop-shadow-md animate-fade-out-up select-none pointer-events-none whitespace-nowrap z-20"
                >
                  {item.text}
                </div>
              ))}

              {/* Exploding Golden Stars */}
              {starParticles.map((star) => (
                <div
                  key={star.id}
                  style={{
                    transform: `translate(${star.vx}px, ${star.vy}px) rotate(${star.rotation}deg)`,
                    color: star.color,
                    fontSize: `${star.size}px`,
                  }}
                  className="absolute animate-ping font-serif select-none pointer-events-none z-10 transition-transform duration-500 opacity-90"
                >
                  ✦
                </div>
              ))}
            </div>

            {/* Ripple Pulse on Knock */}
            {isKnocking && (
              <div className="absolute w-44 h-44 rounded-full border-2 border-amber-400/40 dark:border-amber-300/30 animate-ping pointer-events-none" />
            )}

            {/* Wooden Fish Vector Art */}
            <div className={`relative transition-transform duration-100 ease-out select-none ${isKnocking ? 'scale-90' : 'hover:scale-105'}`}>
              <svg 
                className="w-48 h-40 filter drop-shadow-xl" 
                viewBox="0 0 200 160" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Cyber Wood Gradients */}
                  <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="50%" stopColor="#92400e" />
                    <stop offset="100%" stopColor="#451a03" />
                  </linearGradient>
                  <linearGradient id="neonAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <filter id="muyuGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Base Shadow */}
                <ellipse cx="100" cy="148" rx="65" ry="10" fill="#000000" opacity="0.18" />

                {/* Main Wooden Fish Body */}
                <path
                  d="M40 95 C25 60, 50 25, 95 20 C145 15, 175 50, 165 95 C158 128, 120 145, 85 142 C50 138, 45 115, 40 95 Z"
                  fill="url(#woodGrad)"
                  stroke="#b45309"
                  strokeWidth="3.5"
                  filter="url(#muyuGlow)"
                />

                {/* Hollow Mouth Cavity Opening */}
                <path
                  d="M48 95 C60 112, 100 120, 142 98 C145 106, 125 125, 88 125 C60 125, 45 108, 48 95 Z"
                  fill="#1c1917"
                  stroke="#d97706"
                  strokeWidth="2"
                />

                {/* Cyber Carving Lines (Glowing Neon Seams) */}
                <path
                  d="M65 42 C90 32, 130 38, 148 65"
                  stroke="url(#neonAccent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <path
                  d="M72 58 C95 48, 125 54, 140 76"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.6"
                />

                {/* Spiral Eye / Resonant Focus Bead */}
                <circle cx="70" cy="75" r="9" fill="#1c1917" stroke="#fbbf24" strokeWidth="2.5" />
                <circle cx="70" cy="75" r="3.5" fill="#38bdf8" />

                {/* Scales / Rhythm Marks */}
                <path d="M105 52 C115 58, 115 68, 105 72" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                <path d="M122 62 C132 68, 132 78, 122 82" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {/* Wooden Mallet (Strikes on click) */}
              <div 
                className={`absolute -right-4 -top-6 pointer-events-none transition-transform duration-100 ease-out origin-bottom-right ${
                  isKnocking ? 'rotate-[-38deg] translate-x-[-18px] translate-y-[22px]' : 'rotate-[-10deg]'
                }`}
              >
                <div className="w-4 h-24 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full shadow-md border border-amber-600/50 flex flex-col items-center">
                  {/* Mallet head */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 shadow-md border-2 border-amber-400 -mt-2" />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-3 animate-pulse">
              {language === 'zh' ? '点击木鱼敲击' : 'Tap to strike wooden fish'}
            </p>
          </div>

          {/* Wording Selection Pills (功德 +1 / 头发 +1 / Bug -1) */}
          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">
              {language === 'zh' ? '祈福词：' : 'Blessing: '}
            </span>
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              {WORDING_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    HapticsService.selection();
                    setSelectedWordingKey(opt.key);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium transition whitespace-nowrap ${
                    selectedWordingKey === opt.key
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* GAME 2: 赛博小烟 (Cyber Smoke)                                  */}
      {/* ============================================================== */}
      {activeMode === 'smoke' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2 z-10">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
              {t('smokeTitle')}
            </span>
          </div>

          <CyberSmokeLuxury />
        </div>
      )}

      {/* ============================================================== */}
      {/* GAME 3: 引力星辰 (Gravity Stars)                              */}
      {/* ============================================================== */}
      {activeMode === 'gravity' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2 z-10">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
              {t('gravityTitle')}
            </span>
            <button
              onClick={() => {
                soundManager.playPentatonicChime();
                initStardust();
              }}
              title={t('clearCanvas')}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-300 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="relative w-full h-[280px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-crosshair">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, isDown: true };
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                mouseRef.current.x = e.clientX - rect.left;
                mouseRef.current.y = e.clientY - rect.top;
              }}
              onMouseUp={() => { mouseRef.current.isDown = false; }}
              onMouseLeave={() => { mouseRef.current.isDown = false; }}
              onTouchStart={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const t = e.touches[0];
                mouseRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top, isDown: true };
              }}
              onTouchMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const t = e.touches[0];
                mouseRef.current.x = t.clientX - rect.left;
                mouseRef.current.y = t.clientY - rect.top;
              }}
              onTouchEnd={() => { mouseRef.current.isDown = false; }}
            />
            <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 pointer-events-none font-mono">
              ✦ {language === 'zh' ? '在画布上滑动手指，引导发光星辰漩涡' : 'Drag on canvas to guide star vortex'}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* GAME 4: 赛博街艺 (Cyber Street Arts)                           */}
      {/* ============================================================== */}
      {activeMode === 'busking' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2 z-10">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
              {t('buskingTitle')}
            </span>
          </div>

          <CyberBuskingGame />
        </div>
      )}

      {/* ============================================================== */}
      {/* GAME 5: 云端撸猫 (Pet Cat - 待开发)                             */}
      {/* ============================================================== */}
      {activeMode === 'cat' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden min-h-[380px]">
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

          {/* Dedicated 280px Cyber Chamber Viewport */}
          <div className="relative w-full h-[280px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 flex flex-col items-center justify-between p-4 select-none shadow-inner">
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
              <div className={`absolute w-36 h-36 rounded-full border border-rose-500/30 transition-all duration-700 pointer-events-none ${
                isPettingCat ? 'scale-125 opacity-100 animate-ping' : 'scale-90 opacity-20'
              }`} />

              {/* Vector Sleeping Cyber Cat */}
              <div 
                onClick={handlePetCat}
                className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 py-1"
              >
                <svg className="w-36 h-28 filter drop-shadow-xl" viewBox="0 0 160 120" fill="none">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden min-h-[380px]">
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

          {/* Dedicated 280px Cyber Chamber Viewport */}
          <div className="relative w-full h-[280px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 flex flex-col items-center justify-between p-4 select-none shadow-inner">
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
                <svg className="w-36 h-28 filter drop-shadow-xl" viewBox="0 0 160 120" fill="none">
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
