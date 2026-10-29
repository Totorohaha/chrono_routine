import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { HapticsService } from '../../services/haptics';

type MuyuSkin = 'zen' | 'cyber' | 'cat';

interface SkinConfig {
  bodyClass: string;
  themeClass: string;
  waveColors: string[];
  textColors: string[];
  particles: string[];
  nameZh: string;
  nameEn: string;
  icon: string;
}

const SKIN_CONFIGS: Record<MuyuSkin, SkinConfig> = {
  zen: {
    bodyClass: 'theme-zen',
    themeClass: 'muyu-theme-zen',
    waveColors: ['#fde047', '#fbbf24', '#f59e0b'],
    textColors: ['#fef3c7', '#fde68a', '#fbbf24', '#fffbeb'],
    particles: ['✦', '★', '✧', '❂'],
    nameZh: '古寺檀香',
    nameEn: 'Ancient Zen',
    icon: '🪘',
  },
  cyber: {
    bodyClass: 'theme-cyber',
    themeClass: 'muyu-theme-cyber',
    waveColors: ['#fde047', '#f59e0b', '#38bdf8'],
    textColors: ['#fef08a', '#fbbf24', '#7dd3fc', '#fffbeb'],
    particles: ['⚙️', '✦', '★', '⚡', '✧'],
    nameZh: '重工机械',
    nameEn: 'Heavy Mech',
    icon: '⚙️',
  },
  cat: {
    bodyClass: 'theme-cat',
    themeClass: 'muyu-theme-cat',
    waveColors: ['#ff8fab', '#ffc2d1', '#fde047'],
    textColors: ['#ffe5ec', '#ff8fab', '#fde68a', '#ffffff'],
    particles: ['🐾', '🐟', '✦', '★', '♡'],
    nameZh: '萌喵驾到',
    nameEn: 'Lucky Cat',
    icon: '🐱',
  },
};

const COMMON_PHRASES_ZH = [
  '功德 +1',
  '头发 +1',
  '暴富 +1',
  '好运 +1',
  '烦恼 -1',
  '发量惊人 +1',
  '欧气满满 +1',
  '心平气和 +1',
  '财运亨通 +1',
  '水逆退散 +1',
];

const COMMON_PHRASES_EN = [
  'Merit +1',
  'Hair Growth +1',
  'Fortune +1',
  'Good Luck +1',
  'Anxiety -1',
  'Flow State +1',
  'Deep Serenity +1',
  'Peace of Mind +1',
  'Circadian Balance +1',
  'Blessings +1',
];

const THEME_PHRASES_ZH: Record<MuyuSkin, string[]> = {
  zen: ['功德圆满 +1', '善缘 +1', '智慧 +1', '福报 +1'],
  cyber: ['齿轮咬合 +1', '发条满弦 +100%', '蒸汽动力 +99', '精密运转 0误差', '机械功德 +1'],
  cat: ['喵德 +1', '小鱼干 +1', '喵喵保佑 +1', '罐罐自由 +1', '吸猫欧气 +99'],
};

const THEME_PHRASES_EN: Record<MuyuSkin, string[]> = {
  zen: ['Merit Fulfilled +1', 'Karmic Harmony +1', 'Inner Wisdom +1', 'Zen Nirvana +1'],
  cyber: ['Gear Meshed +1', 'Spring Wound +100%', 'Steam Power +99', 'Zero Tolerance +1', 'Cyber Merit +1'],
  cat: ['Meow Merit +1', 'Tuna Treat +1', 'Kitty Blessing +1', 'Canned Food Free +1', 'Cat Nirvana +99'],
};

export const LuckyMuyuGame: React.FC = () => {
  const { language, t } = useLanguage();

  const [skin, setSkin] = useState<MuyuSkin>(() => {
    const s = localStorage.getItem('pulseflow_muyu_skin');
    return s === 'cyber' || s === 'cat' ? s : 'zen';
  });

  const [meritCount, setMeritCount] = useState<number>(() => {
    const s = localStorage.getItem('pulseflow_cyber_merit');
    return s ? parseInt(s, 10) || 0 : 0;
  });

  const [isAutoKnocking, setIsAutoKnocking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const particleLayerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const autoKnockRef = useRef<number | null>(null);

  // Animation physical engine state
  const animRef = useRef({
    lastHitPerfTime: -9999,
    hitCount: 0,
    gearAngle: 0,
    gearVelocity: 0.45,
    reqId: 0,
  });

  // Cached DOM elements for 60fps direct transform updates
  const domCacheRef = useRef<{
    cushionActor: SVGGElement | null;
    fishActor: SVGGElement | null;
    malletActor: SVGGElement | null;
    swingTrail: SVGPathElement | null;
    crownBurst: SVGGElement | null;
    crownRing1: SVGEllipseElement | null;
    mouthWaves: SVGGElement | null;
    waveArc1: SVGPathElement | null;
    waveArc2: SVGPathElement | null;
    waveArc3: SVGPathElement | null;
    tailTasselGroups: NodeListOf<SVGGElement> | null;
    mouthInnerGlows: NodeListOf<SVGEllipseElement> | null;
    catEarLeft: SVGGElement | null;
    catEarRight: SVGGElement | null;
    catTailGroup: SVGGElement | null;
    mechGear1: SVGGElement | null;
    mechGear2: SVGGElement | null;
    mechGear3: SVGGElement | null;
    mechAnvil: SVGGElement | null;
    mechGaugeNeedle: SVGGElement | null;
  }>({
    cushionActor: null,
    fishActor: null,
    malletActor: null,
    swingTrail: null,
    crownBurst: null,
    crownRing1: null,
    mouthWaves: null,
    waveArc1: null,
    waveArc2: null,
    waveArc3: null,
    tailTasselGroups: null,
    mouthInnerGlows: null,
    catEarLeft: null,
    catEarRight: null,
    catTailGroup: null,
    mechGear1: null,
    mechGear2: null,
    mechGear3: null,
    mechAnvil: null,
    mechGaugeNeedle: null,
  });

  // Ensure Web Audio context
  const ensureAudio = useCallback(() => {
    if (isMuted) return null;
    try {
      if (!audioCtxRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AC) audioCtxRef.current = new AC();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, [isMuted]);

  // High-fidelity synthesized audio
  const playMuyuSound = useCallback((targetSkin: MuyuSkin) => {
    if (isMuted) return;
    try {
      const ctx = ensureAudio();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (targetSkin === 'zen') {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(176, now);
        osc1.frequency.exponentialRampToValueAtTime(130, now + 0.045);
        osc1.frequency.exponentialRampToValueAtTime(120, now + 0.28);

        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.92, now + 0.005);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.30);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(358, now);
        osc2.frequency.exponentialRampToValueAtTime(252, now + 0.05);

        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.linearRampToValueAtTime(0.42, now + 0.003);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(950, now);
        clickOsc.frequency.exponentialRampToValueAtTime(240, now + 0.018);

        clickGain.gain.setValueAtTime(0.35, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

        osc1.connect(gain1).connect(ctx.destination);
        osc2.connect(gain2).connect(ctx.destination);
        clickOsc.connect(clickGain).connect(ctx.destination);

        osc1.start(now); osc2.start(now); clickOsc.start(now);
        osc1.stop(now + 0.31); osc2.stop(now + 0.12); clickOsc.stop(now + 0.025);

      } else if (targetSkin === 'cyber') {
        const bell1 = ctx.createOscillator();
        const bellGain1 = ctx.createGain();
        bell1.type = 'triangle';
        bell1.frequency.setValueAtTime(218, now);
        bell1.frequency.exponentialRampToValueAtTime(164, now + 0.05);
        bell1.frequency.exponentialRampToValueAtTime(156, now + 0.32);

        bellGain1.gain.setValueAtTime(0.001, now);
        bellGain1.gain.linearRampToValueAtTime(0.85, now + 0.004);
        bellGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(588, now);
        chime.frequency.exponentialRampToValueAtTime(438, now + 0.19);

        chimeGain.gain.setValueAtTime(0.001, now);
        chimeGain.gain.linearRampToValueAtTime(0.36, now + 0.003);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);

        const ratchet = ctx.createOscillator();
        const ratchetGain = ctx.createGain();
        ratchet.type = 'sawtooth';
        ratchet.frequency.setValueAtTime(1480, now);
        ratchet.frequency.setValueAtTime(1920, now + 0.025);
        ratchet.frequency.setValueAtTime(2360, now + 0.052);

        ratchetGain.gain.setValueAtTime(0.28, now);
        ratchetGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

        bell1.connect(bellGain1).connect(ctx.destination);
        chime.connect(chimeGain).connect(ctx.destination);
        ratchet.connect(ratchetGain).connect(ctx.destination);

        bell1.start(now); chime.start(now); ratchet.start(now);
        bell1.stop(now + 0.35); chime.stop(now + 0.22); ratchet.stop(now + 0.09);

      } else if (targetSkin === 'cat') {
        const pop = ctx.createOscillator();
        const popGain = ctx.createGain();
        pop.type = 'sine';
        pop.frequency.setValueAtTime(245, now);
        pop.frequency.exponentialRampToValueAtTime(350, now + 0.036);
        pop.frequency.exponentialRampToValueAtTime(215, now + 0.16);

        popGain.gain.setValueAtTime(0.001, now);
        popGain.gain.linearRampToValueAtTime(0.68, now + 0.005);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        const meow = ctx.createOscillator();
        const meowFilter = ctx.createBiquadFilter();
        const meowGain = ctx.createGain();
        meow.type = 'triangle';
        const jitter = (Math.random() - 0.5) * 45;
        meow.frequency.setValueAtTime(540 + jitter, now + 0.01);
        meow.frequency.exponentialRampToValueAtTime(790 + jitter, now + 0.075);
        meow.frequency.exponentialRampToValueAtTime(495 + jitter, now + 0.22);

        meowFilter.type = 'bandpass';
        meowFilter.frequency.setValueAtTime(1180, now);
        meowFilter.Q.setValueAtTime(1.6, now);

        meowGain.gain.setValueAtTime(0.001, now);
        meowGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
        meowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(2720, now);
        bell.frequency.setValueAtTime(3420, now + 0.028);

        bellGain.gain.setValueAtTime(0.001, now);
        bellGain.gain.linearRampToValueAtTime(0.14, now + 0.003);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        pop.connect(popGain).connect(ctx.destination);
        meow.connect(meowFilter).connect(meowGain).connect(ctx.destination);
        bell.connect(bellGain).connect(ctx.destination);

        pop.start(now); meow.start(now); bell.start(now);
        pop.stop(now + 0.19); meow.stop(now + 0.25); bell.stop(now + 0.16);
      }
    } catch {
      // Audio error safety
    }
  }, [ensureAudio, isMuted]);

  // Pick random blessing phrase
  const pickPhrase = useCallback((currentSkin: MuyuSkin) => {
    const isEn = language === 'en';
    const common = isEn ? COMMON_PHRASES_EN : COMMON_PHRASES_ZH;
    const theme = (isEn ? THEME_PHRASES_EN : THEME_PHRASES_ZH)[currentSkin] || [];
    const pool = [...common, ...theme];
    return pool[Math.floor(Math.random() * pool.length)];
  }, [language]);

  // Spawn visual floating texts & spark particles
  const spawnFloatingEffects = useCallback((currentSkin: MuyuSkin) => {
    const layer = particleLayerRef.current;
    if (!layer) return;

    const cfg = SKIN_CONFIGS[currentSkin];

    // 1. Floating text
    const textEl = document.createElement('div');
    textEl.className = 'merit-float-text text-lg sm:text-2xl serif-cn';
    textEl.textContent = pickPhrase(currentSkin);

    const startX = 49 + (Math.random() * 12 - 6);
    const startY = 32 + (Math.random() * 6 - 3);
    const dx = (Math.random() * 60 - 30).toFixed(1) + 'px';
    const rot = (Math.random() * 10 - 5).toFixed(1) + 'deg';
    const color = cfg.textColors[Math.floor(Math.random() * cfg.textColors.length)];

    textEl.style.left = startX + '%';
    textEl.style.top = startY + '%';
    textEl.style.color = color;
    textEl.style.setProperty('--dx', dx);
    textEl.style.setProperty('--rot', rot);

    layer.appendChild(textEl);
    setTimeout(() => {
      if (textEl.parentNode) textEl.parentNode.removeChild(textEl);
    }, 1160);

    // 2. Star & theme particle explosion
    const starCount = 8 + Math.floor(Math.random() * 3);
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'spark-particle text-base sm:text-lg font-bold';
      star.textContent = cfg.particles[i % cfg.particles.length];

      const angle = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8;
      const dist = 55 + Math.random() * 85;
      const tx = (Math.cos(angle) * dist).toFixed(1) + 'px';
      const ty = (Math.sin(angle) * dist - 18).toFixed(1) + 'px';
      const r = ((Math.random() - 0.5) * 260).toFixed(0) + 'deg';

      star.style.left = (50 + (Math.random() * 10 - 5)) + '%';
      star.style.top = (36 + (Math.random() * 6 - 3)) + '%';
      star.style.color = cfg.textColors[i % cfg.textColors.length];
      star.style.setProperty('--tx', tx);
      star.style.setProperty('--ty', ty);
      star.style.setProperty('--r', r);

      layer.appendChild(star);
      setTimeout(() => {
        if (star.parentNode) star.parentNode.removeChild(star);
      }, 900);
    }
  }, [pickPhrase]);

  // Main knock action
  const triggerKnock = useCallback((showEffects = true) => {
    animRef.current.lastHitPerfTime = performance.now();
    animRef.current.hitCount += 1;
    animRef.current.gearVelocity = 16.5;

    HapticsService.light();
    playMuyuSound(skin);

    if (showEffects) {
      spawnFloatingEffects(skin);
      setMeritCount((prev) => {
        const next = prev + 1;
        localStorage.setItem('pulseflow_cyber_merit', next.toString());
        return next;
      });
    }
  }, [playMuyuSound, skin, spawnFloatingEffects]);

  // Switch skin handler
  const handleSwitchSkin = useCallback((newSkin: MuyuSkin) => {
    setSkin(newSkin);
    localStorage.setItem('pulseflow_muyu_skin', newSkin);

    const root = containerRef.current;
    if (!root) return;

    ['zen', 'cyber', 'cat'].forEach((k) => {
      const isMatch = k === newSkin;
      const c = root.querySelector(`#cushion-${k}`);
      const f = root.querySelector(`#fish-${k}`);
      const m = root.querySelector(`#mallet-${k}`);
      if (c) c.classList.toggle('hidden', !isMatch);
      if (f) f.classList.toggle('hidden', !isMatch);
      if (m) m.classList.toggle('hidden', !isMatch);
    });

    const cfg = SKIN_CONFIGS[newSkin];
    const crown1 = domCacheRef.current.crownRing1;
    const w1 = domCacheRef.current.waveArc1;
    const w2 = domCacheRef.current.waveArc2;
    const w3 = domCacheRef.current.waveArc3;

    if (crown1) crown1.setAttribute('stroke', cfg.waveColors[0]);
    if (w1) w1.setAttribute('stroke', cfg.waveColors[0]);
    if (w2) w2.setAttribute('stroke', cfg.waveColors[1]);
    if (w3) w3.setAttribute('stroke', cfg.waveColors[2]);

    triggerKnock(false);
  }, [triggerKnock]);

  // Mount & cache DOM nodes inside container
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    domCacheRef.current = {
      cushionActor: root.querySelector('#cushion-actor'),
      fishActor: root.querySelector('#fish-actor'),
      malletActor: root.querySelector('#mallet-actor'),
      swingTrail: root.querySelector('#swing-trail'),
      crownBurst: root.querySelector('#crown-burst'),
      crownRing1: root.querySelector('#crown-ring-1'),
      mouthWaves: root.querySelector('#mouth-waves'),
      waveArc1: root.querySelector('#wave-arc-1'),
      waveArc2: root.querySelector('#wave-arc-2'),
      waveArc3: root.querySelector('#wave-arc-3'),
      tailTasselGroups: root.querySelectorAll('.tail-tassel-group'),
      mouthInnerGlows: root.querySelectorAll('.mouth-inner-glow'),
      catEarLeft: root.querySelector('#cat-ear-left'),
      catEarRight: root.querySelector('#cat-ear-right'),
      catTailGroup: root.querySelector('#cat-tail-group'),
      mechGear1: root.querySelector('#mech-gear-1'),
      mechGear2: root.querySelector('#mech-gear-2'),
      mechGear3: root.querySelector('#mech-gear-3'),
      mechAnvil: root.querySelector('#mech-anvil'),
      mechGaugeNeedle: root.querySelector('#mech-gauge-needle'),
    };

    // Apply initial skin visibility
    ['zen', 'cyber', 'cat'].forEach((k) => {
      const isMatch = k === skin;
      const c = root.querySelector(`#cushion-${k}`);
      const f = root.querySelector(`#fish-${k}`);
      const m = root.querySelector(`#mallet-${k}`);
      if (c) c.classList.toggle('hidden', !isMatch);
      if (f) f.classList.toggle('hidden', !isMatch);
      if (m) m.classList.toggle('hidden', !isMatch);
    });

    const cfg = SKIN_CONFIGS[skin];
    const crown1 = domCacheRef.current.crownRing1;
    const w1 = domCacheRef.current.waveArc1;
    const w2 = domCacheRef.current.waveArc2;
    const w3 = domCacheRef.current.waveArc3;

    if (crown1) crown1.setAttribute('stroke', cfg.waveColors[0]);
    if (w1) w1.setAttribute('stroke', cfg.waveColors[0]);
    if (w2) w2.setAttribute('stroke', cfg.waveColors[1]);
    if (w3) w3.setAttribute('stroke', cfg.waveColors[2]);
  }, [skin]);

  // 60fps continuous physics & kinematics loop
  useEffect(() => {
    let active = true;

    function updatePhysicsFrame(now: number) {
      if (!active) return;

      const dt = now - animRef.current.lastHitPerfTime;
      const idleBreath = Math.sin(now * 0.0028);

      animRef.current.gearAngle = (animRef.current.gearAngle + animRef.current.gearVelocity) % 360;
      animRef.current.gearVelocity = 0.42 + (animRef.current.gearVelocity - 0.42) * 0.94;

      const dom = domCacheRef.current;

      /* A. Mallet actor kinematics */
      if (dom.malletActor && dom.swingTrail) {
        let malletDeg = idleBreath * 1.6;
        let malletShiftX = 0;
        let malletShiftY = idleBreath * 2.2;
        let trailOpacity = 0;

        if (dt >= 0 && dt < 380) {
          if (dt < 26) {
            const p = dt / 26;
            malletDeg = p * 15;
            malletShiftY = -p * 6;
          } else if (dt < 76) {
            const p = (dt - 26) / 50;
            const easeIn = p * p * (3 - 2 * p);
            malletDeg = 15 - easeIn * 41;
            malletShiftX = -easeIn * 6;
            malletShiftY = -6 + easeIn * 14;
            trailOpacity = Math.sin(p * Math.PI) * 0.85;
          } else {
            const t = (dt - 76) / 304;
            const springRebound = Math.exp(-5.2 * t) * Math.cos(13 * t);
            malletDeg = -26 * springRebound;
            malletShiftX = -6 * Math.exp(-6 * t);
            malletShiftY = 8 * Math.exp(-5 * t);
            trailOpacity = Math.max(0, (1 - t * 3.5) * 0.45);
          }
        }

        dom.malletActor.setAttribute(
          'transform',
          `translate(${(582 + malletShiftX).toFixed(2)}, ${(168 + malletShiftY).toFixed(2)}) rotate(${malletDeg.toFixed(2)})`
        );
        dom.swingTrail.setAttribute('opacity', trailOpacity.toFixed(3));
      }

      /* B. Fish body squish + ~26Hz high-frequency tremor */
      if (dom.fishActor) {
        let fishScaleX = 1;
        let fishScaleY = 1;
        let fishY = 0;
        let fishX = 0;
        let fishRot = 0;
        let tasselRot = idleBreath * 2;
        let earRot = idleBreath * 1.8;
        let glowAlpha = 0;

        const impactDt = dt - 48;
        if (impactDt >= 0 && impactDt < 520) {
          const s = impactDt / 1000;
          const decay = Math.exp(-8.5 * s);
          const fastDecay = Math.exp(-13 * s);

          const bounceWave = Math.sin(s * 34);
          const highFreqTremor = Math.sin(s * 165) * fastDecay;

          fishScaleX = 1 + (0.13 * bounceWave + 0.035 * highFreqTremor) * decay;
          fishScaleY = 1 - (0.14 * bounceWave + 0.035 * highFreqTremor) * decay;
          fishY = (13 * Math.sin(s * 30) + 3.5 * highFreqTremor) * decay;
          fishX = (4.5 * highFreqTremor) * decay;
          fishRot = (4.6 * Math.sin(s * 38) + 2.2 * highFreqTremor) * decay;

          tasselRot = Math.sin(s * 55) * 18 * decay;
          earRot = Math.sin(s * 68) * 16 * decay;
          glowAlpha = Math.max(0, Math.exp(-6.5 * s) * 0.92);
        }

        dom.fishActor.setAttribute(
          'transform',
          `translate(${(390 + fishX).toFixed(2)}, ${(434 + fishY).toFixed(2)}) rotate(${fishRot.toFixed(2)}) scale(${fishScaleX.toFixed(4)}, ${fishScaleY.toFixed(4)}) translate(-390, -434)`
        );

        if (dom.tailTasselGroups) {
          dom.tailTasselGroups.forEach((g) => {
            g.setAttribute('transform', `rotate(${(tasselRot * 0.55).toFixed(2)}, 238, 252)`);
          });
        }

        if (dom.catTailGroup) {
          dom.catTailGroup.setAttribute('transform', `rotate(${(tasselRot * 0.45).toFixed(2)}, 228, 328)`);
        }

        if (dom.catEarLeft && dom.catEarRight) {
          const earTwitch = earRot * 0.45;
          dom.catEarLeft.setAttribute('transform', `rotate(${(-earTwitch).toFixed(2)}, 299, 207)`);
          dom.catEarRight.setAttribute('transform', `rotate(${(earTwitch * 1.1).toFixed(2)}, 472, 207)`);
        }

        if (dom.mechGear1 && dom.mechGear2 && dom.mechGear3) {
          dom.mechGear1.setAttribute('transform', `rotate(${animRef.current.gearAngle.toFixed(1)})`);
          dom.mechGear2.setAttribute('transform', `rotate(${(-animRef.current.gearAngle * 1.5).toFixed(1)})`);
          dom.mechGear3.setAttribute('transform', `rotate(${(animRef.current.gearAngle * 2.25).toFixed(1)})`);
        }

        if (dom.mechAnvil && dom.mechGaugeNeedle) {
          let anvilSinkY = 0;
          let needleDeg = -35 + idleBreath * 3;
          if (impactDt >= 0 && impactDt < 460) {
            const s = impactDt / 1000;
            const mDecay = Math.exp(-9 * s);
            anvilSinkY = Math.max(-2, Math.sin(s * 36) * 9.5 * mDecay);
            needleDeg = -35 + Math.max(0, Math.sin(s * 22) * 95 * mDecay);
          }
          dom.mechAnvil.setAttribute('transform', `translate(0, ${anvilSinkY.toFixed(2)})`);
          dom.mechGaugeNeedle.setAttribute('transform', `rotate(${needleDeg.toFixed(1)})`);
        }

        if (dom.mouthInnerGlows) {
          dom.mouthInnerGlows.forEach((el) => {
            el.setAttribute('opacity', glowAlpha.toFixed(3));
          });
        }
      }

      /* C. Cushion compression & rebound */
      if (dom.cushionActor) {
        let cushScaleX = 1.1;
        let cushScaleY = 1.1;
        let cushY = 0;
        const impactDt = dt - 48;

        if (impactDt >= 0 && impactDt < 480) {
          const s = impactDt / 1000;
          const cDecay = Math.exp(-9.5 * s);
          const cWave = Math.sin(s * 30);
          cushScaleX = 1.1 * (1 + 0.065 * cWave * cDecay);
          cushScaleY = 1.1 * (1 - 0.085 * cWave * cDecay);
          cushY = 6.5 * cWave * cDecay;
        }

        dom.cushionActor.setAttribute(
          'transform',
          `translate(390, ${(448 + cushY).toFixed(2)}) scale(${cushScaleX.toFixed(4)}, ${cushScaleY.toFixed(4)})`
        );
      }

      /* D. Crown burst & sound wave dissemination */
      const impactDt = dt - 48;
      if (dom.crownBurst && dom.crownRing1 && dom.mouthWaves) {
        if (impactDt >= 0 && impactDt < 420) {
          const p = impactDt / 420;
          const easeOut = 1 - Math.pow(1 - p, 3);
          const alpha = Math.max(0, 1 - p);

          const rx = 18 + easeOut * 95;
          const ry = 10 + easeOut * 52;
          dom.crownRing1.setAttribute('rx', rx.toFixed(1));
          dom.crownRing1.setAttribute('ry', ry.toFixed(1));
          dom.crownBurst.setAttribute('opacity', (alpha * 0.9).toFixed(3));

          const waveShift = easeOut * 58;
          const waveScale = 0.85 + easeOut * 0.75;
          dom.mouthWaves.setAttribute(
            'transform',
            `translate(${(445 + waveShift * 0.84).toFixed(1)}, ${(345 + waveShift * 0.53).toFixed(1)}) rotate(32) scale(${waveScale.toFixed(3)})`
          );
          dom.mouthWaves.setAttribute('opacity', (alpha * 0.95).toFixed(3));
        } else {
          dom.crownBurst.setAttribute('opacity', '0');
          dom.mouthWaves.setAttribute('opacity', '0');
        }
      }

      animRef.current.reqId = requestAnimationFrame(updatePhysicsFrame);
    }

    animRef.current.reqId = requestAnimationFrame(updatePhysicsFrame);

    return () => {
      active = false;
      cancelAnimationFrame(animRef.current.reqId);
    };
  }, []);

  // Auto-knock loop
  useEffect(() => {
    if (isAutoKnocking) {
      autoKnockRef.current = window.setInterval(() => {
        triggerKnock(true);
      }, 1000);
    } else {
      if (autoKnockRef.current) {
        clearInterval(autoKnockRef.current);
        autoKnockRef.current = null;
      }
    }

    return () => {
      if (autoKnockRef.current) {
        clearInterval(autoKnockRef.current);
      }
    };
  }, [isAutoKnocking, triggerKnock]);

  // Spacebar hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        triggerKnock(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerKnock]);

  const currentConfig = SKIN_CONFIGS[skin];

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-3xl overflow-hidden p-4 sm:p-5 flex flex-col items-center justify-between relative select-none transition-colors duration-500 muyu-card-bg ${currentConfig.themeClass} border border-amber-500/25 shadow-2xl min-h-[510px] sm:min-h-[548px]`}
    >
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between z-20 mb-1">
        {/* Merit Pill */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full muyu-glass-panel border text-xs sm:text-sm font-mono font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-amber-200/90">{language === 'zh' ? '累积功德' : 'Merit'}:</span>
          <span className="text-amber-400 font-extrabold text-base tracking-tight">{meritCount}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Mute/Unmute */}
          <button
            onClick={() => {
              HapticsService.light();
              setIsMuted(!isMuted);
            }}
            title={isMuted ? (language === 'zh' ? '开启音效' : 'Unmute') : (language === 'zh' ? '静音' : 'Mute')}
            className="p-2 rounded-xl muyu-glass-panel text-slate-300 hover:text-amber-400 transition active:scale-95 border"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Reset Merit Counter */}
          <button
            onClick={() => {
              HapticsService.medium();
              setMeritCount(0);
              localStorage.setItem('pulseflow_cyber_merit', '0');
            }}
            title={language === 'zh' ? '清零功德' : 'Reset Merit'}
            className="p-2 rounded-xl muyu-glass-panel text-slate-300 hover:text-amber-400 transition active:scale-95 border"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Auto-knock toggle */}
          <button
            onClick={() => {
              HapticsService.light();
              setIsAutoKnocking(!isAutoKnocking);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-1 active:scale-95 border ${
              isAutoKnocking
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 animate-pulse'
                : 'muyu-glass-panel text-slate-200 hover:text-amber-300 border'
            }`}
          >
            {isAutoKnocking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoKnocking ? (language === 'zh' ? '自动中' : 'Auto ON') : (language === 'zh' ? '自动敲' : 'Auto')}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive 3D Vector Stage */}
      <div
        onClick={() => triggerKnock(true)}
        className="relative flex-1 w-full max-w-[580px] aspect-[800/620] max-h-[350px] sm:max-h-[380px] flex items-center justify-center cursor-pointer select-none my-auto"
      >
        {/* Floating text & spark particles DOM container */}
        <div ref={particleLayerRef} className="absolute inset-0 pointer-events-none overflow-visible z-30" />

        {/* 3D SVG Vector Scene (800 x 660, fish anchor ~390, 305) */}
        <svg viewBox="0 0 800 660" className="w-full h-full overflow-visible drop-shadow-2xl">
          <defs>
            {/* Filters */}
            <filter id="soft-blur-sm" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id="soft-blur-md" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
            <filter id="soft-blur-lg" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="22" />
            </filter>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur1" />
              <feGaussianBlur stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Skin 1: Zen Gradients */}
            <radialGradient id="zen-fish-dome" cx="42%" cy="24%" r="68%" fx="36%" fy="18%">
              <stop offset="0%" stopColor="#ff9e58" />
              <stop offset="14%" stopColor="#e35622" />
              <stop offset="42%" stopColor="#9e230e" />
              <stop offset="72%" stopColor="#580e04" />
              <stop offset="90%" stopColor="#2c0501" />
              <stop offset="100%" stopColor="#4d0d04" />
            </radialGradient>

            <linearGradient id="zen-belly-bounce" x1="50%" y1="30%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#580e04" stopOpacity="0" />
              <stop offset="68%" stopColor="#380602" stopOpacity="0.45" />
              <stop offset="90%" stopColor="#9a2b0d" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.55" />
            </linearGradient>

            <linearGradient id="zen-fish-jaw" x1="15%" y1="10%" x2="88%" y2="90%">
              <stop offset="0%" stopColor="#a12812" />
              <stop offset="48%" stopColor="#5e1005" />
              <stop offset="85%" stopColor="#2b0501" />
              <stop offset="100%" stopColor="#78220c" />
            </linearGradient>

            <linearGradient id="zen-lip-bevel" x1="0%" y1="0%" x2="100%" y2="25%">
              <stop offset="0%" stopColor="#c4421a" />
              <stop offset="48%" stopColor="#df5b2a" />
              <stop offset="82%" stopColor="#8f210d" />
              <stop offset="100%" stopColor="#450a03" />
            </linearGradient>

            <linearGradient id="zen-upper-lip" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="35%" stopColor="#fbbf24" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            <linearGradient id="zen-cavity-dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#070100" />
              <stop offset="50%" stopColor="#1f0401" />
              <stop offset="100%" stopColor="#040000" />
            </linearGradient>

            <linearGradient id="gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>

            <linearGradient id="zen-lotus-petal" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="18%" stopColor="#ef4444" />
              <stop offset="65%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#3f0606" />
            </linearGradient>
            <linearGradient id="zen-lotus-inner" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="zen-cushion-side" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2b0404" />
              <stop offset="25%" stopColor="#7f1d1d" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="75%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#2b0404" />
            </linearGradient>

            {/* Skin 2: Heavy Mech Gradients */}
            <radialGradient id="cyber-fish-dome" cx="38%" cy="22%" r="68%" fx="32%" fy="16%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="16%" stopColor="#475569" />
              <stop offset="45%" stopColor="#1e293b" />
              <stop offset="76%" stopColor="#0f172a" />
              <stop offset="92%" stopColor="#070a10" />
              <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>

            <linearGradient id="cyber-belly-bounce" x1="30%" y1="25%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0" />
              <stop offset="66%" stopColor="#1e293b" stopOpacity="0.3" />
              <stop offset="88%" stopColor="#92400e" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.62" />
            </linearGradient>

            <linearGradient id="mech-brass-plate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="22%" stopColor="#f59e0b" />
              <stop offset="55%" stopColor="#b45309" />
              <stop offset="82%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="mech-copper-pipe" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="30%" stopColor="#ea580c" />
              <stop offset="70%" stopColor="#7c2d12" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>

            <linearGradient id="mech-steel-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="cyber-neon-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="cyber-fish-jaw" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="45%" stopColor="#334155" />
              <stop offset="85%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="cyber-lip-bevel" x1="0%" y1="0%" x2="100%" y2="25%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="48%" stopColor="#475569" />
              <stop offset="82%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            <linearGradient id="cyber-dock-side" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="22%" stopColor="#334155" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="78%" stopColor="#334155" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Skin 3: Cat Gradients */}
            <radialGradient id="cat-fish-dome" cx="36%" cy="24%" r="68%" fx="30%" fy="18%">
              <stop offset="0%" stopColor="#fffdf9" />
              <stop offset="24%" stopColor="#fff3e0" />
              <stop offset="58%" stopColor="#ffc988" />
              <stop offset="86%" stopColor="#f28b39" />
              <stop offset="100%" stopColor="#c85a14" />
            </radialGradient>

            <radialGradient id="cat-cream-belly" cx="46%" cy="38%" r="64%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="62%" stopColor="#fff4e4" />
              <stop offset="100%" stopColor="#f3b06b" />
            </radialGradient>

            <linearGradient id="cat-ginger-patch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffa94d" />
              <stop offset="58%" stopColor="#ed6c1a" />
              <stop offset="100%" stopColor="#b53d05" />
            </linearGradient>

            <linearGradient id="cat-inner-ear" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#ffe3ec" />
              <stop offset="55%" stopColor="#ff9ebb" />
              <stop offset="100%" stopColor="#e66089" />
            </linearGradient>

            <radialGradient id="cat-eye-iris" cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#4a1d08" />
              <stop offset="65%" stopColor="#210902" />
              <stop offset="100%" stopColor="#0d0300" />
            </radialGradient>

            <radialGradient id="cat-cushion-top" cx="45%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#fff8fa" />
              <stop offset="55%" stopColor="#ffc2d4" />
              <stop offset="88%" stopColor="#ff85a9" />
              <stop offset="100%" stopColor="#e84a7f" />
            </radialGradient>

            <linearGradient id="cat-cushion-side" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9e1946" />
              <stop offset="25%" stopColor="#ff6b96" />
              <stop offset="50%" stopColor="#ffa6c1" />
              <stop offset="75%" stopColor="#ff6b96" />
              <stop offset="100%" stopColor="#9e1946" />
            </linearGradient>

            <radialGradient id="cat-paw-jelly" cx="38%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffc4d6" />
              <stop offset="45%" stopColor="#ff6b96" />
              <stop offset="100%" stopColor="#d62964" />
            </radialGradient>
          </defs>

          {/* 1. Cushion actor (#cushion-actor) */}
          <g id="cushion-actor" transform="translate(390, 448) scale(1.1, 1.1)">
            <ellipse cx="0" cy="36" rx="252" ry="90" fill="rgba(0,0,0,0.7)" filter="url(#soft-blur-lg)" />

            {/* Cushion 1: Zen Lotus */}
            <g id="cushion-zen">
              <ellipse cx="0" cy="24" rx="206" ry="80" fill="#78350f" stroke="url(#gold-rim)" strokeWidth="3" />
              <path d="M -204,-14 C -216,4 -214,22 -202,24 A 202,78 0 0,0 202,24 C 214,22 216,4 204,-14 Z"
                    fill="url(#zen-cushion-side)" stroke="url(#gold-rim)" strokeWidth="2" />
              <g stroke="rgba(253, 224, 71, 0.36)" strokeWidth="1.8" fill="none">
                <path d="M -155,14 Q -162,32 -152,50" />
                <path d="M -105,32 Q -110,52 -102,70" />
                <path d="M -52,42 Q -55,64 -50,82" />
                <path d="M 0,46 Q 0,68 0,86" />
                <path d="M 52,42 Q 55,64 50,82" />
                <path d="M 105,32 Q 110,52 102,70" />
                <path d="M 155,14 Q 162,32 152,50" />
              </g>
              <g>
                <g transform="translate(-186, 26)">
                  <path d="M 0,0 Q -14,16 -8,36 Q 2,34 6,12 Z" fill="#dc2626" stroke="url(#gold-rim)" strokeWidth="1.5" />
                  <circle cx="0" cy="2" r="5" fill="url(#gold-rim)" />
                </g>
                <g transform="translate(186, 26)">
                  <path d="M 0,0 Q 14,16 8,36 Q -2,34 -6,12 Z" fill="#dc2626" stroke="url(#gold-rim)" strokeWidth="1.5" />
                  <circle cx="0" cy="2" r="5" fill="url(#gold-rim)" />
                </g>
                <g transform="translate(-112, 66)">
                  <path d="M 0,0 Q -10,18 -4,36 Q 5,32 6,12 Z" fill="#dc2626" stroke="url(#gold-rim)" strokeWidth="1.5" />
                  <circle cx="0" cy="2" r="5" fill="url(#gold-rim)" />
                </g>
                <g transform="translate(112, 66)">
                  <path d="M 0,0 Q 10,18 4,36 Q -5,32 -6,12 Z" fill="#dc2626" stroke="url(#gold-rim)" strokeWidth="1.5" />
                  <circle cx="0" cy="2" r="5" fill="url(#gold-rim)" />
                </g>
              </g>
              <ellipse cx="0" cy="-14" rx="202" ry="76" fill="#450a0a" stroke="url(#gold-rim)" strokeWidth="3.5" />
              <g transform="translate(0, -14) scale(1, 0.40)">
                <g>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <path key={deg} d="M 0,-202 C 34,-176 42,-128 22,-84 L -22,-84 C -42,-128 -34,-176 0,-202 Z" fill="url(#zen-lotus-petal)" stroke="url(#gold-rim)" strokeWidth="2.5" transform={`rotate(${deg})`} />
                  ))}
                </g>
                <g transform="rotate(15)">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <path key={deg} d="M 0,-168 C 26,-144 32,-108 16,-72 L -16,-72 C -32,-108 -26,-144 0,-168 Z" fill="url(#zen-lotus-inner)" stroke="#fef9c3" strokeWidth="2" transform={`rotate(${deg})`} />
                  ))}
                </g>
                <circle cx="0" cy="0" r="115" fill="#7f1d1d" stroke="url(#gold-rim)" strokeWidth="5" />
              </g>
            </g>

            {/* Cushion 2: Heavy Mech Gear Platform */}
            <g id="cushion-cyber" className="hidden">
              <ellipse cx="0" cy="28" rx="222" ry="84" fill="rgba(245, 158, 11, 0.22)" filter="url(#soft-blur-md)" />
              <ellipse cx="0" cy="26" rx="210" ry="82" fill="#0f172a" stroke="url(#mech-brass-plate)" strokeWidth="3.5" />
              <path d="M -204,-14 L -196,24 A 198,78 0 0,0 196,24 L 204,-14 Z" fill="url(#cyber-dock-side)" stroke="url(#mech-brass-plate)" strokeWidth="2.5" />
              <path d="M -198,4 A 198,74 0 0,0 198,4" fill="none" stroke="url(#mech-copper-pipe)" strokeWidth="7" />
              <path d="M -198,4 A 198,74 0 0,0 198,4" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="14 22" opacity="0.75" />
              <g stroke="url(#mech-brass-plate)" strokeWidth="2">
                <rect x="-156" y="-2" width="22" height="14" rx="4" fill="#f59e0b" />
                <rect x="-86" y="18" width="24" height="14" rx="4" fill="#fbbf24" />
                <rect x="-12" y="26" width="24" height="15" rx="4" fill="#fef08a" />
                <rect x="62" y="18" width="24" height="14" rx="4" fill="#fbbf24" />
                <rect x="134" y="-2" width="22" height="14" rx="4" fill="#f59e0b" />
              </g>
              <g fill="url(#mech-steel-bevel)" stroke="url(#mech-brass-plate)" strokeWidth="2">
                <path d="M -192,16 L -214,32 L -196,44 L -174,28 Z" />
                <path d="M 192,16 L 214,32 L 196,44 L 174,28 Z" />
                <path d="M -118,56 L -132,76 L -108,84 L -94,64 Z" />
                <path d="M 118,56 L 132,76 L 108,84 L 94,64 Z" />
              </g>
              <ellipse cx="0" cy="-14" rx="204" ry="78" fill="#090d16" stroke="url(#mech-brass-plate)" strokeWidth="4" />
              <g transform="translate(0, -14) scale(1, 0.40)">
                <g className="holo-spin">
                  <g fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.5">
                    {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((deg) => (
                      <rect key={deg} x="-18" y="-206" width="36" height="412" rx="6" transform={`rotate(${deg})`} />
                    ))}
                  </g>
                  <circle cx="0" cy="0" r="182" fill="#111827" stroke="url(#mech-brass-plate)" strokeWidth="8" />
                  <circle cx="0" cy="0" r="164" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="6 18" />
                  <g fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="2">
                    <circle cx="0" cy="-173" r="6" />
                    <circle cx="122" cy="-122" r="6" />
                    <circle cx="173" cy="0" r="6" />
                    <circle cx="122" cy="122" r="6" />
                    <circle cx="0" cy="173" r="6" />
                    <circle cx="-122" cy="122" r="6" />
                    <circle cx="-173" cy="0" r="6" />
                    <circle cx="-122" cy="-122" r="6" />
                  </g>
                </g>
                <circle cx="0" cy="0" r="144" fill="#1e293b" stroke="url(#mech-steel-bevel)" strokeWidth="6" />
                <circle cx="0" cy="0" r="126" fill="#0f172a" stroke="url(#mech-brass-plate)" strokeWidth="3" strokeDasharray="18 8" />
              </g>
            </g>

            {/* Cushion 3: Cat Cushion */}
            <g id="cushion-cat" className="hidden">
              <ellipse cx="0" cy="24" rx="208" ry="80" fill="#fff5f8" stroke="#ff8fab" strokeWidth="3" />
              <path d="M -202,-14 C -216,6 -214,22 -198,24 A 198,76 0 0,0 198,24 C 214,22 216,6 202,-14 Z" fill="url(#cat-cushion-side)" stroke="#ffffff" strokeWidth="2.5" />
              <ellipse cx="0" cy="8" rx="192" ry="70" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeDasharray="12 10" />
              <g transform="translate(0, -14) scale(1, 0.41)">
                <path d="M 0,-182 Q 45,-215 88,-168 Q 152,-182 168,-118 Q 218,-80 182,-18 Q 218,52 168,98 Q 152,168 88,158 Q 45,212 0,178 Q -45,212 -88,158 Q -152,168 -168,98 Q -218,52 -182,-18 Q -218,-80 -168,-118 Q -152,-182 -88,-168 Q -45,-215 0,-182 Z" fill="url(#cat-cushion-top)" stroke="#ffffff" strokeWidth="7" />
                <g transform="translate(0, 6)">
                  <path d="M -62,88 C -94,94 -102,138 -70,156 C -35,174 35,174 70,156 C 102,138 94,94 62,88 C 34,64 -34,64 -62,88 Z" fill="url(#cat-paw-jelly)" stroke="#ffffff" strokeWidth="4" />
                  <ellipse cx="-24" cy="112" rx="18" ry="9" transform="rotate(-12 -24 112)" fill="rgba(255,255,255,0.45)" />
                  <g transform="translate(-112, 62) rotate(-22)">
                    <ellipse cx="0" cy="0" rx="26" ry="36" fill="url(#cat-paw-jelly)" stroke="#ffffff" strokeWidth="4" />
                    <ellipse cx="-7" cy="-10" rx="8" ry="12" fill="rgba(255,255,255,0.45)" />
                  </g>
                  <g transform="translate(-40, 40) rotate(-7)">
                    <ellipse cx="0" cy="0" rx="26" ry="38" fill="url(#cat-paw-jelly)" stroke="#ffffff" strokeWidth="4" />
                    <ellipse cx="-7" cy="-10" rx="8" ry="12" fill="rgba(255,255,255,0.45)" />
                  </g>
                  <g transform="translate(40, 40) rotate(7)">
                    <ellipse cx="0" cy="0" rx="26" ry="38" fill="url(#cat-paw-jelly)" stroke="#ffffff" strokeWidth="4" />
                    <ellipse cx="-7" cy="-10" rx="8" ry="12" fill="rgba(255,255,255,0.45)" />
                  </g>
                  <g transform="translate(112, 62) rotate(22)">
                    <ellipse cx="0" cy="0" rx="26" ry="36" fill="url(#cat-paw-jelly)" stroke="#ffffff" strokeWidth="4" />
                    <ellipse cx="-7" cy="-10" rx="8" ry="12" fill="rgba(255,255,255,0.45)" />
                  </g>
                </g>
              </g>
              <g transform="translate(166, 36) rotate(12)">
                <path d="M -18,-18 Q -2,-6 8,6" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
                <path d="M 2,4 C 16,-5 32,0 40,12 L 54,4 L 49,17 L 56,28 L 40,21 C 28,30 12,26 2,12 Z" fill="url(#gold-rim)" stroke="#ffffff" strokeWidth="2" />
                <circle cx="14" cy="11" r="2.6" fill="#78350f" />
              </g>
            </g>

            <ellipse id="contact-ao-shadow" cx="2" cy="-19" rx="154" ry="56" transform="rotate(4 2 -19)" fill="rgba(0, 0, 0, 0.86)" filter="url(#soft-blur-md)" />
          </g>

          {/* 2. Fish Actor (#fish-actor) */}
          <g id="fish-actor">
            {/* Fish 1: Zen Red Sandalwood */}
            <g id="fish-zen">
              <g className="tail-tassel-group" transform="rotate(0, 238, 252)">
                <path d="M 244,244 C 204,264 182,312 192,366" fill="none" stroke="#b91c1c" strokeWidth="8" strokeLinecap="round" />
                <path d="M 244,244 C 204,264 182,312 192,366" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="6 6" strokeLinecap="round" />
                <path d="M 192,294 L 208,308 L 194,324 L 178,308 Z" fill="#dc2626" stroke="url(#gold-rim)" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="193" cy="332" r="9.5" fill="#fef9c3" stroke="url(#gold-rim)" strokeWidth="2.5" />
                <circle cx="190" cy="329" r="3" fill="#ffffff" />
                <path d="M 185,358 L 201,358 L 204,370 L 182,370 Z" fill="url(#gold-rim)" stroke="#78350f" strokeWidth="1.5" />
                <path d="M 192,370 C 180,392 174,414 170,432 M 193,370 C 188,394 185,418 184,436 M 194,370 C 196,394 198,416 200,434 M 195,370 C 204,392 210,412 214,428" fill="none" stroke="#dc2626" strokeWidth="3.6" strokeLinecap="round" />
                <path d="M 193,370 C 184,394 179,414 177,433 M 194,370 C 192,394 192,416 192,435" fill="none" stroke="url(#gold-rim)" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
              </g>

              <g>
                <path d="M 215,296 C 202,252 236,198 294,186 L 322,198 C 272,210 242,248 242,298 Z" fill="url(#zen-fish-jaw)" stroke="url(#gold-rim)" strokeWidth="2.2" strokeLinejoin="round" />
                <ellipse cx="250" cy="242" rx="15" ry="24" transform="rotate(34 250 242)" fill="#1a0301" stroke="url(#gold-rim)" strokeWidth="1.8" />
                <path d="M 220,276 C 224,244 246,214 282,198 M 228,282 C 234,252 254,224 288,206" fill="none" stroke="url(#gold-rim)" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </g>

              <path d="M 386,180 C 486,180 568,232 568,314 C 568,392 494,440 388,440 C 280,440 212,390 212,312 C 212,230 292,180 386,180 Z" fill="url(#zen-fish-dome)" />
              <path d="M 386,180 C 486,180 568,232 568,314 C 568,392 494,440 388,440 C 280,440 212,390 212,312 C 212,230 292,180 386,180 Z" fill="url(#zen-belly-bounce)" />

              <g fill="none" strokeLinecap="round">
                <path d="M 244,274 C 288,214 396,196 492,234" stroke="rgba(45, 5, 1, 0.38)" strokeWidth="2.5" />
                <path d="M 228,316 C 276,246 412,222 526,266" stroke="rgba(45, 5, 1, 0.34)" strokeWidth="2.2" />
                <path d="M 234,362 C 304,414 454,418 538,364" stroke="rgba(45, 5, 1, 0.45)" strokeWidth="2.8" />
                <path d="M 268,402 C 344,432 456,428 518,392" stroke="rgba(253, 224, 71, 0.24)" strokeWidth="2" />
              </g>

              <g fill="none" stroke="url(#gold-rim)" strokeLinecap="round" opacity="0.72">
                <path d="M 234,296 C 266,242 332,204 416,198" strokeWidth="2.8" />
                <path d="M 346,214 C 368,196 404,196 426,214 C 406,226 366,226 346,214 Z" fill="rgba(245, 158, 11, 0.14)" strokeWidth="2" />
                <path d="M 252,268 A 20,20 0 0,1 282,250" strokeWidth="2.1" />
                <path d="M 282,250 A 20,20 0 0,1 314,236" strokeWidth="2.1" />
                <path d="M 314,236 A 20,20 0 0,1 348,226" strokeWidth="2.1" />
                <path d="M 264,290 A 20,20 0 0,1 294,272" strokeWidth="2.1" />
                <path d="M 294,272 A 20,20 0 0,1 326,258" strokeWidth="2.1" />
                <path d="M 326,258 A 20,20 0 0,1 360,248" strokeWidth="2.1" />
                <path d="M 244,312 A 18,18 0 0,1 274,294" strokeWidth="1.8" />
                <path d="M 274,294 A 18,18 0 0,1 306,280" strokeWidth="1.8" />
              </g>

              <ellipse cx="366" cy="234" rx="84" ry="40" transform="rotate(-12 366 234)" fill="rgba(255, 224, 194, 0.25)" filter="url(#soft-blur-md)" />
              <ellipse cx="352" cy="220" rx="44" ry="18" transform="rotate(-12 352 220)" fill="rgba(255, 248, 237, 0.36)" filter="url(#soft-blur-sm)" />

              <path d="M 386,180 C 486,180 568,232 568,314 C 568,392 494,440 388,440 C 280,440 212,390 212,312 C 212,230 292,180 386,180 Z" fill="none" stroke="url(#gold-rim)" strokeWidth="2" opacity="0.55" />

              {/* Mouth Assembly */}
              <g className="mouth-assembly">
                <path d="M 286,352 C 362,396 474,386 546,310 C 554,324 544,352 520,370 C 458,414 354,416 290,376 Z" fill="url(#zen-lip-bevel)" stroke="#450a03" strokeWidth="1.5" />
                <path d="M 294,368 C 364,406 468,398 536,332" fill="none" stroke="rgba(254, 240, 138, 0.42)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 288,340 C 366,382 474,372 544,298 C 554,302 552,322 538,338 C 472,398 362,404 288,364 Z" fill="url(#zen-cavity-dark)" />
                <g stroke="#290602" strokeWidth="3.5" strokeLinecap="round" opacity="0.7">
                  <line x1="358" y1="362" x2="354" y2="384" />
                  <line x1="398" y1="368" x2="395" y2="390" />
                  <line x1="438" y1="366" x2="436" y2="388" />
                  <line x1="478" y1="354" x2="476" y2="376" />
                  <line x1="510" y1="336" x2="508" y2="356" />
                </g>
                <ellipse className="mouth-inner-glow" cx="428" cy="358" rx="92" ry="22" transform="rotate(-11 428 358)" fill="#fbbf24" opacity="0" filter="url(#soft-blur-md)" />
                <g transform="translate(306, 352) rotate(16)">
                  <ellipse cx="0" cy="0" rx="26" ry="20" fill="#4d0d04" stroke="url(#gold-rim)" strokeWidth="2.8" />
                  <ellipse cx="2" cy="0" rx="20" ry="15" fill="#240401" />
                  <ellipse cx="4" cy="-1" rx="15" ry="11" fill="#050000" />
                </g>
                <g transform="translate(534, 312) rotate(-25)">
                  <ellipse cx="0" cy="0" rx="17" ry="14.5" fill="#450a03" stroke="url(#gold-rim)" strokeWidth="2.4" />
                  <ellipse cx="-1" cy="0" rx="13" ry="11" fill="#1f0301" />
                  <ellipse cx="-2" cy="0" rx="9.5" ry="8" fill="#050000" />
                </g>
                <path d="M 280,336 C 364,378 474,368 548,292" fill="none" stroke="#2b0501" strokeWidth="6.5" strokeLinecap="round" />
                <path d="M 278,334 C 364,376 474,366 548,290" fill="none" stroke="url(#zen-upper-lip)" strokeWidth="4" strokeLinecap="round" />
              </g>

              {/* Eyes & Gills */}
              <g transform="translate(324, 298) rotate(9)">
                <path d="M -32,16 C -58,-6 -50,-40 -16,-46 C 14,-52 40,-34 46,-8" fill="none" stroke="#360602" strokeWidth="5" strokeLinecap="round" />
                <path d="M -32,16 C -58,-6 -50,-40 -16,-46 C 14,-52 40,-34 46,-8" fill="none" stroke="url(#gold-rim)" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M -42,24 C -68,-2 -60,-44 -22,-54" fill="none" stroke="url(#gold-rim)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                <ellipse cx="0" cy="0" rx="22" ry="16" fill="url(#zen-fish-jaw)" stroke="url(#gold-rim)" strokeWidth="2.8" />
                <ellipse cx="1" cy="0.5" rx="16" ry="11.5" fill="#3b0802" stroke="#b45309" strokeWidth="1.4" />
                <ellipse cx="3" cy="1" rx="11" ry="8.5" fill="#120200" />
                <circle cx="-1" cy="-2.5" r="3.8" fill="#fef08a" />
                <circle cx="6" cy="3" r="1.8" fill="rgba(255,255,255,0.65)" />
              </g>

              <g transform="translate(518, 262) rotate(-18) scale(0.76, 0.86)">
                <path d="M -24,-14 C -8,-38 22,-40 34,-14" fill="none" stroke="#360602" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M -24,-14 C -8,-38 22,-40 34,-14" fill="none" stroke="url(#gold-rim)" strokeWidth="2.6" strokeLinecap="round" />
                <ellipse cx="0" cy="0" rx="18" ry="13.5" fill="url(#zen-fish-jaw)" stroke="url(#gold-rim)" strokeWidth="2.6" />
                <ellipse cx="1" cy="0.5" rx="12.5" ry="9.5" fill="#3b0802" />
                <ellipse cx="2.5" cy="1" rx="8.5" ry="6.8" fill="#120200" />
                <circle cx="-0.5" cy="-2" r="3" fill="#fef08a" />
              </g>
            </g>

            {/* Fish 2: Heavy Mech Armor */}
            <g id="fish-cyber" className="hidden">
              <g className="tail-tassel-group" transform="rotate(0, 238, 252)">
                <path d="M 244,244 C 202,266 180,314 190,366" fill="none" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
                <path d="M 244,244 C 202,266 180,314 190,366" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="5 5" strokeLinecap="round" />
                <path d="M 248,250 C 210,272 190,316 198,364" fill="none" stroke="url(#mech-copper-pipe)" strokeWidth="4" strokeLinecap="round" />
                <circle cx="192" cy="324" r="11" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.2" />
                <circle cx="192" cy="324" r="4.5" fill="#fef08a" />
                <g transform="translate(192, 364) rotate(6)">
                  <rect x="-12" y="0" width="24" height="10" rx="3" fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="1.8" />
                  <polygon points="-15,10 15,10 19,44 0,64 -19,44" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.2" strokeLinejoin="round" />
                  <rect x="-5" y="18" width="10" height="24" rx="5" fill="#090d16" stroke="#78350f" strokeWidth="1.5" />
                  <rect x="-3" y="21" width="6" height="18" rx="3" fill="#f59e0b" />
                  <circle cx="-8" cy="15" r="2" fill="#e2e8f0" />
                  <circle cx="8" cy="15" r="2" fill="#e2e8f0" />
                </g>
              </g>

              <g>
                <path d="M 218,284 C 212,244 242,204 292,192" fill="none" stroke="url(#mech-copper-pipe)" strokeWidth="10" strokeLinecap="round" />
                <path d="M 218,284 C 212,244 242,204 292,192" fill="none" stroke="#fed7aa" strokeWidth="3" strokeDasharray="6 10" strokeLinecap="round" opacity="0.75" />
                <path d="M 215,296 C 202,252 236,198 294,186 L 322,198 C 272,210 242,248 242,298 Z" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.5" strokeLinejoin="round" />
                <ellipse cx="246" cy="248" rx="14" ry="22" transform="rotate(34 246 248)" fill="#090d16" stroke="url(#mech-steel-bevel)" strokeWidth="3" />
                <g transform="translate(274, 208)">
                  <circle cx="0" cy="0" r="22" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="16.5" fill="#fefce8" stroke="#78350f" strokeWidth="1.5" />
                  <path d="M -11,6 A 12,12 0 0,1 4,-11" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 4,-11 A 12,12 0 0,1 12,4" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
                  <path d="M -12,0 L -9,0 M -8,-8 L -6,-6 M 0,-12 L 0,-9 M 8,-8 L 6,-6 M 12,0 L 9,0" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                  <g id="mech-gauge-needle" transform="rotate(-35)">
                    <line x1="0" y1="4" x2="0" y2="-13" stroke="#dc2626" strokeWidth="2.4" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="3.2" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
                  </g>
                  <path d="M -10,-9 A 13,13 0 0,1 8,-9" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" />
                </g>
              </g>

              <path d="M 386,180 C 486,180 568,232 568,314 C 568,392 494,440 388,440 C 280,440 212,390 212,312 C 212,230 292,180 386,180 Z" fill="url(#cyber-fish-dome)" />
              <path d="M 386,180 C 486,180 568,232 568,314 C 568,392 494,440 388,440 C 280,440 212,390 212,312 C 212,230 292,180 386,180 Z" fill="url(#cyber-belly-bounce)" />

              <path d="M 456,192 C 518,208 558,248 566,302 C 536,288 498,278 468,266 C 456,238 452,212 456,192 Z" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.2" opacity="0.92" />
              <path d="M 214,322 C 242,354 276,374 316,388 L 304,424 C 252,404 218,368 214,322 Z" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.2" opacity="0.9" />

              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 220,322 C 276,304 352,298 446,314" stroke="#05080f" strokeWidth="4.5" />
                <path d="M 220,324 C 276,306 352,300 446,316" stroke="rgba(226, 232, 240, 0.35)" strokeWidth="1.8" />
                <path d="M 346,184 C 338,236 346,288 372,344" stroke="#05080f" strokeWidth="4" />
                <path d="M 454,192 C 464,238 462,282 446,332" stroke="#05080f" strokeWidth="4" />
                <path d="M 262,396 C 338,426 446,424 518,386" stroke="url(#mech-brass-plate)" strokeWidth="3.5" />
              </g>

              <g fill="url(#mech-steel-bevel)" stroke="#090d16" strokeWidth="1.4">
                <circle cx="232" cy="332" r="4.2" />
                <circle cx="256" cy="348" r="4.2" />
                <circle cx="282" cy="362" r="4.2" />
                <circle cx="358" cy="288" r="4.2" />
                <circle cx="394" cy="292" r="4.2" />
                <circle cx="430" cy="298" r="4.2" />
                <circle cx="468" cy="212" r="4" />
                <circle cx="476" cy="238" r="4" />
                <circle cx="480" cy="264" r="4" />
                <circle cx="332" cy="412" r="4.2" />
                <circle cx="378" cy="420" r="4.2" />
                <circle cx="424" cy="418" r="4.2" />
                <circle cx="468" cy="408" r="4.2" />
              </g>

              {/* Brass Gear Box Window */}
              <g transform="translate(292, 258) rotate(-18) scale(1, 0.84)">
                <ellipse cx="0" cy="0" rx="58" ry="44" fill="#070a10" stroke="#000000" strokeWidth="4" />
                <ellipse cx="0" cy="0" rx="46" ry="34" fill="rgba(245, 158, 11, 0.2)" filter="url(#soft-blur-sm)" />
                <line x1="-48" y1="-12" x2="48" y2="-12" stroke="#78350f" strokeWidth="2" />
                <line x1="-48" y1="14" x2="48" y2="14" stroke="#78350f" strokeWidth="2" />

                <g transform="translate(-16, -2)">
                  <g id="mech-gear-1">
                    <g fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="1.4">
                      {[0, 30, 60, 90, 120, 150].map((deg) => (
                        <rect key={deg} x="-5" y="-30" width="10" height="60" rx="2" transform={`rotate(${deg})`} />
                      ))}
                    </g>
                    <circle cx="0" cy="0" r="23" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2" />
                    <circle cx="0" cy="0" r="15" fill="#090d16" stroke="#b45309" strokeWidth="1.5" />
                    <rect x="-3" y="-16" width="6" height="32" fill="url(#mech-brass-plate)" />
                    <rect x="-16" y="-3" width="32" height="6" fill="url(#mech-brass-plate)" />
                    <circle cx="0" cy="0" r="6.5" fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="1.5" />
                  </g>
                </g>

                <g transform="translate(24, -10)">
                  <g id="mech-gear-2">
                    <g fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="1.3">
                      {[0, 45, 90, 135].map((deg) => (
                        <rect key={deg} x="-4" y="-21" width="8" height="42" rx="1.8" transform={`rotate(${deg})`} />
                      ))}
                    </g>
                    <circle cx="0" cy="0" r="15.5" fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="1.8" />
                    <circle cx="0" cy="0" r="8.5" fill="#090d16" />
                    <circle cx="0" cy="0" r="4.5" fill="#f59e0b" />
                  </g>
                </g>

                <g transform="translate(14, 20)">
                  <g id="mech-gear-3">
                    <g fill="url(#mech-copper-pipe)" stroke="#451a03" strokeWidth="1.2">
                      {[0, 60, 120].map((deg) => (
                        <rect key={deg} x="-3.2" y="-15" width="6.4" height="30" rx="1.5" transform={`rotate(${deg})`} />
                      ))}
                    </g>
                    <circle cx="0" cy="0" r="11" fill="url(#mech-copper-pipe)" stroke="#451a03" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="4" fill="#fef08a" />
                  </g>
                </g>

                <ellipse cx="0" cy="0" rx="58" ry="44" fill="none" stroke="url(#mech-brass-plate)" strokeWidth="7.5" />
                <ellipse cx="0" cy="0" rx="54" ry="40" fill="none" stroke="#451a03" strokeWidth="1.6" />
                <path d="M -38,-22 C -16,-36 18,-36 38,-20" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="3.5" strokeLinecap="round" />
                <g fill="url(#mech-steel-bevel)" stroke="#090d16" strokeWidth="1.2">
                  <circle cx="-52" cy="0" r="3.2" />
                  <circle cx="52" cy="0" r="3.2" />
                  <circle cx="-28" cy="-36" r="3.2" />
                  <circle cx="28" cy="-36" r="3.2" />
                  <circle cx="-28" cy="36" r="3.2" />
                  <circle cx="28" cy="36" r="3.2" />
                </g>
              </g>

              {/* Anvil on Top Dome */}
              <g transform="translate(385, 232) rotate(-6)">
                <ellipse cx="0" cy="10" rx="68" ry="32" fill="#090d16" stroke="url(#mech-steel-bevel)" strokeWidth="3.5" />
                <g stroke="url(#mech-copper-pipe)" strokeWidth="3.5" strokeLinecap="round">
                  <line x1="-38" y1="-2" x2="-38" y2="14" />
                  <line x1="0" y1="2" x2="0" y2="18" />
                  <line x1="38" y1="-2" x2="38" y2="14" />
                </g>
                <g id="mech-anvil" transform="translate(0, 0)">
                  <path d="M -56,-2 L -56,10 C -56,24 56,24 56,10 L 56,-2 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                  <polygon points="-26,-24 26,-24 56,-8 56,8 26,22 -26,22 -56,8 -56,-8" fill="url(#mech-brass-plate)" stroke="#fef08a" strokeWidth="2.2" strokeLinejoin="round" />
                  <ellipse cx="0" cy="-1" rx="34" ry="14" fill="url(#mech-steel-bevel)" stroke="#451a03" strokeWidth="2" />
                  <ellipse cx="0" cy="-1" rx="18" ry="7.5" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="0" cy="-1" r="5" fill="#fbbf24" />
                  <circle cx="-38" cy="-1" r="3.5" fill="#1e293b" stroke="#fef08a" strokeWidth="1.2" />
                  <circle cx="38" cy="-1" r="3.5" fill="#1e293b" stroke="#fef08a" strokeWidth="1.2" />
                  <circle cx="-18" cy="-15" r="3.2" fill="#1e293b" stroke="#fef08a" strokeWidth="1.2" />
                  <circle cx="18" cy="13" r="3.2" fill="#1e293b" stroke="#fef08a" strokeWidth="1.2" />
                </g>
              </g>

              <path d="M 386,180 C 486,180 568,232 568,314 C 568,392 494,440 388,440 C 280,440 212,390 212,312 C 212,230 292,180 386,180 Z" fill="none" stroke="url(#mech-brass-plate)" strokeWidth="2.8" opacity="0.82" />

              {/* Heavy Mech Mouth Assembly */}
              <g className="mouth-assembly">
                <path d="M 286,352 C 362,396 474,386 546,310 C 554,324 544,352 520,370 C 458,414 354,416 290,376 Z" fill="url(#cyber-lip-bevel)" stroke="url(#mech-brass-plate)" strokeWidth="2.4" />
                <path d="M 304,372 C 368,406 464,398 530,338" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray="14 10" strokeLinecap="round" />
                <path d="M 288,340 C 366,382 474,372 544,298 C 554,302 552,322 538,338 C 472,398 362,404 288,364 Z" fill="#05070c" />
                <ellipse className="mouth-inner-glow" cx="428" cy="358" rx="96" ry="25" transform="rotate(-11 428 358)" fill="#f59e0b" opacity="0" filter="url(#soft-blur-md)" />

                <g strokeLinecap="round">
                  <g stroke="url(#mech-brass-plate)" strokeWidth="7">
                    <line x1="344" y1="358" x2="342" y2="378" />
                    <line x1="368" y1="364" x2="366" y2="386" />
                    <line x1="392" y1="367" x2="390" y2="391" />
                    <line x1="416" y1="368" x2="414" y2="392" />
                    <line x1="440" y1="365" x2="438" y2="389" />
                    <line x1="464" y1="359" x2="462" y2="383" />
                    <line x1="488" y1="349" x2="486" y2="372" />
                    <line x1="510" y1="335" x2="508" y2="356" />
                  </g>
                  <g stroke="#fde047" strokeWidth="3">
                    <line x1="344" y1="360" x2="342" y2="376" />
                    <line x1="368" y1="366" x2="366" y2="384" stroke="#38bdf8" />
                    <line x1="392" y1="369" x2="390" y2="389" />
                    <line x1="416" y1="370" x2="414" y2="390" stroke="#38bdf8" />
                    <line x1="440" y1="367" x2="438" y2="387" />
                    <line x1="464" y1="361" x2="462" y2="381" stroke="#38bdf8" />
                    <line x1="488" y1="351" x2="486" y2="370" />
                    <line x1="510" y1="337" x2="508" y2="354" stroke="#38bdf8" />
                  </g>
                </g>

                <line x1="354" y1="354" x2="350" y2="384" stroke="url(#mech-steel-bevel)" strokeWidth="5.5" strokeLinecap="round" />
                <line x1="498" y1="334" x2="494" y2="364" stroke="url(#mech-steel-bevel)" strokeWidth="5" strokeLinecap="round" />

                <g transform="translate(306, 352) rotate(16)">
                  <ellipse cx="0" cy="0" rx="27" ry="21" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.8" />
                  <ellipse cx="1" cy="0" rx="20" ry="15" fill="#070a10" stroke="url(#mech-steel-bevel)" strokeWidth="2" />
                  <line x1="-18" y1="0" x2="18" y2="0" stroke="url(#mech-brass-plate)" strokeWidth="3.5" />
                  <line x1="0" y1="-14" x2="0" y2="14" stroke="url(#mech-brass-plate)" strokeWidth="3.5" />
                  <ellipse cx="1" cy="0" rx="9" ry="7" fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="1.8" />
                  <circle cx="1" cy="0" r="3.5" fill="#f59e0b" />
                </g>

                <g transform="translate(534, 312) rotate(-25)">
                  <ellipse cx="0" cy="0" rx="18" ry="15" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.5" />
                  <ellipse cx="-1" cy="0" rx="12.5" ry="10.5" fill="#070a10" stroke="url(#mech-steel-bevel)" strokeWidth="1.8" />
                  <line x1="-11" y1="0" x2="11" y2="0" stroke="url(#mech-brass-plate)" strokeWidth="2.8" />
                  <line x1="0" y1="-9" x2="0" y2="9" stroke="url(#mech-brass-plate)" strokeWidth="2.8" />
                  <circle cx="-1" cy="0" r="5.5" fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="1.5" />
                  <circle cx="-1" cy="0" r="2.5" fill="#f59e0b" />
                </g>

                <path d="M 280,336 C 364,378 474,368 548,292" fill="none" stroke="#090d16" strokeWidth="8" strokeLinecap="round" />
                <path d="M 278,334 C 364,376 474,366 548,290" fill="none" stroke="url(#mech-brass-plate)" strokeWidth="5" strokeLinecap="round" />
                <path d="M 282,332 C 364,373 472,363 545,288" fill="none" stroke="#fef08a" strokeWidth="1.6" strokeDasharray="18 8" strokeLinecap="round" opacity="0.8" />
              </g>

              {/* Camera Eyes */}
              <g transform="translate(324, 298) rotate(9)">
                <path d="M -30,18 C -52,-4 -46,-34 -18,-42" fill="none" stroke="#090d16" strokeWidth="7" strokeLinecap="round" />
                <path d="M -30,18 C -52,-4 -46,-34 -18,-42" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="8 6" strokeLinecap="round" />
                <path d="M -40,24 C -62,0 -56,-36 -26,-48" fill="none" stroke="url(#mech-brass-plate)" strokeWidth="3" strokeLinecap="round" />
                <ellipse cx="0" cy="0" rx="24" ry="18" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.8" />
                <ellipse cx="1" cy="0" rx="18" ry="13.5" fill="#090d16" stroke="url(#mech-steel-bevel)" strokeWidth="2.2" />
                <g stroke="#64748b" strokeWidth="1.4">
                  <line x1="-14" y1="-6" x2="6" y2="-11" />
                  <line x1="6" y1="-11" x2="15" y2="4" />
                  <line x1="15" y1="4" x2="-4" y2="12" />
                  <line x1="-4" y1="12" x2="-15" y2="-2" />
                </g>
                <ellipse cx="2" cy="0.5" rx="10.5" ry="8" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
                <ellipse cx="2.5" cy="0.5" rx="5.5" ry="4.2" fill="#78350f" />
                <circle cx="-2" cy="-3" r="3.5" fill="#ffffff" />
                <circle cx="6" cy="3" r="1.8" fill="#bae6fd" />
              </g>

              <g transform="translate(518, 262) rotate(-18) scale(0.78, 0.88)">
                <path d="M -22,-12 C -6,-36 22,-36 34,-12" fill="none" stroke="url(#mech-brass-plate)" strokeWidth="3.5" strokeLinecap="round" />
                <ellipse cx="0" cy="0" rx="19" ry="14.5" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.6" />
                <ellipse cx="1" cy="0" rx="13.5" ry="10.5" fill="#090d16" stroke="url(#mech-steel-bevel)" strokeWidth="1.8" />
                <ellipse cx="2" cy="0.5" rx="8.5" ry="6.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.2" />
                <circle cx="-1" cy="-2" r="2.8" fill="#ffffff" />
              </g>
            </g>

            {/* Fish 3: Cat Statue */}
            <g id="fish-cat" className="hidden" transform="translate(6, 28)">
              <g id="cat-tail-group" transform="rotate(0, 228, 328)">
                <path d="M 204,328 C 184,348 176,372 184,394" fill="none" stroke="#dc2626" strokeWidth="5.5" strokeLinecap="round" />
                <path d="M 184,394 Q 176,408 172,418 M 184,394 Q 184,410 182,420 M 184,394 Q 192,408 194,416" fill="none" stroke="#ef4444" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M 234,340 C 184,332 166,282 190,252 C 208,230 244,236 252,258 C 258,274 242,288 228,280 C 218,274 216,264 208,270 C 198,278 206,312 242,320 Z" fill="url(#cat-ginger-patch)" stroke="#9c3604" strokeWidth="2.6" strokeLinejoin="round" />
                <g fill="none" stroke="#7c2d12" strokeWidth="4.8" strokeLinecap="round" opacity="0.85">
                  <path d="M 182,294 Q 198,290 205,298" />
                  <path d="M 181,274 Q 197,272 204,280" />
                  <path d="M 192,254 Q 206,258 210,268" />
                </g>
                <path d="M 200,312 Q 216,320 226,332" fill="none" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
                <g transform="translate(198, 328)">
                  <circle cx="0" cy="0" r="13.5" fill="url(#gold-rim)" stroke="#78350f" strokeWidth="2" />
                  <path d="M -12,-2 Q 0,5 12,-2" fill="none" stroke="#78350f" strokeWidth="1.8" />
                  <circle cx="0" cy="4.5" r="3.2" fill="#3b1103" />
                  <path d="M 0,7.5 L 0,13" stroke="#3b1103" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="-4" cy="-5" r="3" fill="rgba(255,255,255,0.75)" />
                </g>
              </g>

              <path d="M 222,334 C 232,394 316,424 446,416 C 518,412 554,376 548,330 C 542,302 508,298 462,312 C 386,334 292,344 222,334 Z" fill="url(#cat-cream-belly)" stroke="#c85a14" strokeWidth="2.2" />
              <path d="M 352,186 C 376,182 402,182 426,188 C 468,194 502,208 518,226 C 552,256 564,298 552,338 C 542,372 502,398 446,404 C 356,412 252,394 218,346 C 198,316 204,264 246,228 C 274,204 314,190 352,186 Z" fill="url(#cat-fish-dome)" />
              <path d="M 212,312 C 206,276 220,246 246,228 C 274,204 310,192 342,188 C 324,224 294,264 252,296 C 236,308 222,314 212,312 Z" fill="url(#cat-ginger-patch)" opacity="0.86" />
              <path d="M 468,196 C 492,204 508,214 518,226 C 546,252 558,284 554,316 C 532,296 508,266 492,232 C 484,216 476,204 468,196 Z" fill="url(#cat-ginger-patch)" opacity="0.84" />
              <ellipse cx="436" cy="318" rx="112" ry="68" transform="rotate(-6 436 318)" fill="url(#cat-cream-belly)" opacity="0.88" filter="url(#soft-blur-sm)" />

              {/* Ears */}
              <g id="cat-ear-right" transform="rotate(0, 472, 207)">
                <path d="M 422,202 L 426,188 C 452,146 484,118 508,126 C 530,134 532,180 518,226 L 506,238 Q 464,222 422,202 Z" fill="url(#cat-fish-dome)" />
                <path d="M 442,166 C 464,136 488,120 508,126 C 524,132 528,158 523,188 Q 484,172 442,166 Z" fill="url(#cat-ginger-patch)" opacity="0.92" />
                <path d="M 446,194 C 464,158 488,138 503,144 C 515,148 515,184 504,220 Q 476,206 446,194 Z" fill="url(#cat-inner-ear)" stroke="#d96b27" strokeWidth="1.8" />
                <path d="M 452,196 Q 468,182 478,198 Q 492,186 502,208" fill="none" stroke="#fffdf9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 426,188 C 452,146 484,118 508,126 C 530,134 532,180 518,226" fill="none" stroke="#a84308" strokeWidth="2.8" strokeLinecap="round" />
              </g>

              <g id="cat-ear-left" transform="rotate(0, 299, 207)">
                <path d="M 254,244 L 246,228 C 232,178 236,130 258,122 C 282,114 322,146 352,186 L 354,204 Q 302,224 254,244 Z" fill="url(#cat-fish-dome)" />
                <path d="M 241,182 C 236,148 242,128 258,122 C 278,115 308,136 334,166 Q 286,168 241,182 Z" fill="url(#cat-ginger-patch)" opacity="0.92" />
                <path d="M 264,218 C 254,180 256,144 270,138 C 288,132 318,158 338,190 Q 300,204 264,218 Z" fill="url(#cat-inner-ear)" stroke="#d96b27" strokeWidth="2" />
                <path d="M 266,212 C 258,180 260,150 272,142" fill="none" stroke="rgba(180, 48, 86, 0.45)" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 270,214 Q 288,196 302,206 Q 316,190 332,196" fill="none" stroke="#fffdf9" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 246,228 C 232,178 236,130 258,122 C 282,114 322,146 352,186" fill="none" stroke="#a84308" strokeWidth="2.8" strokeLinecap="round" />
              </g>

              <path d="M 352,186 C 376,182 402,182 426,188 M 518,226 C 552,256 564,298 552,338 C 542,372 502,398 446,404 C 356,412 252,394 218,346 C 198,316 204,264 246,228" fill="none" stroke="#a84308" strokeWidth="2.6" strokeLinecap="round" />
              <ellipse cx="364" cy="212" rx="56" ry="24" transform="rotate(-12 364 212)" fill="rgba(255, 255, 255, 0.55)" filter="url(#soft-blur-sm)" />
              <ellipse cx="348" cy="202" rx="28" ry="11" transform="rotate(-12 348 202)" fill="rgba(255, 255, 255, 0.72)" />

              <g stroke="#c2410c" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.88">
                <path d="M 384,206 Q 412,215 438,204" />
                <path d="M 378,222 Q 412,231 444,218" />
                <path d="M 388,238 Q 414,245 438,235" />
                <path d="M 411,203 Q 413,222 414,242" strokeWidth="6.5" />
              </g>

              {/* Cat Face Details */}
              <g transform="translate(362, 278) rotate(7)">
                <ellipse cx="-26" cy="28" rx="26" ry="13" fill="rgba(255, 117, 143, 0.56)" filter="url(#soft-blur-sm)" />
                <path d="M -34,26 L -28,31 M -22,25 L -16,30" stroke="#ff5c8a" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
                <path d="M -28,-18 Q 0,-30 26,-14" fill="none" stroke="#b54708" strokeWidth="2.6" strokeLinecap="round" />
                <ellipse cx="0" cy="0" rx="24" ry="21" fill="url(#cat-eye-iris)" stroke="#7c2d12" strokeWidth="2.8" />
                <path d="M -16,8 A 18,15 0 0,0 16,8 A 19,17 0 0,1 -16,8 Z" fill="#d97706" opacity="0.65" />
                <circle cx="-8" cy="-7" r="7.2" fill="#ffffff" />
                <circle cx="9" cy="6" r="3.6" fill="#ffffff" />
                <circle cx="-11" cy="5" r="1.8" fill="#fde68a" />
              </g>

              <g stroke="#9a3412" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.85">
                <path d="M 310,294 Q 282,288 256,296" />
                <path d="M 312,308 Q 282,306 254,316" />
                <path d="M 316,322 Q 288,324 264,336" />
              </g>

              <g transform="translate(506, 266) rotate(-10)">
                <ellipse cx="22" cy="24" rx="18" ry="10" fill="rgba(255, 117, 143, 0.52)" filter="url(#soft-blur-sm)" />
                <path d="M -18,-16 Q 4,-26 20,-10" fill="none" stroke="#b54708" strokeWidth="2.4" strokeLinecap="round" />
                <ellipse cx="0" cy="0" rx="19" ry="18" fill="url(#cat-eye-iris)" stroke="#7c2d12" strokeWidth="2.6" />
                <path d="M -12,7 A 14,12 0 0,0 12,7 A 15,14 0 0,1 -12,7 Z" fill="#d97706" opacity="0.65" />
                <circle cx="-6" cy="-6" r="6" fill="#ffffff" />
                <circle cx="7" cy="5" r="3" fill="#ffffff" />
              </g>

              <g stroke="#9a3412" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.85">
                <path d="M 536,280 Q 552,274 566,280" />
                <path d="M 538,293 Q 554,290 568,298" />
                <path d="M 536,306 Q 550,306 562,316" />
              </g>

              {/* Mouth :3 */}
              <g className="mouth-assembly">
                <path d="M 338,348 C 392,394 486,388 532,332 C 538,346 530,368 510,382 C 464,414 386,412 340,372 Z" fill="#f7c68e" stroke="#b54708" strokeWidth="1.8" />
                <path d="M 346,336 C 384,368 424,360 448,324 C 472,356 504,352 528,320 C 538,324 536,346 520,362 C 478,398 394,400 344,362 Z" fill="#2e0711" />
                <ellipse className="mouth-inner-glow" cx="442" cy="356" rx="84" ry="22" transform="rotate(-8 442 356)" fill="#ff8fab" opacity="0" filter="url(#soft-blur-md)" />
                <path d="M 404,368 C 424,346 468,344 488,362 C 466,386 424,386 404,368 Z" fill="#fb6f92" />
                <path d="M 446,350 Q 446,366 444,376" fill="none" stroke="#d6336c" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 380,345 L 395,348 L 386,363 Z" fill="#ffffff" stroke="#fda4af" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M 493,337 L 506,331 L 501,349 Z" fill="#ffffff" stroke="#fda4af" strokeWidth="1.2" strokeLinejoin="round" />
                <g transform="translate(350, 346) rotate(16)">
                  <ellipse cx="0" cy="0" rx="22" ry="16.5" fill="#420c1b" stroke="#9a3412" strokeWidth="3" />
                  <ellipse cx="2" cy="0" rx="14" ry="10.5" fill="#160207" />
                </g>
                <g transform="translate(526, 328) rotate(-22)">
                  <ellipse cx="0" cy="0" rx="15" ry="13" fill="#420c1b" stroke="#9a3412" strokeWidth="2.6" />
                  <ellipse cx="-1" cy="0" rx="9.5" ry="8" fill="#160207" />
                </g>
                <path d="M 336,332 C 380,368 422,360 448,322 C 472,356 506,350 534,314" fill="none" stroke="#fff7ed" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
                <path d="M 336,334 C 380,370 422,362 448,324 C 472,358 506,352 534,316" fill="none" stroke="#7c2d12" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="448" y1="306" x2="448" y2="325" stroke="#7c2d12" strokeWidth="3.6" strokeLinecap="round" />
                <path d="M 433,287 C 440,280 456,280 463,287 C 467,293 456,305 448,307 C 440,305 429,293 433,287 Z" fill="#ff6b96" stroke="#7c2d12" strokeWidth="2.4" strokeLinejoin="round" />
                <ellipse cx="445" cy="289" rx="5.5" ry="2.4" transform="rotate(-8 445 289)" fill="rgba(255,255,255,0.8)" />
              </g>
            </g>
          </g>

          {/* 3. Effects Layer (#fx-layer) */}
          <g id="fx-layer" pointerEvents="none">
            <path id="swing-trail" d="M 516,95 Q 408,125 385,240 Q 430,145 546,115 Z" fill="url(#gold-rim)" opacity="0" filter="url(#soft-blur-sm)" />
            <g id="crown-burst" transform="translate(385, 240)" opacity="0">
              <ellipse id="crown-ring-1" cx="0" cy="0" rx="24" ry="13" fill="none" stroke="#fde047" strokeWidth="4" />
              <ellipse id="crown-ring-2" cx="0" cy="0" rx="12" ry="6.5" fill="rgba(254, 240, 138, 0.65)" filter="url(#soft-blur-sm)" />
            </g>
            <g id="mouth-waves" transform="translate(445, 345) rotate(32)" opacity="0">
              <path id="wave-arc-1" d="M 0,-28 A 34,34 0 0,1 0,28" fill="none" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
              <path id="wave-arc-2" d="M 14,-42 A 50,50 0 0,1 14,42" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <path id="wave-arc-3" d="M 28,-56 A 66,66 0 0,1 28,56" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
            </g>
          </g>

          {/* 4. Mallet Actor (#mallet-actor) */}
          <g id="mallet-actor" transform="translate(582, 168) rotate(0)">
            {/* Mallet 1: Zen Red Mallet */}
            <g id="mallet-zen">
              <line x1="16" y1="14" x2="-136" y2="24" stroke="rgba(0,0,0,0.42)" strokeWidth="16" strokeLinecap="round" filter="url(#soft-blur-sm)" />
              <path d="M 22,-4 L -134,4 L -134,14 L 22,10 Z" fill="url(#zen-fish-jaw)" stroke="url(#gold-rim)" strokeWidth="1.5" />
              <rect x="-24" y="-3" width="44" height="15" rx="6" fill="#991b1b" stroke="url(#gold-rim)" strokeWidth="1.8" />
              <path d="M 20,4 Q 42,16 36,42" fill="none" stroke="#dc2626" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="22" cy="4" r="6.5" fill="url(#gold-rim)" />
              <g transform="translate(-138, 9) rotate(-12)">
                <ellipse cx="0" cy="0" rx="24" ry="32" fill="url(#zen-fish-dome)" stroke="url(#gold-rim)" strokeWidth="2.5" />
                <ellipse cx="0" cy="8" rx="22" ry="7" fill="url(#gold-rim)" />
                <ellipse cx="-7" cy="-10" rx="7" ry="12" fill="rgba(255,255,255,0.35)" />
              </g>
            </g>

            {/* Mallet 2: Heavy Mech Mallet */}
            <g id="mallet-cyber" className="hidden">
              <line x1="16" y1="14" x2="-136" y2="24" stroke="rgba(0, 0, 0, 0.48)" strokeWidth="16" strokeLinecap="round" filter="url(#soft-blur-sm)" />
              <path d="M -18,-4 C -58,-16 -96,-14 -128,0" fill="none" stroke="url(#mech-copper-pipe)" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 22,-4 L -134,4 L -134,15 L 22,11 Z" fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="2" />
              <rect x="-86" y="-2" width="16" height="19" rx="3" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="1.6" />
              <circle cx="-54" cy="7" r="8" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="1.6" />
              <circle cx="-54" cy="7" r="5" fill="#fefce8" />
              <line x1="-54" y1="7" x2="-51" y2="4" stroke="#dc2626" strokeWidth="1.6" strokeLinecap="round" />
              <rect x="-26" y="-5" width="48" height="18" rx="5" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2" />
              <path d="M -16,-5 L -16,13 M -6,-5 L -6,13 M 4,-5 L 4,13 M 14,-5 L 14,13" stroke="#78350f" strokeWidth="2" />
              <circle cx="25" cy="4" r="6.5" fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="1.6" />
              <g transform="translate(-138, 9) rotate(-12)">
                <rect x="-20" y="-33" width="40" height="66" rx="8" fill="url(#mech-brass-plate)" stroke="#451a03" strokeWidth="2.4" />
                <rect x="-24" y="-18" width="48" height="36" rx="6" fill="url(#mech-steel-bevel)" stroke="#0f172a" strokeWidth="2.2" />
                <rect x="-24" y="-4" width="48" height="8" rx="3" fill="#f59e0b" stroke="#451a03" strokeWidth="1.4" />
                <circle cx="-13" cy="-25" r="2.8" fill="#fef08a" />
                <circle cx="13" cy="-25" r="2.8" fill="#fef08a" />
                <circle cx="-13" cy="25" r="2.8" fill="#fef08a" />
                <circle cx="13" cy="25" r="2.8" fill="#fef08a" />
              </g>
            </g>

            {/* Mallet 3: Cat Paw Mallet */}
            <g id="mallet-cat" className="hidden">
              <line x1="16" y1="14" x2="-136" y2="24" stroke="rgba(0,0,0,0.35)" strokeWidth="16" strokeLinecap="round" filter="url(#soft-blur-sm)" />
              <path d="M 22,-4 L -134,4 L -134,14 L 22,10 Z" fill="#fff5eb" stroke="#e07a3c" strokeWidth="2" />
              <rect x="-24" y="-4" width="46" height="16" rx="8" fill="#ff8fab" stroke="#ffffff" strokeWidth="2" />
              <g transform="translate(-112, 8)">
                <path d="M 0,0 C -12,-14 -22,-6 -12,6 Z M 0,0 C 12,-14 22,-6 12,6 Z" fill="#ff4d79" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="0" cy="2" r="6" fill="url(#gold-rim)" stroke="#92400e" strokeWidth="1.5" />
              </g>
              <g transform="translate(-140, 9) rotate(-14)">
                <ellipse cx="0" cy="0" rx="28" ry="32" fill="#fffdf9" stroke="#f3a661" strokeWidth="2.5" />
                <ellipse cx="4" cy="6" rx="13" ry="11" fill="url(#cat-paw-jelly)" />
                <circle cx="-10" cy="-10" r="6.5" fill="url(#cat-paw-jelly)" />
                <circle cx="0" cy="-15" r="6.5" fill="url(#cat-paw-jelly)" />
                <circle cx="11" cy="-12" r="6.5" fill="url(#cat-paw-jelly)" />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Tap instruction */}
      <p className="text-[11px] text-amber-200/60 font-mono tracking-wider animate-pulse mb-3">
        {language === 'zh' ? '✦ 轻触木鱼敲击祈福 · 积攒心神安宁 ✦' : '✦ Tap to strike wooden fish · Accumulate peace ✦'}
      </p>

      {/* Bottom Floating Skin Switcher Dock */}
      <div className="w-full max-w-[420px] rounded-full muyu-glass-panel p-1.5 grid grid-cols-3 gap-1.5 shadow-xl z-20">
        {(['zen', 'cyber', 'cat'] as MuyuSkin[]).map((skinKey) => {
          const cfg = SKIN_CONFIGS[skinKey];
          const isActive = skin === skinKey;
          return (
            <button
              key={skinKey}
              onClick={(e) => {
                e.stopPropagation();
                HapticsService.selection();
                handleSwitchSkin(skinKey);
              }}
              className={`rounded-full py-1.5 sm:py-2 px-2 transition-all border flex items-center justify-center space-x-1.5 active:scale-95 ${
                isActive
                  ? 'skin-btn-active text-amber-100 font-extrabold shadow-sm'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-sm leading-none">{cfg.icon}</span>
              <span className="text-xs sm:text-sm font-bold font-mono tracking-tight truncate">
                {language === 'zh' ? cfg.nameZh : cfg.nameEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
