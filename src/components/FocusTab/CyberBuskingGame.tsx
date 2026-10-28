import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Coins, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { HapticsService } from '../../services/haptics';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * ============================================================================
 * CYBER BUSKING STICKMAN - BLIND BOX EDITION (赛博乞讨火柴人 · 纯享盲盒版)
 * ============================================================================
 * 1. 9 Multi-Stage Talents (10.0s each, 4 distinct stages per performance):
 *    - 🎻 赛博二胡《二泉映月2077》
 *    - 🎸 重金属电吉他《Cyber Solo》
 *    - 🎷 全息爵士萨克斯《Neon Careless》
 *    - 🔮 五球矩阵杂耍《Quantum 5-Ball》
 *    - 🔥 双头激光火棍《Plasma Staff》
 *    - 🛞 独轮车顶碗绝活《Cyber Bowl Kick》
 *    - 🕺 街舞 Breaking《大风车 & 太空步》
 *    - 🤖 机械激光舞《Matrix Dodger》
 *    - ✨ 赛博荧光棒宅舞《光污染打Call》
 * 2. Forward Kinematics Skeleton Engine with afterimages and dynamic expressions
 * 3. Procedural Web Audio Synthesizer (Coins, Arpeggios, Basslines, Distortion)
 * 4. Holographic Auto-rotating Signboard (5 Slogans + Glitch Transitions)
 * 5. Full Bilingual Support (ZH / EN) + System Haptics + Local Persistence
 */

interface TalentDef {
  id: string;
  icon: string;
  nameZh: string;
  nameEn: string;
  stagesZh: string[];
  stagesEn: string[];
  face: string[];
}

const ALL_TALENTS: TalentDef[] = [
  {
    id: 'erhu',
    icon: '🎻',
    nameZh: '赛博二胡《二泉映月2077》',
    nameEn: 'Cyber Erhu: Moon Reflect 2077',
    stagesZh: [
      '阶段1: 悲怆慢拉 · 硅基落泪',
      '阶段2: 赛博电音 · 狂飙拉弓',
      '阶段3: 悬浮入定 · 仰天长啸',
      '阶段4: 泣血颤音 · 宗师收弓'
    ],
    stagesEn: [
      'Stage 1: Slow Bowing · Silicon Tears',
      'Stage 2: Cyber Synth · Hyper Shred',
      'Stage 3: Levitating · Skyward Howl',
      'Stage 4: Tremolo · Grandmaster Finish'
    ],
    face: ['T﹏T', '⚡皿⚡', '◎Д◎', '￣︶￣']
  },
  {
    id: 'guitar',
    icon: '🎸',
    nameZh: '重金属电吉他《Cyber Solo》',
    nameEn: 'Heavy Metal Guitar: Cyber Solo',
    stagesZh: [
      '阶段1: 蓝调灵魂 · 慢速推弦',
      '阶段2: 狂暴甩头 · 极速扫弦',
      '阶段3: 高空劈叉跳 · 背后盲弹',
      '阶段4: 摇滚跪滑 · 砸琴泛音'
    ],
    stagesEn: [
      'Stage 1: Soul Blues · Slow String Bend',
      'Stage 2: Headbanging · Hyper Sweep',
      'Stage 3: High Split Jump · Behind-Back Solo',
      'Stage 4: Knee Slide · Guitar Harmonic'
    ],
    face: ['~_~', '⚡o⚡', '🤘Д🤘', '⌐■_■']
  },
  {
    id: 'sax',
    icon: '🎷',
    nameZh: '全息爵士萨克斯《Neon Careless》',
    nameEn: 'Holo Jazz Sax: Neon Careless',
    stagesZh: [
      '阶段1: 午夜微醺 · 摇摆吹奏',
      '阶段2: 切分律动 · 太空碎步',
      '阶段3: 极限后仰下腰 · 漫天爱心',
      '阶段4: 单膝深情 · 爵士尾音'
    ],
    stagesEn: [
      'Stage 1: Midnight Groove · Swaying Horn',
      'Stage 2: Syncopated Sync · Space Shuffle',
      'Stage 3: Extreme Backbend · Heart Shower',
      'Stage 4: One-Knee Soul · Velvet Outro'
    ],
    face: ['⌐■_■', '⌐■‿■', '♥_♥', '⌐■_■']
  },
  {
    id: 'balls',
    icon: '🔮',
    nameZh: '五球矩阵杂耍《Quantum 5-Ball》',
    nameEn: 'Matrix Juggling: Quantum 5-Ball',
    stagesZh: [
      '阶段1: 三球瀑布 · 基础热身',
      '阶段2: 五球齐飞 · 高空交错',
      '阶段3: 背后盲抛 · 极限走位',
      '阶段4: 机械念力 · 周天公转'
    ],
    stagesEn: [
      'Stage 1: 3-Ball Cascade · Warmup',
      'Stage 2: 5-Ball Cross · High Arcs',
      'Stage 3: Blind Toss · Agile Footwork',
      'Stage 4: Telekinesis · Orbital Zen'
    ],
    face: ['⊙_⊙', '◎_◎', '°ロ°', '✧_✧']
  },
  {
    id: 'firestaff',
    icon: '🔥',
    nameZh: '双头激光火棍《Plasma Staff》',
    nameEn: 'Laser Plasma Staff',
    stagesZh: [
      '阶段1: 双手等离子 · 风车护盾',
      '阶段2: 高空抛棍 · 单手稳接',
      '阶段3: 背后换手 · 360°大回环',
      '阶段4: 双手残影 · 旋风定格'
    ],
    stagesEn: [
      'Stage 1: Dual Plasma · Windmill Shield',
      'Stage 2: High Sky Toss · One-Hand Catch',
      'Stage 3: Behind-Back · 360 Spin',
      'Stage 4: Phantom Tornado · Final Freeze'
    ],
    face: ['•̀_•́', '°ロ°', '⚡_⚡', '⌐■_■']
  },
  {
    id: 'unicycle',
    icon: '🛞',
    nameZh: '独轮车顶碗绝活《Cyber Bowl Kick》',
    nameEn: 'Cyber Unicycle: 5-Bowl Kick',
    stagesZh: [
      '阶段1: 赛博独轮 · 摇摆找平衡',
      '阶段2: 脚背架碗 · 高空踢飞',
      '阶段3: 连环踢碗 · 五碗叠罗汉',
      '阶段4: 头顶五碗 · 金鸡独立'
    ],
    stagesEn: [
      'Stage 1: Unicycle Wobble · Finding Balance',
      'Stage 2: Foot-Launch · High Bowl Kick',
      'Stage 3: Sequential Kicks · 5-Bowl Stack',
      'Stage 4: 5 Bowls on Head · Golden Rooster'
    ],
    face: ['°△°', '⊙o⊙', '⚡▽⚡', '^‿^']
  },
  {
    id: 'breakdance',
    icon: '🕺',
    nameZh: '街舞 Breaking《大风车 & 太空步》',
    nameEn: 'Breakdance: Windmill & Moonwalk',
    stagesZh: [
      '阶段1: Toprock · 街头摇滚步',
      '阶段2: 霓虹残影 · 丝滑太空步',
      '阶段3: 托马斯全旋 · 倒立大风车',
      '阶段4: 单手倒立 · Air-Freeze定格'
    ],
    stagesEn: [
      'Stage 1: Toprock · Street Groove',
      'Stage 2: Neon Afterimage · Moonwalk',
      'Stage 3: Thomas Flare · Inverted Windmill',
      'Stage 4: One-Hand Air-Freeze'
    ],
    face: ['⌐■_■', '¬‿¬', '◎_◎', '★‿★']
  },
  {
    id: 'popping',
    icon: '🤖',
    nameZh: '机械激光舞《Matrix Dodger》',
    nameEn: 'Robot Laser Dance: Matrix Dodger',
    stagesZh: [
      '阶段1: 高压电流 · 全身机械震动',
      '阶段2: 全息残影 · 左右瞬移滑步',
      '阶段3: 黑客帝国 · 90度下腰躲激光',
      '阶段4: 机械抱拳 · 红外锁定定格'
    ],
    stagesEn: [
      'Stage 1: High Voltage · Mechanical Pop',
      'Stage 2: Holo Blur · Flash Shift Step',
      'Stage 3: Matrix 90° Backbend · Laser Dodge',
      'Stage 4: Cyber Martial Salute · Freeze'
    ],
    face: ['[0_0]', '[1_0]', '[!_!]', '[■_■]']
  },
  {
    id: 'wotagei',
    icon: '✨',
    nameZh: '赛博荧光棒宅舞《光污染打Call》',
    nameEn: 'Wotagei Cyalume Glowstick Dance',
    stagesZh: [
      '阶段1: 双持大闪 · OAD过顶打Call',
      '阶段2: 狂暴双臂 · 残影大风车手刀',
      '阶段3: 雷神之锤 · 高举召唤光柱',
      '阶段4: 罗曼史斜指苍穹 · X字定格'
    ],
    stagesEn: [
      'Stage 1: Dual Ultra-Orange · OAD Over-Head',
      'Stage 2: Berserk Arms · Windmill Slashes',
      'Stage 3: Mjolnir Hammer · Sky Pillar',
      'Stage 4: Romance Skyward · Crossed X'
    ],
    face: ['≧▽≦', '☆Д☆', '🔥▽🔥', '✧‿✧']
  }
];

const SLOGANS = [
  { titleZh: "赛博要饭 · 功德快充", titleEn: "Cyber Begging · Karma Recharged", subZh: "支持脑机接口 / 算力转账 · 好人一生 0 Bug", subEn: "Direct neural transfer · Zero bug blessing" },
  { titleZh: "前大厂AI · 裁员再就业", titleEn: "Ex-BigTech AI · Seeking Compute", subZh: "精通二胡/吉他/顶碗/宅舞，点屏幕随机整活", subEn: "Master of erhu, guitar, bowls & dance" },
  { titleZh: "404: 晚饭 NOT FOUND", titleEn: "404: DINNER NOT FOUND", subZh: "义体欠费停机中，投币即刻激活 10秒 豪华演出", subEn: "Toss a coin to boot 10s luxury performance" },
  { titleZh: "求资助升级 RTX-9090Ti", titleEn: "Fund My RTX-9090Ti", subZh: "随手点一点，保佑老板发际线永不后退", subEn: "Tap to support, may your hairline never recede" },
  { titleZh: "赛博街头卖艺 · 盲盒版", titleEn: "Street Busking · Blind Box", subZh: "9大绝活绝不敷衍，每次投币都有新惊喜", subEn: "9 epic talents, new surprise on every coin" }
];

const BEGGING_QUOTES_ZH = [
  "行行好吧老板，已经三天没充上高压直流电了 T_T",
  "随便点一下屏幕赏个币，小的随机给您露一手绝活！",
  "404 Not Found... 连西北风都被防火墙拦截了 QwQ",
  "核心温度过低，急需老板的赛博打赏温暖主板...",
  "二胡、电吉他、独轮车顶碗、宅舞... 点我就开演！"
];

const BEGGING_QUOTES_EN = [
  "Spare some juice, boss! 3 days without DC power T_T",
  "Tap anywhere to toss a coin, I'll drop an epic talent!",
  "404 Not Found... even the breeze got firewall blocked QwQ",
  "CPU thermal throttling... need warm coin donation!",
  "Erhu, guitar, bowls, breakdance... tap to ignite show!"
];

const THANK_YOU_QUOTES_ZH = [
  "老板大气！！祝您写代码永无 Bug，编译一次过！",
  "收到盲盒打赏！10秒豪华四阶段绝活走起 ⚡",
  "感谢老板投喂！显卡温度瞬间 -10℃，算力拉满！",
  "叮！检测到高能功德注入，街头巨星模式启动！"
];

const THANK_YOU_QUOTES_EN = [
  "Generous boss! Zero bugs and clean compile forever!",
  "Blind box unlocked! 10-second 4-stage talent ignited ⚡",
  "GPU temp -10°C, compute maxed out! Thank you!",
  "Ding! High karma detected, street rockstar mode on!"
];

const DANMAKU_POOL: Record<string, { zh: string[]; en: string[] }> = {
  erhu: {
    zh: ["这二胡拉出了硅基生物的悲伤 😭", "《二泉映月2077》听得我义体生锈了", "拉得太好了，再点屏幕追投几个！", "从凄凉落泪到赛博电音只用了一秒ㅋㅋㅋ"],
    en: ["Silicon tears pouring down 😭", "Erhu 2077 rusted my cyberware", "Masterpiece! Tossing more coins!", "From melancholy to EDM in 1 sec haha"]
  },
  guitar: {
    zh: ["卧槽！这空中劈叉盲弹太帅了吧🎸", "赛博Slash附体！燃起来了🔥", "最后那一下摇滚跪滑砸琴绝了！", "闪电柱特效拉满，这波血赚！"],
    en: ["Insane split jump solo! 🎸", "Cyber Slash reincarnated! 🔥", "That knee-slide harmonic finish!", "Lightning pillars on point!"]
  },
  sax: {
    zh: ["墨镜一戴，谁都不爱 (⌐■_■)🎷", "这极限后仰腰力比我服务器还稳", "满屏爱心！浪漫主义赛博流浪汉~", "单膝跪地吹尾音太深情了！"],
    en: ["Sunglasses on, pure cool (⌐■_■)🎷", "Extreme backbend more stable than server", "Hearts everywhere! Romantic cyber bum~", "One-knee outro so soulful!"]
  },
  balls: {
    zh: ["五球齐飞还带背后盲抛？！外挂石锤🔮", "这算力至少占用了 8 个 GPU 线程", "最后机械念力周天公转太仙了", "赛博杂技团首席台柱子！"],
    en: ["5-ball juggle with blind toss?! Hax 🔮", "Consuming at least 8 GPU threads", "Telekinetic orbital zen is magnificent", "Headliner of the cyber circus!"]
  },
  firestaff: {
    zh: ["双头等离子火棍！星球大战既视感🔥", "抛这么高还能单手稳接，666", "背后换手360度大回环帅炸了", "这棍法能挡激光子弹了吧！"],
    en: ["Dual plasma staff! Star Wars vibes 🔥", "Tossed to the ceiling and caught smoothly", "360 behind-back spin was dope", "Deflecting lasers with this staff!"]
  },
  unicycle: {
    zh: ["独轮车踢碗上头？！国粹赛博化🛞", "连环踢五个金碗叠罗汉，绝了！", "头顶五碗还金鸡独立，陀螺仪超频了吧", "真·硬核街头卖艺，瑞思拜！"],
    en: ["Unicycle bowl kicking?! Pure skill 🛞", "5 bowls stacked on foot kick!", "Golden rooster balance with 5 bowls", "True hardcore busking, respect!"]
  },
  breakdance: {
    zh: ["这霓虹太空步滑得比磁悬浮还丝滑🕺", "托马斯大风车接单手Freeze！B-Boy之魂！", "关节润滑油刚加满吧这么丝滑", "地板都要被擦出火星子了⚡"],
    en: ["Moonwalk smoother than maglev train 🕺", "Windmill into one-hand Freeze! B-Boy!", "Lubricant freshly topped off", "Sparks flying off the dancefloor ⚡"]
  },
  popping: {
    zh: ["黑客帝国极限90度下腰躲激光！！🤖", "真·机械舞，毕竟本来就是机器人😂", "这残影瞬移是开了沙威斯坦吧！", "最后的机械抱拳宗师范拉满"],
    en: ["Matrix 90-degree laser dodge!! 🤖", "Real robot dance by actual robot 😂", "Sandevistan blur dodge activated!", "Martial arts fist salute masterclass"]
  },
  wotagei: {
    zh: ["前排打Call！这大闪亮度堪比太阳✨", "罗曼史斜指苍穹！老二次元落泪", "手臂甩出残影了，荧光棒要飞出去啦", "全屏应援光效，燃爆赛博夜市！"],
    en: ["Ultra-orange glowing like the sun ✨", "Romance pointing to the stars!", "Arms swinging in pure blur", "Full-screen glowsticks igniting the night!"]
  }
};

class BuskingAudio {
  ctx: AudioContext | null = null;
  lastBeatIndex = -1;
  muted = false;

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCoinToss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playCoinLand(isCombo = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = isCombo ? [1046.5, 1318.5, 1567.98, 2093.0] : [987.77, 1318.51, 1975.53];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === freqs.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.045);
      gain.gain.setValueAtTime(0.13, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.33);
    });
  }

  playTalentBeat(talentId: string, step: number, stageIdx: number) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (talentId === 'erhu') {
      const scale = stageIdx === 0
        ? [293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63, 293.66]
        : [440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 659.25, 587.33];
      const f = scale[step % scale.length];
      const dur = stageIdx === 0 ? 0.36 : 0.15;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f * 0.92, now);
      osc.frequency.exponentialRampToValueAtTime(f, now + dur * 0.4);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } else if (talentId === 'guitar') {
      const scale = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00];
      const f = scale[(step * (stageIdx + 1)) % scale.length];
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(f, now);
      osc2.frequency.setValueAtTime(f * 1.008, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.17);
      osc2.stop(now + 0.17);
    } else if (talentId === 'sax') {
      const jazz = [261.63, 311.13, 349.23, 369.99, 392.00, 466.16, 523.25, 466.16];
      const f = jazz[step % jazz.length] * (stageIdx === 2 ? 1.5 : 1);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f * 0.96, now);
      osc.frequency.linearRampToValueAtTime(f, now + 0.06);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (talentId === 'balls' || talentId === 'unicycle' || talentId === 'firestaff') {
      const arp = [523.25, 659.25, 783.99, 987.77, 1046.50, 783.99];
      const f = arp[step % arp.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = talentId === 'firestaff' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.2, now + 0.11);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else {
      const bass = [110, 130.81, 146.83, 164.81, 196.00, 220.00];
      const f = bass[step % bass.length] * (talentId === 'wotagei' ? 2.5 : 1);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = step % 2 === 0 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.6, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    }
  }
}

function createDefaultPose() {
  return {
    offsetX: -18,
    airOffset: 0,
    bodySpin: 0,
    torsoAngle: 0.35,
    headAngle: 0.45,
    faceLookX: 0.3,
    lShoulder: 0.65,
    lElbow: 1.45,
    rShoulder: 0.55,
    rElbow: 1.35,
    lHip: 0.55,
    lKnee: -1.62,
    rHip: 0.40,
    rKnee: -1.58
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export const CyberBuskingGame: React.FC = () => {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<BuskingAudio | null>(null);

  // Synced state for HUD
  const [hudBadge, setHudBadge] = useState<string>('🧎 跪地摇碗乞讨中');
  const [hudPhase, setHudPhase] = useState<string>('IDLE');
  const [hudFace, setHudFace] = useState<string>('T_T');
  const [progressBarWidth, setProgressBarWidth] = useState<number>(0);
  const [coinsCollected, setCoinsCollected] = useState<number>(() => {
    const s = localStorage.getItem('pulseflow_busking_coins');
    return s ? parseInt(s, 10) || 0 : 0;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // App internal simulation refs
  const appRef = useRef({
    state: 'BEGGING' as 'BEGGING' | 'PUT_DOWN_AND_STAND' | 'PERFORMING' | 'PACK_UP_AND_KNEEL',
    stateTimer: 0,
    currentTalent: 'erhu',
    talentBag: [] as string[],
    sloganIndex: 0,
    sloganTimer: 0,
    sloganGlitch: 0,
    currentPose: createDefaultPose(),
    targetPose: createDefaultPose(),
    renderedPelvisY: -50,
    poseHistory: [] as Array<{ joints: any; alpha: number }>,
    afterimageTimer: 0,
    bowl: {
      inHands: true,
      x: 18,
      y: -25,
      angle: 0,
      homeOffsetX: 46,
      glowPulse: 0,
      hitFlash: 0
    },
    speech: {
      text: BEGGING_QUOTES_ZH[0],
      timer: 4.5,
      alpha: 1,
      idleCycleTimer: 0
    },
    flyingCoins: [] as any[],
    particles: [] as any[],
    floatingTexts: [] as any[],
    danmakus: [] as any[],
    danmakuTimer: 0,
    rainDrops: [] as any[],
    buildings: [] as any[],
    juggleOrbs: [] as any[],
    comboCount: 0,
    joints: null as any,
    viewWidth: 360,
    viewHeight: 450,
    stageCenterX: 180,
    groundY: 395,
    cameraScale: 1.15
  });

  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const getSignLocalX = useCallback(() => {
    const s = appRef.current;
    const visibleHalfWidth = (s.viewWidth * 0.5) / s.cameraScale;
    return Math.min(98, Math.max(64, visibleHalfWidth - 52));
  }, []);

  const drawNextRandomTalent = useCallback(() => {
    const s = appRef.current;
    if (s.talentBag.length === 0) {
      const ids = ALL_TALENTS.map(t => t.id);
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      if (ids[ids.length - 1] === s.currentTalent && ids.length > 1) {
        [ids[ids.length - 1], ids[0]] = [ids[0], ids[ids.length - 1]];
      }
      s.talentBag = ids;
    }
    return s.talentBag.pop() || 'erhu';
  }, []);

  const say = useCallback((text: string, duration = 3.5) => {
    appRef.current.speech.text = text;
    appRef.current.speech.timer = duration;
    appRef.current.speech.alpha = 1;
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 135;
      appRef.current.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 55,
        size: 2 + Math.random() * 2.5,
        color,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8
      });
    }
  }, []);

  const spawnFloatingText = useCallback((x: number, y: number, text: string, color = '#00f3ff') => {
    appRef.current.floatingTexts.push({ x, y, text, color, life: 1.4, maxLife: 1.4 });
  }, []);

  const spawnDanmaku = useCallback((talentId: string) => {
    const s = appRef.current;
    const pool = DANMAKU_POOL[talentId] || DANMAKU_POOL.erhu;
    const poolList = language === 'zh' ? pool.zh : pool.en;
    const text = poolList[Math.floor(Math.random() * poolList.length)];
    const colors = ['#00f3ff', '#ffe600', '#ff77ff', '#00ff66'];
    s.danmakus.push({
      x: s.viewWidth + 20,
      y: 76 + Math.random() * Math.max(60, (s.groundY - 220)),
      text: `💬 ${text}`,
      speed: 78 + Math.random() * 45,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }, [language]);

  const updateHUD = useCallback(() => {
    const s = appRef.current;
    const tInfo = ALL_TALENTS.find(t => t.id === s.currentTalent) || ALL_TALENTS[0];

    if (s.state === 'BEGGING') {
      setHudBadge(language === 'zh' ? '🧎 跪地摇碗乞讨中' : '🧎 Kneeling on street');
      setHudPhase('WAITING');
      setHudFace('T_T');
      setProgressBarWidth(0);
    } else if (s.state === 'PUT_DOWN_AND_STAND') {
      const talentName = language === 'zh' ? tInfo.nameZh : tInfo.nameEn;
      setHudBadge(language === 'zh' ? `⚡ 放碗起身 -> ${talentName}` : `⚡ Standing -> ${talentName}`);
      setHudPhase('READY');
      setHudFace('￥_￥');
      setProgressBarWidth((s.stateTimer / 1.05) * 12);
    } else if (s.state === 'PERFORMING') {
      const t = s.stateTimer;
      let stgIdx = 0;
      if (t >= 7.8) stgIdx = 3;
      else if (t >= 5.0) stgIdx = 2;
      else if (t >= 2.5) stgIdx = 1;

      const stageDesc = language === 'zh' ? tInfo.stagesZh[stgIdx] : tInfo.stagesEn[stgIdx];
      setHudBadge(`${tInfo.icon} ${stageDesc}`);
      setHudPhase(`STAGE ${stgIdx + 1}/4`);
      setHudFace(tInfo.face[stgIdx] || '⌐■_■');
      const pct = clamp((s.stateTimer / 10.0) * 100, 0, 100);
      setProgressBarWidth(100 - pct);
    } else if (s.state === 'PACK_UP_AND_KNEEL') {
      setHudBadge(language === 'zh' ? '🙇 谢幕深鞠躬 · 拾碗回归' : '🙇 Bowing to crowd · Resuming');
      setHudPhase('BOW');
      setHudFace('^▽^');
      setProgressBarWidth(0);
    }
  }, [language]);

  const triggerTalent = useCallback((talentId: string) => {
    const s = appRef.current;
    s.currentTalent = talentId;
    const quotes = language === 'zh' ? THANK_YOU_QUOTES_ZH : THANK_YOU_QUOTES_EN;
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    say(quote, 3.8);

    if (s.state === 'BEGGING') {
      s.state = 'PUT_DOWN_AND_STAND';
      s.stateTimer = 0;
      if (audioRef.current) audioRef.current.lastBeatIndex = -1;
    } else if (s.state === 'PACK_UP_AND_KNEEL') {
      s.state = 'PUT_DOWN_AND_STAND';
      s.stateTimer = 0.52;
      if (audioRef.current) audioRef.current.lastBeatIndex = -1;
    }

    updateHUD();
    spawnDanmaku(talentId);
  }, [language, say, spawnDanmaku, updateHUD]);

  const onCoinLanded = useCallback(() => {
    const s = appRef.current;
    const isMidShowTip = (s.state === 'PERFORMING' || s.state === 'PUT_DOWN_AND_STAND');
    audioRef.current?.playCoinLand(isMidShowTip);
    HapticsService.light();

    setCoinsCollected(prev => {
      const next = prev + 1;
      localStorage.setItem('pulseflow_busking_coins', next.toString());
      return next;
    });

    s.bowl.hitFlash = 1.0;

    if (isMidShowTip) {
      s.comboCount++;
      spawnParticles(s.bowl.x, s.bowl.y, '#ff007f', 22);
      spawnParticles(0, -120, '#ffe600', 26);
      spawnParticles(0, -140, '#00f3ff', 18);
      spawnFloatingText(0, -185, `🔥 COMBO x${s.comboCount}!`, '#ffe600');
      spawnDanmaku(s.currentTalent);
    } else {
      s.comboCount = 1;
      spawnParticles(s.bowl.x, s.bowl.y, '#ffe600', 26);
      spawnParticles(s.bowl.x, s.bowl.y, '#00f3ff', 14);

      const nextTalentId = drawNextRandomTalent();
      const tInfo = ALL_TALENTS.find(t => t.id === nextTalentId) || ALL_TALENTS[0];
      const talentName = language === 'zh' ? tInfo.nameZh.split('《')[0] : tInfo.nameEn.split(':')[0];
      spawnFloatingText(s.bowl.x, s.bowl.y - 26, `🎲 ${tInfo.icon} ${talentName}`, '#ffe600');
      triggerTalent(nextTalentId);
    }
  }, [drawNextRandomTalent, language, spawnDanmaku, spawnFloatingText, spawnParticles, triggerTalent]);

  const tossCoin = useCallback((screenX: number, screenY: number) => {
    HapticsService.medium();
    audioRef.current?.playCoinToss();
    const s = appRef.current;
    const startX = (screenX - s.stageCenterX) / s.cameraScale;
    const startY = (screenY - s.groundY) / s.cameraScale;

    s.flyingCoins.push({
      startX,
      startY,
      x: startX,
      y: startY,
      targetX: s.bowl.x,
      targetY: s.bowl.y,
      progress: 0,
      duration: 0.42,
      arcHeight: 115 + Math.random() * 35,
      rotation: 0
    });
  }, []);

  // Main Canvas & Game Loop
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new BuskingAudio();
    }

    const s = appRef.current;

    // Distant Buildings
    s.buildings = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const w = 48 + Math.random() * 68;
      const h = 140 + Math.random() * 260;
      const layer = i % 3;
      const windows: any[] = [];
      const cols = Math.floor(w / 14);
      const rows = Math.floor(h / 20);
      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          if (Math.random() > 0.45) {
            windows.push({
              c, r,
              color: Math.random() > 0.72 ? '#ff007f' : (Math.random() > 0.45 ? '#00f3ff' : '#ffe600'),
              blinkPhase: Math.random() * Math.PI * 2
            });
          }
        }
      }
      s.buildings.push({ normX: i / count, w, h, layer, windows });
    }

    // Cyber Rain
    s.rainDrops = [];
    for (let i = 0; i < 65; i++) {
      s.rainDrops.push({
        x: Math.random() * 400,
        y: Math.random() * 450,
        len: 14 + Math.random() * 18,
        speed: 420 + Math.random() * 260,
        alpha: 0.14 + Math.random() * 0.28
      });
    }

    // Juggling Orbs
    const orbColors = ['#00f3ff', '#ff007f', '#ffe600', '#00ff66', '#b500ff'];
    const orbLabels = ['BTC', 'AI', 'ETH', '⚡', '404'];
    s.juggleOrbs = orbColors.map((color, idx) => ({
      x: 0, y: -90, color, label: orbLabels[idx], trail: []
    }));

    const resize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.viewWidth = rect.width || 360;
      s.viewHeight = rect.height || 450;
      canvasRef.current.width = Math.floor(s.viewWidth * dpr);
      canvasRef.current.height = Math.floor(s.viewHeight * dpr);

      // Shift stage up by ~1/6 of viewHeight as requested
      s.groundY = s.viewHeight - 52 - Math.round(s.viewHeight / 6);
      s.stageCenterX = s.viewWidth * 0.5;

      const availableHeadroom = s.groundY - 58;
      const targetStickmanPx = availableHeadroom * 0.44;
      const heightScale = targetStickmanPx / 172;
      const widthScale = s.viewWidth / 270;
      s.cameraScale = clamp(Math.min(heightScale, widthScale), 0.95, 1.35);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    if (containerRef.current) ro.observe(containerRef.current);

    // Forward Kinematics Solver
    const solveSkeleton = (pose: any) => {
      const torsoLen = 54;
      const uArmLen = 35;
      const fArmLen = 34;
      const thighLen = 42;
      const calfLen = 42;

      const spin = pose.bodySpin || 0;
      const rotX = (dx: number, dy: number) => dx * Math.cos(spin) - dy * Math.sin(spin);
      const rotY = (dx: number, dy: number) => dx * Math.sin(spin) + dy * Math.cos(spin);

      const neckRelX = Math.sin(pose.torsoAngle) * torsoLen;
      const neckRelY = -Math.cos(pose.torsoAngle) * torsoLen;

      const shoulderRelX = Math.sin(pose.torsoAngle) * (torsoLen * 0.86);
      const shoulderRelY = -Math.cos(pose.torsoAngle) * (torsoLen * 0.86);

      const headRelX = neckRelX + Math.sin(pose.headAngle) * 20;
      const headRelY = neckRelY - Math.cos(pose.headAngle) * 20;

      const lElbowRelX = shoulderRelX + Math.sin(pose.lShoulder) * uArmLen;
      const lElbowRelY = shoulderRelY + Math.cos(pose.lShoulder) * uArmLen;
      const lHandRelX = lElbowRelX + Math.sin(pose.lElbow) * fArmLen;
      const lHandRelY = lElbowRelY + Math.cos(pose.lElbow) * fArmLen;

      const rElbowRelX = shoulderRelX + Math.sin(pose.rShoulder) * uArmLen;
      const rElbowRelY = shoulderRelY + Math.cos(pose.rShoulder) * uArmLen;
      const rHandRelX = rElbowRelX + Math.sin(pose.rElbow) * fArmLen;
      const rHandRelY = rElbowRelY + Math.cos(pose.rElbow) * fArmLen;

      const lKneeRelX = Math.sin(pose.lHip) * thighLen;
      const lKneeRelY = Math.cos(pose.lHip) * thighLen;
      const lFootRelX = lKneeRelX + Math.sin(pose.lKnee) * calfLen;
      const lFootRelY = lKneeRelY + Math.cos(pose.lKnee) * calfLen;

      const rKneeRelX = Math.sin(pose.rHip) * thighLen;
      const rKneeRelY = Math.cos(pose.rHip) * thighLen;
      const rFootRelX = rKneeRelX + Math.sin(pose.rKnee) * calfLen;
      const rFootRelY = rKneeRelY + Math.cos(pose.rKnee) * calfLen;

      const pts = {
        pelvis: { x: 0, y: 0 },
        neck: { x: rotX(neckRelX, neckRelY), y: rotY(neckRelX, neckRelY) },
        shoulder: { x: rotX(shoulderRelX, shoulderRelY), y: rotY(shoulderRelX, shoulderRelY) },
        head: { x: rotX(headRelX, headRelY), y: rotY(headRelX, headRelY) },
        lElbow: { x: rotX(lElbowRelX, lElbowRelY), y: rotY(lElbowRelX, lElbowRelY) },
        lHand: { x: rotX(lHandRelX, lHandRelY), y: rotY(lHandRelX, lHandRelY) },
        rElbow: { x: rotX(rElbowRelX, rElbowRelY), y: rotY(rElbowRelX, rElbowRelY) },
        rHand: { x: rotX(rHandRelX, rHandRelY), y: rotY(rHandRelX, rHandRelY) },
        lKnee: { x: rotX(lKneeRelX, lKneeRelY), y: rotY(lKneeRelX, lKneeRelY) },
        lFoot: { x: rotX(lFootRelX, lFootRelY), y: rotY(lFootRelX, lFootRelY) },
        rKnee: { x: rotX(rKneeRelX, rKneeRelY), y: rotY(rKneeRelX, rKneeRelY) },
        rFoot: { x: rotX(rFootRelX, rFootRelY), y: rotY(rFootRelX, rFootRelY) }
      };

      const lowestRelY = Math.max(
        pts.lKnee.y, pts.rKnee.y,
        pts.lFoot.y, pts.rFoot.y,
        pts.lHand.y, pts.rHand.y,
        pts.head.y + 19
      );

      const targetPelvisY = -lowestRelY - (pose.airOffset || 0);
      s.renderedPelvisY = lerp(s.renderedPelvisY, targetPelvisY, 0.38);

      const pelvisX = pose.offsetX || 0;
      const pelvisY = s.renderedPelvisY;

      for (const key in pts) {
        (pts as any)[key].x += pelvisX;
        (pts as any)[key].y += pelvisY;
      }

      return pts;
    };

    // Poses Generators
    const computeTargetPose = (time: number) => {
      const p = s.targetPose;
      p.offsetX = 0;
      p.airOffset = 0;
      p.bodySpin = 0;

      if (s.state === 'BEGGING') {
        const shake = Math.sin(time * 9.5);
        const breathe = Math.sin(time * 2.5);
        p.offsetX = -18;
        p.torsoAngle = 0.35 + breathe * 0.04;
        p.headAngle = 0.42 + Math.sin(time * 1.8) * 0.07;
        p.faceLookX = 0.35;
        p.lShoulder = 0.66 + shake * 0.07;
        p.lElbow = 1.40 + shake * 0.16;
        p.rShoulder = 0.54 + shake * 0.07;
        p.rElbow = 1.30 + shake * 0.16;
        p.lHip = 0.56;
        p.lKnee = -1.60;
        p.rHip = 0.38;
        p.rKnee = -1.58;
        s.bowl.inHands = true;
      } else if (s.state === 'PUT_DOWN_AND_STAND') {
        const t = s.stateTimer;
        if (t < 0.52) {
          const u = smoothstep(0, 0.52, t);
          p.offsetX = lerp(-18, -8, u);
          p.torsoAngle = lerp(0.35, 0.76, u);
          p.headAngle = lerp(0.42, 0.68, u);
          p.faceLookX = 0.5;
          p.lShoulder = lerp(0.66, 0.88, u);
          p.lElbow = lerp(1.40, 1.05, u);
          p.rShoulder = lerp(0.54, 0.82, u);
          p.rElbow = lerp(1.30, 0.98, u);
          p.lHip = 0.56;
          p.lKnee = -1.60;
          p.rHip = 0.38;
          p.rKnee = -1.58;
          s.bowl.inHands = true;
        } else {
          if (s.bowl.inHands) {
            s.bowl.inHands = false;
            s.bowl.x = s.bowl.homeOffsetX;
            s.bowl.y = -9;
            s.bowl.angle = 0;
          }
          const u = smoothstep(0.52, 1.05, t);
          p.offsetX = lerp(-8, 0, u);
          p.torsoAngle = lerp(0.76, 0.0, u);
          p.headAngle = lerp(0.68, 0.0, u);
          p.faceLookX = lerp(0.5, 0.0, u);
          p.lShoulder = lerp(0.88, -0.42, u);
          p.lElbow = lerp(1.05, -0.95, u);
          p.rShoulder = lerp(0.82, 0.42, u);
          p.rElbow = lerp(0.98, 0.95, u);
          p.lHip = lerp(0.56, -0.18, u);
          p.lKnee = lerp(-1.60, -0.18, u);
          p.rHip = lerp(0.38, 0.18, u);
          p.rKnee = lerp(-1.58, 0.18, u);
        }
      } else if (s.state === 'PERFORMING') {
        s.bowl.inHands = false;
        const t = s.stateTimer;
        let stgIdx = 0;
        if (t >= 7.8) stgIdx = 3;
        else if (t >= 5.0) stgIdx = 2;
        else if (t >= 2.5) stgIdx = 1;

        const beatSpeed = (s.currentTalent === 'erhu' && stgIdx === 0) ? 3.2 : 7.5;
        const beatIdx = Math.floor(t * beatSpeed);
        if (beatIdx !== audioRef.current?.lastBeatIndex) {
          if (audioRef.current) audioRef.current.lastBeatIndex = beatIdx;
          audioRef.current?.playTalentBeat(s.currentTalent, beatIdx, stgIdx);
          updateHUD();
        }

        // Talent Specific Poses
        const tid = s.currentTalent;
        if (tid === 'erhu') {
          p.lHip = -0.68; p.lKnee = 0.12; p.rHip = 0.68; p.rKnee = -0.12;
          if (stgIdx === 0) {
            const bow = Math.sin(t * 3.5);
            p.torsoAngle = 0.18 + Math.sin(t * 1.8) * 0.06;
            p.headAngle = 0.36 + Math.sin(t * 2.2) * 0.08;
            p.faceLookX = 0.2;
            p.lShoulder = 0.55;
            p.lElbow = 1.65 + Math.sin(t * 4) * 0.08;
            p.rShoulder = 0.35 + bow * 0.32;
            p.rElbow = 1.25 + bow * 0.55;
          } else if (stgIdx === 1) {
            const fastBow = Math.sin(t * 22);
            p.torsoAngle = -0.08 + Math.sin(t * 9) * 0.12;
            p.headAngle = Math.sin(t * 11) * 0.28;
            p.faceLookX = 0.3;
            p.lShoulder = 0.58 + Math.sin(t * 14) * 0.18;
            p.lElbow = 1.68 + Math.cos(t * 14) * 0.25;
            p.rShoulder = 0.38 + fastBow * 0.45;
            p.rElbow = 1.22 + fastBow * 0.78;
          } else if (stgIdx === 2) {
            const fastBow = Math.sin(t * 25);
            p.airOffset = 24 + Math.sin(t * 6) * 8;
            p.torsoAngle = -0.32;
            p.headAngle = -0.68;
            p.faceLookX = 0.0;
            p.lShoulder = 0.65;
            p.lElbow = 1.75;
            p.rShoulder = 0.42 + fastBow * 0.52;
            p.rElbow = 1.15 + fastBow * 0.85;
          } else {
            const tremolo = Math.sin(t * 32) * 0.08;
            p.airOffset = 0;
            p.torsoAngle = -0.15;
            p.headAngle = -0.10;
            p.faceLookX = 0.35;
            p.lShoulder = 0.65;
            p.lElbow = 1.75 + tremolo;
            p.rShoulder = -0.85;
            p.rElbow = -1.65;
          }
        } else if (tid === 'guitar') {
          if (stgIdx === 0) {
            const sway = Math.sin(t * 3.5);
            p.torsoAngle = -0.18 + sway * 0.08;
            p.headAngle = 0.28 + sway * 0.12;
            p.faceLookX = 0.25;
            p.lShoulder = 0.68; p.lElbow = 1.65 + Math.sin(t * 8) * 0.12;
            p.rShoulder = -0.35; p.rElbow = 0.95 + Math.sin(t * 7) * 0.22;
            p.lHip = -0.32; p.lKnee = -0.22; p.rHip = 0.32; p.rKnee = 0.18;
          } else if (stgIdx === 1) {
            const bang = Math.sin(t * 14);
            p.offsetX = Math.sin(t * 3) * 18;
            p.torsoAngle = 0.15 + bang * 0.12;
            p.headAngle = 0.35 + bang * 0.55;
            p.faceLookX = 0.3;
            p.lShoulder = 0.75 + Math.sin(t * 10) * 0.22;
            p.lElbow = 1.72 + Math.sin(t * 10) * 0.25;
            p.rShoulder = -0.32; p.rElbow = 0.95 + Math.sin(t * 28) * 0.45;
            p.lHip = -0.42; p.lKnee = -0.25 + Math.max(0, bang) * 0.25;
            p.rHip = 0.42; p.rKnee = 0.15 + Math.max(0, -bang) * 0.25;
          } else if (stgIdx === 2) {
            const subT = t - 5.0;
            if (subT < 1.35) {
              const jumpArc = Math.sin((subT / 1.35) * Math.PI);
              p.airOffset = jumpArc * 56;
              p.torsoAngle = -0.15; p.headAngle = -0.25;
              p.lShoulder = 0.75; p.lElbow = 1.75;
              p.rShoulder = -0.35; p.rElbow = 0.95 + Math.sin(t * 30) * 0.45;
              p.lHip = lerp(-0.35, -1.25, jumpArc); p.lKnee = lerp(-0.2, -0.85, jumpArc);
              p.rHip = lerp(0.35, 1.25, jumpArc); p.rKnee = lerp(0.2, 0.85, jumpArc);
            } else {
              p.torsoAngle = -0.35; p.headAngle = -0.45;
              p.lShoulder = 1.65; p.lElbow = 2.45;
              p.rShoulder = -1.45; p.rElbow = -2.15 + Math.sin(t * 28) * 0.4;
              p.lHip = -0.48; p.lKnee = -0.15; p.rHip = 0.48; p.rKnee = 0.15;
            }
          } else {
            const slideU = smoothstep(7.8, 8.6, t);
            p.offsetX = lerp(-28, 18, slideU);
            p.torsoAngle = -0.42; p.headAngle = -0.52; p.faceLookX = 0.3;
            p.lShoulder = 2.35; p.lElbow = 2.65;
            p.rShoulder = -1.85; p.rElbow = -2.25;
            p.lHip = 0.55; p.lKnee = -1.55; p.rHip = 0.42; p.rKnee = -1.48;
          }
        } else if (tid === 'sax') {
          const groove = Math.sin(t * 6.5);
          if (stgIdx === 0) {
            p.torsoAngle = -0.12 + groove * 0.08;
            p.headAngle = 0.15 + groove * 0.06;
            p.faceLookX = 0.35;
            p.lShoulder = 0.58; p.lElbow = 1.62;
            p.rShoulder = 0.45; p.rElbow = 1.28;
            p.lHip = -0.22; p.lKnee = -0.25 + Math.max(0, groove) * 0.22;
            p.rHip = 0.22; p.rKnee = 0.12 + Math.max(0, -groove) * 0.22;
          } else if (stgIdx === 1) {
            p.offsetX = Math.sin(t * 2.5) * 22;
            p.torsoAngle = -0.22 + groove * 0.12;
            p.headAngle = 0.05 + groove * 0.12;
            p.faceLookX = 0.4;
            p.lShoulder = 0.65 + groove * 0.12; p.lElbow = 1.72;
            p.rShoulder = 0.52 + groove * 0.12; p.rElbow = 1.38;
            p.lHip = Math.sin(t * 6.5) * 0.38; p.lKnee = p.lHip - 0.35;
            p.rHip = -Math.sin(t * 6.5) * 0.38; p.rKnee = p.rHip - 0.35;
          } else if (stgIdx === 2) {
            p.torsoAngle = -0.78 + Math.sin(t * 8) * 0.05;
            p.headAngle = -0.65; p.faceLookX = 0.35;
            p.lShoulder = 1.15; p.lElbow = 2.15;
            p.rShoulder = 0.95; p.rElbow = 1.85;
            p.lHip = 0.45; p.lKnee = -0.45; p.rHip = 0.65; p.rKnee = -0.15;
          } else {
            p.torsoAngle = -0.22; p.headAngle = -0.12;
            p.lShoulder = 0.72; p.lElbow = 1.75;
            p.rShoulder = 0.55; p.rElbow = 1.45;
            p.lHip = -0.35; p.lKnee = -1.48;
            p.rHip = 0.72; p.rKnee = -0.12;
          }
        } else if (tid === 'balls') {
          const speed = stgIdx === 0 ? 7.5 : 12.0;
          const phase = t * speed;
          if (stgIdx < 2) {
            p.torsoAngle = Math.sin(phase * 0.5) * 0.06;
            p.headAngle = -0.25 + Math.sin(phase) * 0.08;
            p.faceLookX = Math.sin(phase * 0.5) * 0.35;
            p.lShoulder = -0.45 + Math.sin(phase) * 0.22;
            p.lElbow = -1.48 + Math.cos(phase) * 0.45;
            p.rShoulder = 0.45 - Math.sin(phase) * 0.22;
            p.rElbow = 1.48 - Math.cos(phase) * 0.45;
            p.lHip = -0.22; p.lKnee = -0.18; p.rHip = 0.22; p.rKnee = 0.18;
          } else if (stgIdx === 2) {
            p.offsetX = Math.sin(t * 4.5) * 26;
            p.torsoAngle = Math.cos(t * 4.5) * 0.22;
            p.headAngle = -0.35;
            p.faceLookX = -Math.sin(t * 4.5) * 0.45;
            p.lShoulder = 0.65 + Math.sin(phase) * 0.55;
            p.lElbow = -0.85 + Math.cos(phase) * 0.65;
            p.rShoulder = -0.65 - Math.sin(phase) * 0.55;
            p.rElbow = 0.85 - Math.cos(phase) * 0.65;
            p.lHip = -0.35; p.lKnee = -0.25; p.rHip = 0.35; p.rKnee = 0.25;
          } else {
            p.airOffset = 28 + Math.sin(t * 5) * 8;
            p.torsoAngle = 0; p.headAngle = -0.15; p.faceLookX = 0;
            p.lShoulder = -1.35 + Math.sin(t * 6) * 0.12; p.lElbow = -1.95;
            p.rShoulder = 1.35 - Math.sin(t * 6) * 0.12; p.rElbow = 1.95;
            p.lHip = -0.65; p.lKnee = 0.45; p.rHip = 0.65; p.rKnee = -0.45;
          }
        } else if (tid === 'firestaff') {
          if (stgIdx === 0) {
            p.torsoAngle = Math.sin(t * 6) * 0.12;
            p.headAngle = 0;
            p.lShoulder = 0.25 + Math.sin(t * 12) * 0.35;
            p.lElbow = 0.85 + Math.cos(t * 12) * 0.35;
            p.rShoulder = -0.25 - Math.sin(t * 12) * 0.35;
            p.rElbow = -0.85 - Math.cos(t * 12) * 0.35;
            p.lHip = -0.38; p.lKnee = -0.25; p.rHip = 0.38; p.rKnee = 0.25;
          } else if (stgIdx === 1) {
            p.torsoAngle = -0.25; p.headAngle = -0.65;
            p.lShoulder = -1.85; p.lElbow = -2.45;
            p.rShoulder = 2.15; p.rElbow = 2.75;
            p.lHip = -0.32; p.lKnee = -0.28; p.rHip = 0.32; p.rKnee = 0.28;
          } else if (stgIdx === 2) {
            p.offsetX = Math.sin(t * 5) * 32;
            p.airOffset = Math.abs(Math.sin(t * 8)) * 18;
            p.torsoAngle = Math.sin(t * 10) * 0.28;
            p.headAngle = Math.cos(t * 10) * 0.22;
            p.lShoulder = Math.sin(t * 15) * 1.4; p.lElbow = Math.cos(t * 15) * 1.8;
            p.rShoulder = -Math.sin(t * 15) * 1.4; p.rElbow = -Math.cos(t * 15) * 1.8;
            p.lHip = -0.45; p.lKnee = -0.20; p.rHip = 0.45; p.rKnee = 0.20;
          } else {
            p.torsoAngle = -0.12; p.headAngle = 0.0; p.faceLookX = 0.25;
            p.rShoulder = 1.25; p.rElbow = 1.55;
            p.lShoulder = -0.85; p.lElbow = -1.45;
            p.lHip = -0.42; p.lKnee = -0.35; p.rHip = 0.38; p.rKnee = 0.25;
          }
        } else if (tid === 'unicycle') {
          p.airOffset = 28;
          const pedal = t * 9.0;
          if (stgIdx === 0) {
            const wobble = Math.sin(t * 7.5);
            p.offsetX = wobble * 24;
            p.torsoAngle = -wobble * 0.25;
            p.headAngle = wobble * 0.15;
            p.lShoulder = -1.45 + wobble * 0.45; p.lElbow = -1.85;
            p.rShoulder = 1.45 + wobble * 0.45; p.rElbow = 1.85;
            p.lHip = -0.25 + Math.sin(pedal) * 0.25; p.lKnee = 0.15 + Math.cos(pedal) * 0.25;
            p.rHip = 0.25 - Math.sin(pedal) * 0.25; p.rKnee = -0.15 - Math.cos(pedal) * 0.25;
          } else if (stgIdx === 1 || stgIdx === 2) {
            const kickCycle = ((t - 2.5) * 1.45) % 1.0;
            const kickLift = Math.sin(kickCycle * Math.PI);
            p.offsetX = Math.sin(t * 3.5) * (stgIdx === 2 ? 24 : 12);
            p.torsoAngle = -kickLift * 0.22;
            p.headAngle = 0;
            p.lShoulder = -1.35; p.lElbow = -1.65;
            p.rShoulder = 1.35; p.rElbow = 1.65;
            p.lHip = -0.15; p.lKnee = 0.05;
            p.rHip = lerp(0.25, 1.35, kickLift); p.rKnee = lerp(-0.15, 1.65, kickLift);
          } else {
            p.offsetX = 0; p.torsoAngle = 0; p.headAngle = 0;
            p.lShoulder = -1.85; p.lElbow = -2.55;
            p.rShoulder = 1.85; p.rElbow = 2.55;
            p.lHip = -0.05; p.lKnee = 0.0;
            p.rHip = 1.15; p.rKnee = -0.45;
          }
        } else if (tid === 'breakdance') {
          const beat = t * 9.0;
          if (stgIdx === 0) {
            const groove = Math.sin(beat);
            p.offsetX = Math.sin(beat * 0.5) * 24;
            p.airOffset = Math.abs(groove) * 10;
            p.torsoAngle = Math.sin(beat * 0.5) * 0.18;
            p.headAngle = -p.torsoAngle;
            p.lShoulder = -0.85 + groove * 0.55; p.lElbow = -1.75 + Math.cos(beat) * 0.45;
            p.rShoulder = 0.85 + groove * 0.55; p.rElbow = 1.75 - Math.cos(beat) * 0.45;
            p.lHip = -0.28 + groove * 0.35; p.lKnee = -0.35 - Math.max(0, groove) * 0.55;
            p.rHip = 0.28 + groove * 0.35; p.rKnee = 0.15 - Math.max(0, -groove) * 0.55;
          } else if (stgIdx === 1) {
            const u = (t - 2.5) / 2.5;
            const dir = u < 0.5 ? -1 : 1;
            const prog = u < 0.5 ? (u * 2) : (2 - u * 2);
            p.offsetX = (prog - 0.5) * 85;
            p.torsoAngle = -dir * 0.18; p.headAngle = -dir * 0.42; p.faceLookX = -dir * 0.45;
            const stride = beat * 1.2;
            p.lShoulder = -0.35 + Math.sin(stride) * 0.45; p.lElbow = -0.85 + Math.sin(stride) * 0.35;
            p.rShoulder = 0.35 - Math.sin(stride) * 0.45; p.rElbow = 0.65 - Math.sin(stride) * 0.35;
            const lC = Math.sin(stride);
            const rC = Math.sin(stride + Math.PI);
            p.lHip = lC * 0.44; p.lKnee = lC > 0 ? -0.58 * lC : 0.05;
            p.rHip = rC * 0.44; p.rKnee = rC > 0 ? -0.58 * rC : 0.05;
          } else if (stgIdx === 2) {
            const spinPhase = (t - 5.0) * 6.5;
            p.bodySpin = Math.PI * 0.92 + Math.sin(spinPhase) * 0.22;
            p.torsoAngle = Math.sin(spinPhase) * 0.25; p.headAngle = -0.25;
            p.lShoulder = 2.95 + Math.sin(spinPhase) * 0.2; p.lElbow = 3.05;
            p.rShoulder = -2.85 - Math.sin(spinPhase) * 0.2; p.rElbow = -2.95;
            p.lHip = -0.85 + Math.sin(spinPhase * 1.5) * 0.45; p.lKnee = -0.85;
            p.rHip = 0.85 - Math.sin(spinPhase * 1.5) * 0.45; p.rKnee = 0.85;
          } else {
            p.bodySpin = Math.PI * 0.82;
            p.torsoAngle = -0.25; p.headAngle = -0.15;
            p.lShoulder = 2.88; p.lElbow = 2.92;
            p.rShoulder = -1.25; p.rElbow = -2.15;
            p.lHip = -0.95; p.lKnee = -1.45;
            p.rHip = 0.75; p.rKnee = 0.65;
          }
        } else if (tid === 'popping') {
          const quantStep = Math.floor(t * 6.0);
          const subStep = (t * 6.0) - quantStep;
          const snap = smoothstep(0, 0.26, subStep);

          if (stgIdx < 2) {
            const poses = [
              { x: 0, torso: 0.0, head: 0.0, lS: -1.57, lE: -3.14, rS: 1.57, rE: 0.0, lH: -0.2, rH: 0.2 },
              { x: -28, torso: 0.14, head: -0.25, lS: -1.57, lE: 0.0, rS: 1.57, rE: 3.14, lH: -0.28, rH: 0.15 },
              { x: 28, torso: -0.14, head: 0.25, lS: 0.0, lE: -1.57, rS: 0.0, rE: 1.57, lH: -0.15, rH: 0.28 },
              { x: 0, torso: 0.0, head: 0.0, lS: -2.35, lE: -0.78, rS: 2.35, rE: 0.78, lH: -0.32, rH: 0.32 }
            ];
            const curr = poses[quantStep % poses.length];
            const next = poses[(quantStep + 1) % poses.length];
            p.offsetX = stgIdx === 1 ? lerp(curr.x, next.x, snap) : 0;
            p.torsoAngle = lerp(curr.torso, next.torso, snap);
            p.headAngle = lerp(curr.head, next.head, snap);
            p.lShoulder = lerp(curr.lS, next.lS, snap);
            p.lElbow = lerp(curr.lE, next.lE, snap);
            p.rShoulder = lerp(curr.rS, next.rS, snap);
            p.rElbow = lerp(curr.rE, next.rE, snap);
            p.lHip = lerp(curr.lH, next.lH, snap); p.lKnee = p.lHip;
            p.rHip = lerp(curr.rH, next.rH, snap); p.rKnee = p.rHip;
          } else if (stgIdx === 2) {
            const wave = Math.sin((t - 5.0) * 10);
            p.torsoAngle = -1.24 + wave * 0.05;
            p.headAngle = -1.05; p.faceLookX = 0.4;
            p.lShoulder = -1.6 + wave * 0.85; p.lElbow = -2.4 + Math.cos((t - 5.0) * 10) * 0.75;
            p.rShoulder = -0.8 - wave * 0.85; p.rElbow = -1.8 - Math.cos((t - 5.0) * 10) * 0.75;
            p.lHip = 0.78; p.lKnee = -0.58; p.rHip = 0.96; p.rKnee = -0.25;
          } else {
            p.torsoAngle = 0.05; p.headAngle = 0.0; p.faceLookX = 0.0;
            p.lShoulder = -0.65; p.lElbow = 1.48;
            p.rShoulder = 0.65; p.rElbow = -1.48;
            p.lHip = -0.35; p.lKnee = -0.35; p.rHip = 0.35; p.rKnee = 0.35;
          }
        } else if (tid === 'wotagei') {
          const squatBounce = Math.abs(Math.sin(t * 10)) * 0.18;
          p.lHip = -0.58; p.lKnee = -0.18 - squatBounce;
          p.rHip = 0.58; p.rKnee = 0.18 + squatBounce;
          if (stgIdx === 0) {
            const wave = Math.sin(t * 8.5);
            p.torsoAngle = wave * 0.22; p.headAngle = wave * 0.32;
            p.lShoulder = -2.45 + wave * 0.55; p.lElbow = -2.75 + wave * 0.65;
            p.rShoulder = 2.45 + wave * 0.55; p.rElbow = 2.75 + wave * 0.65;
          } else if (stgIdx === 1) {
            const spin = t * 22;
            p.torsoAngle = Math.sin(t * 11) * 0.15; p.headAngle = -0.25;
            p.lShoulder = spin; p.lElbow = spin + 0.35;
            p.rShoulder = -spin; p.rElbow = -spin - 0.35;
          } else if (stgIdx === 2) {
            const pump = Math.sin(t * 14) * 0.22;
            p.torsoAngle = -0.15; p.headAngle = -0.55;
            p.lShoulder = -2.85 + pump; p.lElbow = -3.05 + pump;
            p.rShoulder = 2.85 - pump; p.rElbow = 3.05 - pump;
          } else {
            const subT = t - 7.8;
            if (subT < 1.2) {
              const step = Math.floor(t * 6.0);
              const dir = step % 2 === 0 ? 1 : -1;
              p.torsoAngle = dir * 0.38; p.headAngle = dir * 0.48;
              p.lShoulder = dir * 2.35; p.lElbow = dir * 2.55;
              p.rShoulder = dir * 2.15; p.rElbow = dir * 2.35;
            } else {
              p.torsoAngle = 0; p.headAngle = -0.35;
              p.lShoulder = -2.45; p.lElbow = 2.55;
              p.rShoulder = 2.45; p.rElbow = -2.55;
            }
          }
        }
      } else if (s.state === 'PACK_UP_AND_KNEEL') {
        const t = s.stateTimer;
        if (t < 0.50) {
          const bow = Math.sin((t / 0.50) * Math.PI);
          p.offsetX = lerp(0, -8, t / 0.50);
          p.torsoAngle = bow * 0.75;
          p.headAngle = bow * 0.92;
          p.faceLookX = 0.2;
          p.rShoulder = lerp(0.2, 0.45, bow);
          p.rElbow = lerp(0.3, -1.25, bow);
          p.lShoulder = lerp(-0.2, -0.68, bow);
          p.lElbow = lerp(-0.3, -0.88, bow);
          p.lHip = -0.15; p.lKnee = -0.15; p.rHip = 0.15; p.rKnee = 0.15;
          s.bowl.inHands = false;
        } else if (t < 0.88) {
          const u = smoothstep(0.50, 0.88, t);
          p.offsetX = lerp(-8, -14, u);
          p.torsoAngle = lerp(0.1, 0.72, u);
          p.headAngle = lerp(0.1, 0.65, u);
          p.faceLookX = 0.4;
          p.lShoulder = lerp(-0.3, 0.85, u);
          p.lElbow = lerp(-0.4, 1.05, u);
          p.rShoulder = lerp(0.3, 0.78, u);
          p.rElbow = lerp(-0.3, 0.98, u);
          p.lHip = lerp(-0.15, 0.56, u);
          p.lKnee = lerp(-0.15, -1.60, u);
          p.rHip = lerp(0.15, 0.38, u);
          p.rKnee = lerp(0.15, -1.58, u);
        } else {
          s.bowl.inHands = true;
          const u = smoothstep(0.88, 1.15, t);
          p.offsetX = lerp(-14, -18, u);
          p.torsoAngle = lerp(0.72, 0.35, u);
          p.headAngle = lerp(0.65, 0.42, u);
          p.faceLookX = 0.35;
          p.lShoulder = lerp(0.85, 0.66, u);
          p.lElbow = lerp(1.05, 1.40, u);
          p.rShoulder = lerp(0.78, 0.54, u);
          p.rElbow = lerp(0.98, 1.30, u);
          p.lHip = 0.56; p.lKnee = -1.60; p.rHip = 0.38; p.rKnee = -1.58;
        }
      }
    };

    // Render Helpers
    const drawMiniGoldBowl = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#ffe600';
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(10, -3);
      ctx.lineTo(6, 3.5);
      ctx.lineTo(-6, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    // Main Tick Loop
    const loop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      const time = now / 1000;

      s.stateTimer += dt;
      s.sloganTimer += dt;

      // Slogan rotation every 4.5s with glitch
      if (s.sloganTimer >= 4.5) {
        s.sloganTimer = 0;
        s.sloganIndex = (s.sloganIndex + 1) % SLOGANS.length;
        s.sloganGlitch = 1.0;
        const signX = getSignLocalX();
        spawnParticles(signX, -44, '#00f3ff', 10);
      }
      if (s.sloganGlitch > 0) {
        s.sloganGlitch = Math.max(0, s.sloganGlitch - dt * 3.2);
      }

      if (s.state === 'BEGGING') {
        s.speech.idleCycleTimer += dt;
        if (s.speech.idleCycleTimer > 5.8) {
          s.speech.idleCycleTimer = 0;
          const quotes = language === 'zh' ? BEGGING_QUOTES_ZH : BEGGING_QUOTES_EN;
          say(quotes[Math.floor(Math.random() * quotes.length)], 4.2);
        }
      } else if (s.state === 'PUT_DOWN_AND_STAND') {
        if (s.stateTimer >= 1.05) {
          s.state = 'PERFORMING';
          s.stateTimer = 0;
          updateHUD();
        }
      } else if (s.state === 'PERFORMING') {
        s.danmakuTimer += dt;
        if (s.danmakuTimer > 2.3) {
          s.danmakuTimer = 0;
          spawnDanmaku(s.currentTalent);
        }
        if (s.stateTimer >= 10.0) {
          s.state = 'PACK_UP_AND_KNEEL';
          s.stateTimer = 0;
          say(language === 'zh' ? '演出完毕！感谢老板捧场，小的继续蹲守下一单~' : 'Show complete! Thank you boss, ready for next!', 3.5);
          updateHUD();
        }
      } else if (s.state === 'PACK_UP_AND_KNEEL') {
        if (s.stateTimer >= 1.15) {
          s.state = 'BEGGING';
          s.stateTimer = 0;
          updateHUD();
        }
      }

      computeTargetPose(time);
      const smoothSpeed = (s.state === 'PERFORMING' && s.currentTalent === 'popping') ? 24 : 14;
      const factor = 1 - Math.exp(-smoothSpeed * dt);
      for (const key in s.currentPose) {
        (s.currentPose as any)[key] = lerp((s.currentPose as any)[key], (s.targetPose as any)[key], factor);
      }

      s.joints = solveSkeleton(s.currentPose);

      // Motion Afterimages
      if (s.state === 'PERFORMING') {
        s.afterimageTimer += dt;
        if (s.afterimageTimer > 0.045) {
          s.afterimageTimer = 0;
          s.poseHistory.push({
            joints: JSON.parse(JSON.stringify(s.joints)),
            alpha: 0.42
          });
          if (s.poseHistory.length > 5) s.poseHistory.shift();
        }
      }
      for (let i = s.poseHistory.length - 1; i >= 0; i--) {
        s.poseHistory[i].alpha -= dt * 1.5;
        if (s.poseHistory[i].alpha <= 0) s.poseHistory.splice(i, 1);
      }

      // Bowl position
      s.bowl.glowPulse += dt * 4;
      if (s.bowl.hitFlash > 0) s.bowl.hitFlash = Math.max(0, s.bowl.hitFlash - dt * 3);

      if (s.bowl.inHands) {
        const targetX = (s.joints.lHand.x + s.joints.rHand.x) * 0.5 + 6;
        const targetY = (s.joints.lHand.y + s.joints.rHand.y) * 0.5 + 2;
        s.bowl.x = lerp(s.bowl.x, targetX, 0.45);
        s.bowl.y = lerp(s.bowl.y, targetY, 0.45);
        s.bowl.angle = Math.sin(time * 9.5) * 0.12;
      } else {
        s.bowl.x = lerp(s.bowl.x, s.bowl.homeOffsetX, 0.25);
        s.bowl.y = lerp(s.bowl.y, -9, 0.25);
        s.bowl.angle = lerp(s.bowl.angle, 0, 0.25);
      }

      // Juggling Orbs update
      if (s.state === 'PERFORMING' && s.currentTalent === 'balls') {
        let stgIdx = 0;
        if (s.stateTimer >= 7.8) stgIdx = 3;
        else if (s.stateTimer >= 5.0) stgIdx = 2;
        else if (s.stateTimer >= 2.5) stgIdx = 1;
        const activeCount = stgIdx === 0 ? 3 : 5;

        s.juggleOrbs.forEach((orb, idx) => {
          if (idx >= activeCount) {
            orb.trail = [];
            return;
          }
          if (stgIdx < 3) {
            const cycle = (time * (stgIdx === 0 ? 1.5 : 2.1) + idx / activeCount) % 1.0;
            const even = Math.floor(time * 1.8 + idx) % 2 === 0;
            const sPt = even ? s.joints.lHand : s.joints.rHand;
            const ePt = even ? s.joints.rHand : s.joints.lHand;
            const wideArc = stgIdx === 2 ? 32 : 15;
            orb.x = lerp(sPt.x, ePt.x, cycle) + Math.sin(cycle * Math.PI) * (even ? -wideArc : wideArc);
            orb.y = lerp(sPt.y, ePt.y, cycle) - 4 * cycle * (1 - cycle) * (stgIdx === 0 ? 95 : 138);
          } else {
            const ang = time * 5.5 + (idx / 5) * Math.PI * 2;
            orb.x = s.joints.pelvis.x + Math.cos(ang) * 68;
            orb.y = s.joints.shoulder.y + Math.sin(ang) * 48;
          }
          orb.trail.push({ x: orb.x, y: orb.y });
          if (orb.trail.length > 7) orb.trail.shift();
        });
      }

      // Flying coins
      for (let i = s.flyingCoins.length - 1; i >= 0; i--) {
        const c = s.flyingCoins[i];
        c.progress += dt / c.duration;
        c.rotation += dt * 18;
        c.targetX = s.bowl.x;
        c.targetY = s.bowl.y;
        if (c.progress >= 1) {
          onCoinLanded();
          s.flyingCoins.splice(i, 1);
        } else {
          const u = c.progress;
          c.x = lerp(c.startX, c.targetX, u);
          c.y = lerp(c.startY, c.targetY, u) - 4 * u * (1 - u) * c.arcHeight;
        }
      }

      // Particles & Texts
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 280 * dt;
        pt.life -= dt;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y -= 32 * dt;
        ft.life -= dt;
        if (ft.life <= 0) s.floatingTexts.splice(i, 1);
      }

      for (let i = s.danmakus.length - 1; i >= 0; i--) {
        const dm = s.danmakus[i];
        dm.x -= dm.speed * dt;
        if (dm.x < -400) s.danmakus.splice(i, 1);
      }

      s.rainDrops.forEach(r => {
        r.y += r.speed * dt;
        r.x -= r.speed * 0.1 * dt;
        if (r.y > s.viewHeight) {
          r.y = -20;
          r.x = Math.random() * (s.viewWidth + 100);
        }
      });

      if (s.speech.timer > 0) {
        s.speech.timer -= dt;
        if (s.speech.timer < 0.5) {
          s.speech.alpha = clamp(s.speech.timer / 0.5, 0, 1);
        }
      } else {
        s.speech.alpha = 0;
      }

      // Render on Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          ctx.save();
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          // Screen-space Background
          const skyGrad = ctx.createLinearGradient(0, 0, 0, s.groundY);
          skyGrad.addColorStop(0, '#04040c');
          skyGrad.addColorStop(0.55, '#0b0922');
          skyGrad.addColorStop(1, '#1c0c32');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, s.viewWidth, s.viewHeight);

          // Synthwave Sun
          const sunX = s.viewWidth * 0.22;
          const sunY = s.groundY * 0.34;
          const sunGrad = ctx.createLinearGradient(sunX, sunY - 45, sunX, sunY + 45);
          sunGrad.addColorStop(0, '#ff007f');
          sunGrad.addColorStop(1, '#ffe600');
          ctx.fillStyle = sunGrad;
          ctx.beginPath();
          ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
          ctx.fill();

          // Buildings
          s.buildings.forEach(b => {
            const bx = b.normX * s.viewWidth;
            const by = s.groundY - b.h;
            ctx.fillStyle = b.layer === 0 ? '#070716' : (b.layer === 1 ? '#0c0b20' : '#120f2b');
            ctx.fillRect(bx, by, b.w, b.h);
            b.windows.forEach((w: any) => {
              ctx.fillStyle = w.color;
              ctx.globalAlpha = 0.28 + 0.28 * Math.sin(time * 1.5 + w.blinkPhase);
              ctx.fillRect(bx + w.c * 14 - 6, by + w.r * 20 - 8, 5, 8);
            });
            ctx.globalAlpha = 1;
          });

          // Cyber Floor
          const floorH = s.viewHeight - s.groundY;
          const floorGrad = ctx.createLinearGradient(0, s.groundY, 0, s.viewHeight);
          floorGrad.addColorStop(0, '#140928');
          floorGrad.addColorStop(0.3, '#090718');
          floorGrad.addColorStop(1, '#04040a');
          ctx.fillStyle = floorGrad;
          ctx.fillRect(0, s.groundY, s.viewWidth, floorH);

          ctx.strokeStyle = '#00f3ff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 14;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, s.groundY);
          ctx.lineTo(s.viewWidth, s.groundY);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(0, 243, 255, 0.18)';
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1;
          for (let i = -12; i <= 12; i++) {
            ctx.beginPath();
            ctx.moveTo(s.stageCenterX + i * 42, s.groundY);
            ctx.lineTo(s.stageCenterX + i * 210, s.viewHeight);
            ctx.stroke();
          }
          for (let j = 1; j <= 5; j++) {
            const y = s.groundY + Math.pow(j / 5, 1.7) * floorH;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(s.viewWidth, y);
            ctx.stroke();
          }

          // Rain
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
          ctx.lineWidth = 1.2;
          s.rainDrops.forEach(r => {
            ctx.globalAlpha = r.alpha;
            ctx.beginPath();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x - 2, r.y + r.len);
            ctx.stroke();
          });
          ctx.globalAlpha = 1;

          // Danmaku
          ctx.font = 'bold 12px sans-serif';
          s.danmakus.forEach(dm => {
            ctx.fillStyle = dm.color;
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.fillText(dm.text, dm.x, dm.y);
          });
          ctx.shadowBlur = 0;

          // Scaled Stage Layer
          ctx.save();
          ctx.translate(s.stageCenterX, s.groundY);
          ctx.scale(s.cameraScale, s.cameraScale);

          // Mat
          const spotGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 125);
          spotGrad.addColorStop(0, 'rgba(0, 243, 255, 0.25)');
          spotGrad.addColorStop(0.55, 'rgba(255, 0, 127, 0.09)');
          spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.ellipse((s.currentPose.offsetX || 0) * 0.4, 2, 118, 20, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.strokeStyle = '#ff007f';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.ellipse(-10, 3, 46, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Holographic Signboard
          const signX = getSignLocalX();
          const signY = -44;
          const slogan = SLOGANS[s.sloganIndex];
          const glitchShift = s.sloganGlitch > 0 ? (Math.random() - 0.5) * 8 * s.sloganGlitch : 0;

          ctx.save();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(signX, 0);
          ctx.lineTo(signX, signY + 18);
          ctx.stroke();

          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.ellipse(signX, 0, 16, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          const floatY = signY + Math.sin(time * 3) * 2;
          const boardW = 104;
          const boardH = 46;

          ctx.translate(glitchShift, 0);

          ctx.fillStyle = 'rgba(8, 14, 34, 0.88)';
          ctx.strokeStyle = s.sloganGlitch > 0.2 ? '#ff007f' : '#00f3ff';
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 10 + s.sloganGlitch * 10;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(signX - boardW / 2, floatY - boardH / 2, boardW, boardH, 6);
          else ctx.rect(signX - boardW / 2, floatY - boardH / 2, boardW, boardH);
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0;
          const qrX = signX - boardW / 2 + 6;
          const qrY = floatY - 15;
          ctx.strokeStyle = '#ffe600';
          ctx.lineWidth = 1;
          ctx.strokeRect(qrX, qrY, 22, 22);
          ctx.fillStyle = '#ffe600';
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              if ((r + c + Math.floor(time * 2)) % 2 === 0) {
                ctx.fillRect(qrX + 3 + c * 5.5, qrY + 3 + r * 5.5, 4, 4);
              }
            }
          }

          ctx.textAlign = 'left';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 6.8px sans-serif';
          ctx.fillText(language === 'zh' ? slogan.titleZh : slogan.titleEn, qrX + 26, floatY - 5);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '5.8px sans-serif';
          const subText = language === 'zh' ? slogan.subZh : slogan.subEn;
          ctx.fillText(subText.slice(0, 12), qrX + 26, floatY + 5);
          ctx.fillText(subText.slice(12), qrX + 26, floatY + 14);
          ctx.restore();

          // Afterimages
          s.poseHistory.forEach(hist => {
            const j = hist.joints;
            ctx.save();
            ctx.globalAlpha = hist.alpha * 0.5;
            ctx.strokeStyle = '#ff007f';
            ctx.lineWidth = 5.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(j.pelvis.x, j.pelvis.y); ctx.lineTo(j.neck.x, j.neck.y);
            ctx.moveTo(j.shoulder.x, j.shoulder.y); ctx.lineTo(j.lHand.x, j.lHand.y);
            ctx.moveTo(j.shoulder.x, j.shoulder.y); ctx.lineTo(j.rHand.x, j.rHand.y);
            ctx.moveTo(j.pelvis.x, j.pelvis.y); ctx.lineTo(j.lFoot.x, j.lFoot.y);
            ctx.moveTo(j.pelvis.x, j.pelvis.y); ctx.lineTo(j.rFoot.x, j.rFoot.y);
            ctx.stroke();
            ctx.restore();
          });

          // Main Stickman
          if (s.joints) {
            const j = s.joints;
            ctx.save();
            ctx.strokeStyle = '#00f3ff';
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 14;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const drawBone = (p1: any, p2: any, width: number) => {
              ctx.lineWidth = width;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            };

            drawBone(j.pelvis, j.lKnee, 6.8);
            drawBone(j.lKnee, j.lFoot, 6.2);
            drawBone(j.shoulder, j.lElbow, 5.8);
            drawBone(j.lElbow, j.lHand, 5.2);
            drawBone(j.pelvis, j.neck, 8.5);
            drawBone(j.pelvis, j.rKnee, 6.8);
            drawBone(j.rKnee, j.rFoot, 6.2);
            drawBone(j.shoulder, j.rElbow, 5.8);
            drawBone(j.rElbow, j.rHand, 5.2);

            ctx.fillStyle = '#ffffff';
            [j.pelvis, j.shoulder, j.lElbow, j.rElbow, j.lKnee, j.rKnee, j.lHand, j.rHand].forEach(pt => {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 2.8, 0, Math.PI * 2);
              ctx.fill();
            });

            ctx.fillStyle = '#090d1e';
            ctx.lineWidth = 4.6;
            ctx.beginPath();
            ctx.arc(j.head.x, j.head.y, 19, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Head face
            const lookOffset = (s.currentPose.faceLookX || 0) * 5.5;
            ctx.save();
            ctx.translate(j.head.x + lookOffset, j.head.y);
            ctx.rotate((s.currentPose.headAngle || 0) * 0.5 + (s.currentPose.bodySpin || 0));

            ctx.fillStyle = 'rgba(0, 243, 255, 0.16)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(-14, -7.5, 28, 15, 4);
            else ctx.rect(-14, -7.5, 28, 15);
            ctx.fill();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 9.5px monospace';
            ctx.fillStyle = '#00f3ff';
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 6;

            let faceStr = 'T_T';
            if (s.state === 'BEGGING') {
              const r = Math.sin(time * 2.2);
              faceStr = r > 0.65 ? 'OwO' : (r < -0.5 ? 'QwQ' : 'T_T');
            } else if (s.state === 'PUT_DOWN_AND_STAND') {
              faceStr = '￥_￥';
              ctx.fillStyle = '#ffe600';
            } else if (s.state === 'PERFORMING') {
              const tInfo = ALL_TALENTS.find(t => t.id === s.currentTalent);
              let stgIdx = 0;
              if (s.stateTimer >= 7.8) stgIdx = 3;
              else if (s.stateTimer >= 5.0) stgIdx = 2;
              else if (s.stateTimer >= 2.5) stgIdx = 1;
              faceStr = (tInfo && tInfo.face[stgIdx]) ? tInfo.face[stgIdx] : '⌐■_■';
              if (s.currentTalent === 'guitar' || s.currentTalent === 'wotagei') ctx.fillStyle = '#ffe600';
              if (s.currentTalent === 'popping') ctx.fillStyle = '#00ff66';
            } else {
              faceStr = '^▽^';
            }
            ctx.fillText(faceStr, 0, 0);
            ctx.restore();
            ctx.restore();
          }

          // Talent Props
          if (s.state === 'PERFORMING' && s.joints) {
            const j = s.joints;
            let stgIdx = 0;
            if (s.stateTimer >= 7.8) stgIdx = 3;
            else if (s.stateTimer >= 5.0) stgIdx = 2;
            else if (s.stateTimer >= 2.5) stgIdx = 1;

            if (s.currentTalent === 'erhu') {
              ctx.save();
              ctx.strokeStyle = '#00f3ff';
              ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
              ctx.shadowColor = '#00f3ff';
              ctx.shadowBlur = 10;
              ctx.lineWidth = 2;
              ctx.beginPath();
              if (ctx.roundRect) ctx.roundRect(j.pelvis.x - 16, j.pelvis.y + 4, 32, 7, 3);
              else ctx.rect(j.pelvis.x - 16, j.pelvis.y + 4, 32, 7);
              ctx.fill();
              ctx.stroke();

              const baseX = j.lKnee.x - 4;
              const baseY = j.lKnee.y - 4;
              ctx.strokeStyle = '#ff007f';
              ctx.fillStyle = '#1e1035';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(baseX, baseY, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              ctx.strokeStyle = '#00f3ff';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(baseX, baseY + 6);
              ctx.lineTo(baseX + 6, baseY - 68);
              ctx.stroke();

              ctx.strokeStyle = '#ffe600';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(baseX - 18, baseY - 4);
              ctx.lineTo(j.rHand.x + 14, j.rHand.y);
              ctx.stroke();

              if (stgIdx >= 2) {
                const r = ((time * 3) % 1) * 85;
                ctx.strokeStyle = `rgba(0, 243, 255, ${1 - r / 85})`;
                ctx.beginPath();
                ctx.arc(j.head.x, j.head.y, r, 0, Math.PI * 2);
                ctx.stroke();
              }
              ctx.restore();
            } else if (s.currentTalent === 'guitar') {
              ctx.save();
              const bodyX = stgIdx === 3 ? j.head.x + 10 : (j.pelvis.x + j.shoulder.x) * 0.5 + 4;
              const bodyY = stgIdx === 3 ? j.head.y - 28 : (j.pelvis.y + j.shoulder.y) * 0.5 + 6;
              const angle = stgIdx === 3 ? -0.55 : Math.atan2(j.lHand.y - bodyY, j.lHand.x - bodyX);

              ctx.translate(bodyX, bodyY);
              ctx.rotate(angle);

              ctx.fillStyle = 'rgba(24, 10, 42, 0.94)';
              ctx.strokeStyle = '#ff007f';
              ctx.shadowColor = '#ff007f';
              ctx.shadowBlur = 16;
              ctx.lineWidth = 2.4;
              ctx.beginPath();
              ctx.moveTo(10, 0);
              ctx.lineTo(-24, -20);
              ctx.lineTo(-13, 0);
              ctx.lineTo(-24, 20);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              ctx.strokeStyle = '#00f3ff';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(6, 0);
              ctx.lineTo(54, 0);
              ctx.stroke();
              ctx.restore();

              if (stgIdx === 2) {
                ctx.save();
                ctx.strokeStyle = '#ffe600';
                ctx.shadowColor = '#ffe600';
                ctx.shadowBlur = 16;
                ctx.lineWidth = 2.5;
                [-72, 72].forEach(lx => {
                  ctx.beginPath();
                  ctx.moveTo(lx, 0);
                  for (let y = 0; y > -190; y -= 22) {
                    ctx.lineTo(lx + (Math.random() - 0.5) * 18, y);
                  }
                  ctx.stroke();
                });
                ctx.restore();
              }
            } else if (s.currentTalent === 'sax') {
              ctx.save();
              const mx = j.head.x + 12;
              const my = j.head.y + 6;
              ctx.strokeStyle = '#ffe600';
              ctx.fillStyle = '#ff007f';
              ctx.shadowColor = '#ffe600';
              ctx.shadowBlur = 14;
              ctx.lineWidth = 4.5;
              ctx.beginPath();
              ctx.moveTo(mx, my);
              ctx.lineTo(mx + 22, my + 32);
              ctx.arc(mx + 28, my + 32, 7, Math.PI, 0, true);
              ctx.lineTo(mx + 38, my + 16);
              ctx.stroke();

              ctx.beginPath();
              ctx.ellipse(mx + 39, my + 14, 7, 4, -0.4, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              if (stgIdx >= 1 && Math.random() < 0.22) {
                const sym = stgIdx === 2 ? '♥' : '♪';
                const col = stgIdx === 2 ? '#ff2a85' : '#00f3ff';
                spawnFloatingText(mx + 42 + (Math.random() - 0.5) * 20, my - 10, sym, col);
              }
              ctx.restore();
            } else if (s.currentTalent === 'balls') {
              ctx.save();
              const activeCount = stgIdx === 0 ? 3 : 5;
              if (stgIdx === 3) {
                ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                s.juggleOrbs.forEach((orb: any, idx: number) => {
                  if (idx === 0) ctx.moveTo(orb.x, orb.y);
                  else ctx.lineTo(orb.x, orb.y);
                });
                ctx.closePath();
                ctx.stroke();
              }
              for (let idx = 0; idx < activeCount; idx++) {
                const orb = s.juggleOrbs[idx];
                orb.trail.forEach((pt: any, ti: number) => {
                  const r = (ti + 1) / orb.trail.length;
                  ctx.fillStyle = orb.color;
                  ctx.globalAlpha = r * 0.35;
                  ctx.beginPath();
                  ctx.arc(pt.x, pt.y, 9 * r, 0, Math.PI * 2);
                  ctx.fill();
                });
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#090d1e';
                ctx.strokeStyle = orb.color;
                ctx.shadowColor = orb.color;
                ctx.shadowBlur = 12;
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, 9.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 6.5px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(orb.label, orb.x, orb.y);
              }
              ctx.restore();
            } else if (s.currentTalent === 'firestaff') {
              ctx.save();
              let staffX = (j.lHand.x + j.rHand.x) * 0.5;
              let staffY = (j.lHand.y + j.rHand.y) * 0.5;
              let staffAngle = time * 18;

              if (stgIdx === 1) {
                const tossU = clamp((s.stateTimer - 2.5) / 2.5, 0, 1);
                const arc = Math.sin(tossU * Math.PI);
                staffX = j.pelvis.x;
                staffY = lerp(j.rHand.y, -215, arc);
                staffAngle = time * 26;
              } else if (stgIdx === 3) {
                staffAngle = time * 32;
              }

              ctx.translate(staffX, staffY);
              ctx.rotate(staffAngle);

              const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 68);
              grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
              grad.addColorStop(0.7, 'rgba(255, 0, 127, 0.22)');
              grad.addColorStop(1, 'rgba(0, 243, 255, 0.45)');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(0, 0, 68, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.moveTo(-42, 0);
              ctx.lineTo(42, 0);
              ctx.stroke();

              ctx.strokeStyle = '#ff007f';
              ctx.shadowColor = '#ff007f';
              ctx.shadowBlur = 16;
              ctx.lineWidth = 6;
              ctx.beginPath();
              ctx.moveTo(-68, 0);
              ctx.lineTo(-36, 0);
              ctx.stroke();

              ctx.strokeStyle = '#00f3ff';
              ctx.shadowColor = '#00f3ff';
              ctx.beginPath();
              ctx.moveTo(36, 0);
              ctx.lineTo(68, 0);
              ctx.stroke();
              ctx.restore();
            } else if (s.currentTalent === 'unicycle') {
              ctx.save();
              const wheelX = j.pelvis.x;
              const wheelY = -16;

              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.moveTo(wheelX, wheelY);
              ctx.lineTo(j.pelvis.x, j.pelvis.y + 4);
              ctx.stroke();

              ctx.fillStyle = '#090d1e';
              ctx.strokeStyle = '#00f3ff';
              ctx.shadowColor = '#00f3ff';
              ctx.shadowBlur = 14;
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(wheelX, wheelY, 15, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              ctx.strokeStyle = '#ff007f';
              ctx.lineWidth = 1.8;
              for (let st = 0; st < 4; st++) {
                const a = time * 8 + (st * Math.PI) / 2;
                ctx.beginPath();
                ctx.moveTo(wheelX - Math.cos(a) * 13, wheelY - Math.sin(a) * 13);
                ctx.lineTo(wheelX + Math.cos(a) * 13, wheelY + Math.sin(a) * 13);
                ctx.stroke();
              }

              let bowlCount = 0;
              if (stgIdx === 1 || stgIdx === 2) {
                bowlCount = Math.min(5, Math.floor((s.stateTimer - 2.5) * 1.1) + 1);
                const kickU = ((s.stateTimer - 2.5) * 1.45) % 1.0;
                const flyX = lerp(j.rFoot.x, j.head.x, kickU) + Math.sin(kickU * Math.PI) * 24;
                const flyY = lerp(j.rFoot.y, j.head.y - 22 - bowlCount * 6, kickU) - Math.sin(kickU * Math.PI) * 45;
                drawMiniGoldBowl(ctx, flyX, flyY);
              } else if (stgIdx === 3) {
                bowlCount = 5;
              }

              for (let b = 0; b < bowlCount; b++) {
                const bx = j.head.x + Math.sin(time * 8 + b) * 1.2;
                const by = j.head.y - 22 - b * 6.5;
                drawMiniGoldBowl(ctx, bx, by);
              }
              ctx.restore();
            } else if (s.currentTalent === 'popping') {
              ctx.save();
              if (stgIdx === 2) {
                ctx.strokeStyle = '#ff003c';
                ctx.shadowColor = '#ff003c';
                ctx.shadowBlur = 14;
                ctx.lineWidth = 2;
                for (let l = 0; l < 3; l++) {
                  const ly = -98 - l * 22 + Math.sin(time * 9 + l) * 8;
                  ctx.beginPath();
                  ctx.moveTo(-160, ly);
                  ctx.lineTo(160, ly);
                  ctx.stroke();
                }
              } else {
                ctx.strokeStyle = '#00ff66';
                ctx.shadowColor = '#00ff66';
                ctx.shadowBlur = 14;
                ctx.lineWidth = 2;
                [[j.lHand, j.lElbow], [j.rHand, j.rElbow]].forEach(([h, e]) => {
                  const dx = h.x - e.x;
                  const dy = h.y - e.y;
                  const len = Math.hypot(dx, dy) || 1;
                  ctx.beginPath();
                  ctx.moveTo(h.x, h.y);
                  ctx.lineTo(h.x + (dx / len) * 260, h.y + (dy / len) * 260);
                  ctx.stroke();
                });
              }
              ctx.restore();
            } else if (s.currentTalent === 'wotagei') {
              ctx.save();
              const drawGlowstick = (hand: any, elbow: any, color: string) => {
                const dx = hand.x - elbow.x;
                const dy = hand.y - elbow.y;
                const len = Math.hypot(dx, dy) || 1;
                const ux = dx / len;
                const uy = dy / len;
                ctx.strokeStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 20;
                ctx.lineWidth = 6.5;
                ctx.beginPath();
                ctx.moveTo(hand.x - ux * 6, hand.y - uy * 6);
                ctx.lineTo(hand.x + ux * 36, hand.y + uy * 36);
                ctx.stroke();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.stroke();
              };

              drawGlowstick(j.lHand, j.lElbow, '#ff6600');
              drawGlowstick(j.rHand, j.rElbow, '#ff007f');
              ctx.restore();
            }
          }

          // Begging Bowl
          ctx.save();
          ctx.translate(s.bowl.x, s.bowl.y);
          ctx.rotate(s.bowl.angle);

          const beamAlpha = 0.24 + Math.sin(s.bowl.glowPulse) * 0.08 + s.bowl.hitFlash * 0.4;
          const beamGrad = ctx.createLinearGradient(0, 0, 0, -36);
          beamGrad.addColorStop(0, `rgba(0, 243, 255, ${beamAlpha})`);
          beamGrad.addColorStop(1, 'rgba(0, 243, 255, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(-13, -4);
          ctx.lineTo(-22, -36);
          ctx.lineTo(22, -36);
          ctx.lineTo(13, -4);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = s.bowl.hitFlash > 0.1 ? '#ffe600' : '#00f3ff';
          ctx.font = 'bold 7.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(language === 'zh' ? '⚡投币处' : '⚡COIN HERE', 0, -14 - Math.sin(time * 5) * 2);

          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = s.bowl.hitFlash > 0.1 ? '#ffe600' : '#00f3ff';
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 10 + s.bowl.hitFlash * 12;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-16, -4);
          ctx.lineTo(16, -4);
          ctx.lineTo(10, 8);
          ctx.lineTo(-10, 8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          if (coinsCollected > 0) {
            ctx.fillStyle = '#ffe600';
            ctx.beginPath();
            ctx.ellipse(0, -4, 11, 2.8, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // Flying Coins
          s.flyingCoins.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.scale(Math.cos(c.rotation), 1);
            ctx.fillStyle = '#ffe600';
            ctx.strokeStyle = '#ffffff';
            ctx.shadowColor = '#ffe600';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          });

          // Particles
          s.particles.forEach(pt => {
            ctx.save();
            ctx.globalAlpha = clamp(pt.life / pt.maxLife, 0, 1);
            ctx.fillStyle = pt.color;
            ctx.shadowColor = pt.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Floating Texts
          s.floatingTexts.forEach(ft => {
            ctx.save();
            ctx.globalAlpha = clamp(ft.life / ft.maxLife, 0, 1);
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = ft.color;
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 8;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
          });

          // Speech Bubble
          if (s.joints && s.speech.alpha > 0.01) {
            const headTopY = (s.state === 'PERFORMING' && s.currentTalent === 'unicycle')
              ? s.joints.head.y - 52
              : s.joints.head.y - 30;

            const text = s.speech.text;
            const padX = 9;
            ctx.font = 'bold 8.5px sans-serif';
            const textW = ctx.measureText(text).width;
            const boxW = textW + padX * 2;
            const boxH = 22;

            const maxLocalX = (s.viewWidth * 0.46) / s.cameraScale - boxW / 2;
            const clampedX = clamp(s.joints.head.x, -maxLocalX, maxLocalX);
            const clampedY = Math.max(-215, headTopY);

            ctx.save();
            ctx.globalAlpha = s.speech.alpha;
            ctx.fillStyle = 'rgba(10, 15, 35, 0.92)';
            ctx.strokeStyle = '#00f3ff';
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 1.2;

            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(clampedX - boxW / 2, clampedY - boxH, boxW, boxH, 6);
            else ctx.rect(clampedX - boxW / 2, clampedY - boxH, boxW, boxH);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(clampedX - 4, clampedY);
            ctx.lineTo(clampedX + 4, clampedY);
            ctx.lineTo(clampedX, clampedY + 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, clampedX, clampedY - boxH / 2);
            ctx.restore();
          }

          ctx.restore(); // end scaled stage
          ctx.restore(); // end dpr transform
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      ro.disconnect();
    };
  }, [getSignLocalX, language, onCoinLanded, say, spawnDanmaku, spawnFloatingText, spawnParticles, updateHUD, coinsCollected]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    tossCoin(sx, sy);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticsService.selection();
    const s = appRef.current;
    s.state = 'BEGGING';
    s.stateTimer = 0;
    s.comboCount = 0;
    updateHUD();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticsService.selection();
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Main Interactive Stage Chamber */}
      <div
        ref={containerRef}
        className="relative w-full h-[450px] sm:h-[480px] rounded-3xl overflow-hidden bg-[#05050f] border border-cyan-500/25 shadow-2xl flex items-center justify-center select-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none block"
          aria-label="Cyber Busking Stage Canvas"
        />

        {/* Scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] opacity-75" />

        {/* Top-Right Floating Minimal Audio & Reset Controls */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-cyan-500/30 backdrop-blur-md text-xs font-mono transition active:scale-95 shadow-md flex items-center space-x-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-cyan-500/30 backdrop-blur-md text-xs font-mono transition active:scale-95 shadow-md flex items-center space-x-1"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Breathing Tap Prompt */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center pointer-events-none z-20 font-mono">
          <div className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/25 flex items-center space-x-1.5 text-[11px] text-amber-300 shadow-md">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'zh' ? '总打赏' : 'Coins'}:</span>
            <span className="font-bold">{coinsCollected}</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/25 flex items-center space-x-1.5 text-[11px] text-cyan-200 animate-pulse shadow-md">
            <span>👇</span>
            <span>{language === 'zh' ? '点击屏幕任意处 · 投币开演' : 'Tap screen to toss coin & start'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
