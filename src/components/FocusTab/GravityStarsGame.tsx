import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Sparkles, Compass, Music, Disc, Bell } from 'lucide-react';
import { soundManager } from '../../services/audio';
import { HapticsService } from '../../services/haptics';
import { useLanguage } from '../../i18n/LanguageContext';

type SoundMode = 'handpan' | 'bowl' | 'chime';

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  mass: number;
  trail: Array<{ x: number; y: number }>;
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

interface SupernovaShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  color: string;
  life: number;
}

export const GravityStarsGame: React.FC = () => {
  const { language, t } = useLanguage();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Soundscape selection
  const [soundMode, setSoundMode] = useState<SoundMode>(() => {
    const saved = localStorage.getItem('pulseflow_gravity_sound');
    return (saved === 'bowl' || saved === 'chime' || saved === 'handpan') ? saved : 'handpan';
  });

  // Gyroscope fluid drift toggle
  const [isGyroEnabled, setIsGyroEnabled] = useState<boolean>(() => {
    return localStorage.getItem('pulseflow_gravity_gyro') === 'true';
  });
  const [isGyroSupported, setIsGyroSupported] = useState<boolean>(false);

  // Active touch points (up to 2 for binary star system)
  const touchesRef = useRef<TouchPoint[]>([]);
  const lastTouchTimeRef = useRef<number>(0);

  // Particles & Shockwaves
  const particlesRef = useRef<StarParticle[]>([]);
  const shockwavesRef = useRef<SupernovaShockwave[]>([]);

  // Smooth Gyroscope gravity vector
  const gyroRef = useRef<{ gx: number; gy: number }>({ gx: 0, gy: 0 });

  // Sound throttle & note progression
  const soundThrottleRef = useRef<number>(0);
  const noteSequenceRef = useRef<number>(0);

  // Initialize cosmic stardust
  const initStardust = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = (canvas.width = canvas.offsetWidth || 360);
    const height = (canvas.height = canvas.offsetHeight || 450);

    const colors = [
      '#38bdf8', // Neon Sky Blue
      '#34d399', // Mint Jade
      '#a78bfa', // Cosmic Violet
      '#f472b6', // Nebula Rose
      '#fbbf24', // Warm Amber
      '#22d3ee', // Cyber Cyan
      '#e879f9', // Radiant Magenta
      '#60a5fa', // Electric Blue
    ];

    const particles: StarParticle[] = [];
    const count = 210;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        radius: 1.4 + Math.random() * 2.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.35 + Math.random() * 0.55,
        mass: 0.8 + Math.random() * 0.6,
        trail: [],
      });
    }

    particlesRef.current = particles;
    shockwavesRef.current = [];
  }, []);

  // Trigger a Supernova burst from a center point
  const triggerSupernova = useCallback((x: number, y: number, color = '#38bdf8') => {
    HapticsService.medium();

    // Sound burst
    soundManager.playSupernovaBurst();

    // Create expanding shockwave
    shockwavesRef.current.push({
      x,
      y,
      radius: 12,
      maxRadius: 320,
      strength: 1.0,
      color,
      life: 1.0,
    });

    // Explosive impulse onto all particles within blast range
    particlesRef.current.forEach((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 280) {
        const angle = Math.atan2(dy, dx);
        const force = Math.max(0, (280 - dist) / 280) * 16;
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
        p.alpha = Math.min(1.0, p.alpha + 0.4);
      }
    });
  }, []);

  // Gyroscope orientation event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null && e.beta === null) return;
      setIsGyroSupported(true);

      if (!isGyroEnabled) {
        gyroRef.current = { gx: 0, gy: 0 };
        return;
      }

      // gamma is left-to-right tilt (-90 to +90)
      // beta is front-to-back tilt (-180 to +180)
      const gamma = Math.max(-45, Math.min(45, e.gamma || 0));
      const beta = Math.max(-45, Math.min(45, (e.beta || 0) - 25)); // assume ~25 deg comfortable holding angle

      // Smooth low-pass filtered gravity force
      const targetGx = Math.sin((gamma * Math.PI) / 45) * 0.32;
      const targetGy = Math.sin((beta * Math.PI) / 45) * 0.32;

      gyroRef.current.gx += (targetGx - gyroRef.current.gx) * 0.12;
      gyroRef.current.gy += (targetGy - gyroRef.current.gy) * 0.12;
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isGyroEnabled]);

  // Request Gyroscope Permission (iOS 13+ requirement)
  const toggleGyroscope = async () => {
    HapticsService.selection();
    if (!isGyroEnabled) {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        // @ts-expect-error iOS Safari proprietary permission API
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          // @ts-expect-error iOS Safari proprietary permission API
          const perm = await DeviceOrientationEvent.requestPermission();
          if (perm !== 'granted') return;
        } catch {
          return;
        }
      }
      setIsGyroEnabled(true);
      localStorage.setItem('pulseflow_gravity_gyro', 'true');
    } else {
      setIsGyroEnabled(false);
      localStorage.setItem('pulseflow_gravity_gyro', 'false');
      gyroRef.current = { gx: 0, gy: 0 };
    }
  };

  const handleCycleSound = () => {
    HapticsService.selection();
    const modes: SoundMode[] = ['handpan', 'bowl', 'chime'];
    const next = modes[(modes.indexOf(soundMode) + 1) % modes.length];
    setSoundMode(next);
    localStorage.setItem('pulseflow_gravity_sound', next);

    // Play preview tone
    if (next === 'handpan') soundManager.playHandpanTone(0);
    else if (next === 'bowl') soundManager.playSingingBowlResonance(0);
    else soundManager.playPentatonicChime(0);
  };

  // Main Canvas Setup & 60fps Physics Animation Loop
  useEffect(() => {
    initStardust();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const w = containerRef.current.offsetWidth || 360;
      const h = containerRef.current.offsetHeight || 450;
      canvas.width = w;
      canvas.height = h;
    };

    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) ro.observe(containerRef.current);

    let pulseAngle = 0;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Soft trail fade (cosmic deep space)
      ctx.fillStyle = 'rgba(10, 15, 29, 0.22)';
      ctx.fillRect(0, 0, width, height);

      pulseAngle = (pulseAngle + 0.04) % (Math.PI * 2);
      const activeTouches = touchesRef.current;
      const isSingle = activeTouches.length === 1;
      const isBinary = activeTouches.length >= 2;

      // =========================================================
      // 1. Render Active Gravity Singularity Core(s)
      // =========================================================
      if (activeTouches.length > 0) {
        // Draw Binary Star Bridge if 2 fingers active
        if (isBinary) {
          const t1 = activeTouches[0];
          const t2 = activeTouches[1];
          const bridgeDist = Math.hypot(t2.x - t1.x, t2.y - t1.y);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${Math.max(0.2, 0.7 - bridgeDist / 500)})`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 8]);
          ctx.stroke();

          // Midpoint Lagrange equilibrium glow
          const midX = (t1.x + t2.x) / 2;
          const midY = (t1.y + t2.y) / 2;
          ctx.beginPath();
          ctx.arc(midX, midY, 8 + Math.sin(pulseAngle * 2) * 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(232, 121, 249, 0.45)';
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#e879f9';
          ctx.fill();
          ctx.restore();
        }

        // Draw individual gravity cores & accretion horizon
        activeTouches.slice(0, 2).forEach((touch, idx) => {
          const isCoreB = idx === 1;
          const coreColor = isCoreB ? '#f472b6' : '#22d3ee';
          const outerR = 34 + Math.sin(pulseAngle + idx * Math.PI) * 7;

          ctx.save();
          // Accretion Disk Orbit Ring
          ctx.beginPath();
          ctx.arc(touch.x, touch.y, outerR, 0, Math.PI * 2);
          ctx.strokeStyle = isCoreB ? 'rgba(244, 114, 182, 0.38)' : 'rgba(34, 211, 238, 0.38)';
          ctx.lineWidth = 1.6;
          ctx.setLineDash([4, 6]);
          ctx.stroke();

          // Gravitational Lens Event Horizon
          const grad = ctx.createRadialGradient(touch.x, touch.y, 2, touch.x, touch.y, 20);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          grad.addColorStop(0.35, isCoreB ? 'rgba(244, 114, 182, 0.85)' : 'rgba(34, 211, 238, 0.85)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(touch.x, touch.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.shadowBlur = 18;
          ctx.shadowColor = coreColor;
          ctx.fill();

          // Black hole center point
          ctx.beginPath();
          ctx.arc(touch.x, touch.y, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#020617';
          ctx.fill();
          ctx.restore();
        });
      }

      // =========================================================
      // 2. Supernova Shockwave Propagation (方案 A)
      // =========================================================
      for (let sIdx = shockwavesRef.current.length - 1; sIdx >= 0; sIdx--) {
        const sw = shockwavesRef.current[sIdx];
        sw.radius += 8.5;
        sw.life = Math.max(0, 1 - sw.radius / sw.maxRadius);

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${sw.life * 0.75})`;
        ctx.lineWidth = 3.5 * sw.life;
        ctx.shadowBlur = 20 * sw.life;
        ctx.shadowColor = sw.color;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.82, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${sw.life * 0.55})`;
        ctx.lineWidth = 1.8 * sw.life;
        ctx.stroke();
        ctx.restore();

        if (sw.life <= 0) {
          shockwavesRef.current.splice(sIdx, 1);
        }
      }

      // =========================================================
      // 3. Constellation Weaver Proximity Mesh (方案 C)
      // =========================================================
      const particles = particlesRef.current;
      const pLen = particles.length;
      let linesDrawn = 0;
      const MAX_CONSTELLATION_LINES = 110;

      ctx.save();
      ctx.lineWidth = 0.85;
      for (let i = 0; i < pLen && linesDrawn < MAX_CONSTELLATION_LINES; i += 2) {
        const p1 = particles[i];
        for (let j = i + 1; j < pLen && linesDrawn < MAX_CONSTELLATION_LINES; j += 2) {
          const p2 = particles[j];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          if (dist < 44) {
            const lineAlpha = (1 - dist / 44) * 0.28;
            ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            linesDrawn++;
          }
        }
      }
      ctx.restore();

      // =========================================================
      // 4. Particle Physics: Gravity + Accretion Vortex + Gyro
      // =========================================================
      const gx = gyroRef.current.gx;
      const gy = gyroRef.current.gy;

      particles.forEach((p, idx) => {
        // Gyroscope tilt drift acceleration (方案 D)
        if (isGyroEnabled) {
          p.vx += gx;
          p.vy += gy;
        }

        // Active touch gravity wells
        if (activeTouches.length > 0) {
          if (isSingle) {
            // Single Black Hole Singularity: Inward pull + Clockwise Vortex Torque
            const t = activeTouches[0];
            const dx = t.x - p.x;
            const dy = t.y - p.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 280 && dist > 8) {
              const normalX = dx / dist;
              const normalY = dy / dist;
              const gravityForce = 44 / dist;

              // Inward radial pull
              p.vx += normalX * gravityForce * 0.16;
              p.vy += normalY * gravityForce * 0.16;

              // Tangential Accretion Swirl (方案 A 吸积盘切向自旋)
              const tangentX = -normalY;
              const tangentY = normalX;
              const spinSpeed = Math.min(3.2, 38 / Math.sqrt(dist));
              p.vx += tangentX * spinSpeed * 0.11;
              p.vy += tangentY * spinSpeed * 0.11;
            }
          } else if (isBinary) {
            // Binary Star System: 8-Figure Lorentz Chaotic Orbits (方案 B)
            activeTouches.slice(0, 2).forEach((t, tIdx) => {
              const dx = t.x - p.x;
              const dy = t.y - p.y;
              const dist = Math.hypot(dx, dy);

              if (dist < 260 && dist > 8) {
                const normalX = dx / dist;
                const normalY = dy / dist;
                const gravityForce = 36 / dist;

                p.vx += normalX * gravityForce * 0.14;
                p.vy += normalY * gravityForce * 0.14;

                // Star 1 spins clockwise (+), Star 2 spins counter-clockwise (-)
                const direction = tIdx === 0 ? 1 : -1;
                const tangentX = -normalY * direction;
                const tangentY = normalX * direction;
                const spinSpeed = Math.min(2.8, 32 / Math.sqrt(dist));
                p.vx += tangentX * spinSpeed * 0.09;
                p.vy += tangentY * spinSpeed * 0.09;
              }
            });
          }
        }

        // Space drag / damping
        p.vx *= 0.984;
        p.vy *= 0.984;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap or bounce around universe boundaries
        if (p.x < 0) { p.x = 0; p.vx *= -0.7; }
        if (p.x > width) { p.x = width; p.vx *= -0.7; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.7; }
        if (p.y > height) { p.y = height; p.vy *= -0.7; }

        // Render glowing stardust
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      // =========================================================
      // 5. Soundscape Harmonic Resonance Trigger (方案 C)
      // =========================================================
      if (activeTouches.length > 0) {
        soundThrottleRef.current++;
        if (soundThrottleRef.current % 32 === 0) {
          noteSequenceRef.current = (noteSequenceRef.current + 1) % 8;
          if (soundMode === 'handpan') {
            soundManager.playHandpanTone(noteSequenceRef.current);
          } else if (soundMode === 'bowl') {
            soundManager.playSingingBowlResonance(noteSequenceRef.current);
          } else {
            soundManager.playPentatonicChime(noteSequenceRef.current);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      ro.disconnect();
    };
  }, [initStardust, soundMode, isGyroEnabled]);

  // Touch Event Handlers (Multi-Touch for Binary Stars)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const now = Date.now();

    // Check double-tap to trigger central Supernova
    if (now - lastTouchTimeRef.current < 260 && e.touches.length === 1) {
      const t = e.touches[0];
      triggerSupernova(t.clientX - rect.left, t.clientY - rect.top, '#f472b6');
      lastTouchTimeRef.current = 0;
      return;
    }
    lastTouchTimeRef.current = now;

    const currentTouches: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      currentTouches.push({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      });
    }
    touchesRef.current = currentTouches;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const currentTouches: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      currentTouches.push({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      });
    }
    touchesRef.current = currentTouches;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // When releasing the last finger: Trigger Supernova burst at release point (方案 A)
    if (touchesRef.current.length > 0 && e.touches.length === 0) {
      const lastPoint = touchesRef.current[0];
      triggerSupernova(lastPoint.x, lastPoint.y, '#38bdf8');
    }

    const currentTouches: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      currentTouches.push({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      });
    }
    touchesRef.current = currentTouches;
  };

  // Mouse fallback handlers for desktop pairing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const now = Date.now();

    if (now - lastTouchTimeRef.current < 260) {
      triggerSupernova(e.clientX - rect.left, e.clientY - rect.top, '#e879f9');
      lastTouchTimeRef.current = 0;
      return;
    }
    lastTouchTimeRef.current = now;

    touchesRef.current = [{
      id: 1,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (touchesRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    touchesRef.current[0] = {
      id: 1,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (touchesRef.current.length > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        triggerSupernova(e.clientX - rect.left, e.clientY - rect.top, '#38bdf8');
      }
    }
    touchesRef.current = [];
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center relative overflow-hidden">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between mb-2 z-10 font-mono">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
          <span>{t('gravityTitle')}</span>
        </span>

        {/* Right Top Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Soundscape Selector Pill */}
          <button
            onClick={handleCycleSound}
            title={language === 'zh' ? '切换音疗音色' : 'Switch Soundscape'}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition text-[11px] font-bold flex items-center space-x-1.5 active:scale-95 border border-slate-200/60 dark:border-slate-700"
          >
            {soundMode === 'handpan' && <Disc className="w-3.5 h-3.5 text-cyan-500 animate-spin" style={{ animationDuration: '6s' }} />}
            {soundMode === 'bowl' && <Bell className="w-3.5 h-3.5 text-amber-500 animate-bounce" />}
            {soundMode === 'chime' && <Music className="w-3.5 h-3.5 text-purple-500" />}
            <span className="truncate">
              {soundMode === 'handpan' && t('gravitySoundHandpan')}
              {soundMode === 'bowl' && t('gravitySoundBowl')}
              {soundMode === 'chime' && t('gravitySoundChime')}
            </span>
          </button>

          {/* Gyroscope Fluid Drift Toggle */}
          <button
            onClick={toggleGyroscope}
            title={isGyroEnabled ? t('gravityGyroOn') : t('gravityGyroOff')}
            className={`px-2.5 py-1 rounded-xl transition text-[11px] font-bold flex items-center space-x-1 active:scale-95 border ${
              isGyroEnabled
                ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${isGyroEnabled ? 'animate-pulse text-cyan-500' : ''}`} />
            <span className="hidden sm:inline">
              {isGyroEnabled ? t('gravityGyroOn') : t('gravityGyroOff')}
            </span>
          </button>

          {/* Reset Orbit Button */}
          <button
            onClick={() => {
              HapticsService.light();
              soundManager.playPentatonicChime();
              initStardust();
            }}
            title={t('clearCanvas')}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-300 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unified 450px/480px Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[450px] sm:h-[480px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-crosshair select-none shadow-inner touch-none"
      >
        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400/90 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center space-x-1.5 pointer-events-none z-10 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            {touchesRef.current.length >= 2
              ? t('gravityBinary')
              : touchesRef.current.length === 1
              ? t('gravitySingularity')
              : 'COSMIC ORBIT · 万有引力'}
          </span>
        </div>

        {/* Gyro Fluid Indicator Badge if Active */}
        {isGyroEnabled && (
          <div className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400/90 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center space-x-1 pointer-events-none z-10 shadow-md">
            <Compass className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>GRAVITY FLOW</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Bottom Floating Guidance Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-mono text-slate-300/85 bg-slate-900/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/60 pointer-events-none flex items-center space-x-1.5 shadow-lg whitespace-nowrap z-10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isGyroEnabled
              ? t('gravityHintGyro')
              : touchesRef.current.length >= 2
              ? t('gravityHintBinary')
              : t('gravityHintSingle')}
          </span>
        </div>
      </div>
    </div>
  );
};
