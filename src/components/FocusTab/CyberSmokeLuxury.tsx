import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Flame } from 'lucide-react';
import { HapticsService } from '../../services/haptics';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * ============================================================================
 * CYBER SMOKING 3.0 - ZERO-TEXT ARTISTIC PACKS & 4 HIGH-CRAFT LIGHTERS
 * ============================================================================
 * Strict Compliance:
 * 1. ZERO text/letters/numbers/logos drawn on any cigarette pack, lid, foil, or cigarette.
 * 2. 5 Pre-baked Luxury Geometric Packs (Obsidian Art Deco, Crimson Seigaiha,
 *    Glacier Prism Crystal, Imperial Emerald Guilloché, Titanium Damascus Cyber).
 * 3. 4 Ultra-Refined Lighters (No Revolver): 1-Yuan Translucent Plastic,
 *    Luxury Guilloché "Cling" Dupont, Carbon Triple-Jet Torch, Vintage Brass Gear Trench.
 * 4. 2.5D Specular Sweep Pack Opening + 3D Foreshortened Cigarette Arc +
 *    Realistic Flame Suction Effect (吸火弯曲) & Dynamic Point-Light Illumination.
 * 5. Full Bilingual Support (ZH / EN) for all UI controls and breath guides.
 */

interface PackStyle {
  id: string;
  nameZh: string;
  nameEn: string;
  subtitleZh: string;
  subtitleEn: string;
  swatchBg: string;
  bevelDark: string;
  bevelEdge: string;
  trimPrimary: string;
  trimSecondary: string;
  foilStyle: 'gold' | 'champagne' | 'silver' | 'rosegold' | 'iridescent';
  paperStyle: 'obsidian-black' | 'warm-ivory' | 'crisp-white' | 'cream';
  filterStyle: 'obsidian-gold' | 'crimson-ivory' | 'glacier-frost' | 'emerald-rose' | 'cyber-dual';
  filterColor: string;
  bandColor: string;
  capsuleCount: number;
  smokeHue: number;
}

interface LighterStyle {
  id: string;
  nameZh: string;
  nameEn: string;
  shortZh: string;
  shortEn: string;
  flameType: 'butane' | 'royalTwin' | 'tripleJet' | 'kerosene';
  emberTint: string;
  lightColor: string;
  bodyTint?: string;
}

const PACK_STYLES: PackStyle[] = [
  {
    id: 'obsidianSunburst',
    nameZh: '曜石金芒',
    nameEn: 'Obsidian Art Deco',
    subtitleZh: '哑光黑曜石配18K拉丝金双框 · 放射太阳扇纹与多层切面钻芯',
    subtitleEn: 'Matte obsidian with 18K brushed gold frame and sunburst core',
    swatchBg: 'linear-gradient(135deg, #0b0d13 0%, #1e222d 55%, #d4af37 100%)',
    bevelDark: '#07080c',
    bevelEdge: '#262936',
    trimPrimary: '#e5c158',
    trimSecondary: '#9a7b1c',
    foilStyle: 'gold',
    paperStyle: 'obsidian-black',
    filterStyle: 'obsidian-gold',
    filterColor: '#12131a',
    bandColor: '#e5c158',
    capsuleCount: 0,
    smokeHue: 42
  },
  {
    id: 'crimsonSeigaiha',
    nameZh: '朱砂青海波',
    nameEn: 'Crimson Seigaiha',
    subtitleZh: '深朱砂红漆配香槟金镶边 · 青海波同心海浪鳞纹与麻叶星曼陀罗',
    subtitleEn: 'Cinnabar lacquer with champagne gold trim and sacred wave mandala',
    swatchBg: 'linear-gradient(135deg, #4c0509 0%, #8c141b 60%, #f6d365 100%)',
    bevelDark: '#3b0407',
    bevelEdge: '#6e0f15',
    trimPrimary: '#f6d365',
    trimSecondary: '#b45309',
    foilStyle: 'champagne',
    paperStyle: 'warm-ivory',
    filterStyle: 'crimson-ivory',
    filterColor: '#f5f0e6',
    bandColor: '#991b1b',
    capsuleCount: 0,
    smokeHue: 205
  },
  {
    id: 'glacierPrism',
    nameZh: '极光冰晶',
    nameEn: 'Glacier Prism Crystal',
    subtitleZh: '冰川青与深渊蓝渐变配亮银框 · 低多边形冰晶切面与六角冰核（含冰爆珠）',
    subtitleEn: 'Glacier teal and deep cyan with low-poly crystal shards (1 Capsule)',
    swatchBg: 'linear-gradient(135deg, #082f49 0%, #0284c7 55%, #67e8f9 100%)',
    bevelDark: '#041e30',
    bevelEdge: '#0369a1',
    trimPrimary: '#e0f2fe',
    trimSecondary: '#38bdf8',
    foilStyle: 'silver',
    paperStyle: 'crisp-white',
    filterStyle: 'glacier-frost',
    filterColor: '#0c273d',
    bandColor: '#7dd3fc',
    capsuleCount: 1,
    smokeHue: 186
  },
  {
    id: 'emeraldGuilloche',
    nameZh: '翡翠陀飞轮',
    nameEn: 'Imperial Emerald Guilloché',
    subtitleZh: '帝王翡翠绿配玫瑰金镶边 · 精密数学陀飞轮繁花曲线与人字纹内衬',
    subtitleEn: 'Imperial emerald with rose gold inlay and mathematical spirograph guilloché',
    swatchBg: 'linear-gradient(135deg, #022c22 0%, #047857 60%, #fda4af 100%)',
    bevelDark: '#011f18',
    bevelEdge: '#065f46',
    trimPrimary: '#fecdd3',
    trimSecondary: '#f43f5e',
    foilStyle: 'rosegold',
    paperStyle: 'cream',
    filterStyle: 'emerald-rose',
    filterColor: '#052e24',
    bandColor: '#fb7185',
    capsuleCount: 0,
    smokeHue: 162
  },
  {
    id: 'titaniumDamascus',
    nameZh: '钛金霓虹',
    nameEn: 'Titanium Damascus Cyber',
    subtitleZh: '阳极氧化暗钛配紫青幻彩边框 · 大马士革钢流纹与对称微电路核（含双爆珠）',
    subtitleEn: 'Anodized titanium with purple-cyan neon contours and dual energy capsules',
    swatchBg: 'linear-gradient(135deg, #1e1b4b 0%, #334155 50%, #e879f9 80%, #22d3ee 100%)',
    bevelDark: '#0f172a',
    bevelEdge: '#334155',
    trimPrimary: '#22d3ee',
    trimSecondary: '#e879f9',
    foilStyle: 'iridescent',
    paperStyle: 'crisp-white',
    filterStyle: 'cyber-dual',
    filterColor: '#111827',
    bandColor: '#22d3ee',
    capsuleCount: 2,
    smokeHue: 288
  }
];

const LIGHTER_STYLES: LighterStyle[] = [
  {
    id: 'plastic1Yuan',
    nameZh: '便利店 1元塑料机',
    nameEn: 'Convenience 1-Yuan Plastic Lighter',
    shortZh: '1元塑料机',
    shortEn: 'Plastic Lighter',
    flameType: 'butane',
    emberTint: '#ff9500',
    lightColor: '255, 165, 40',
    bodyTint: '#059669'
  },
  {
    id: 'royalDupont',
    nameZh: '皇家鎏金朗声机',
    nameEn: 'Royal Guilloché Cling Dupont',
    shortZh: '鎏金朗声机',
    shortEn: 'Dupont Cling',
    flameType: 'royalTwin',
    emberTint: '#fbbf24',
    lightColor: '255, 200, 75'
  },
  {
    id: 'tripleJet',
    nameZh: '三孔防风直冲机',
    nameEn: 'Carbon Triple-Jet Torch',
    shortZh: '三孔直冲机',
    shortEn: 'Triple Torch',
    flameType: 'tripleJet',
    emberTint: '#38bdf8',
    lightColor: '56, 189, 248'
  },
  {
    id: 'steampunkBrass',
    nameZh: '古董黄铜煤油机',
    nameEn: 'Vintage Brass Gear Trench',
    shortZh: '黄铜煤油机',
    shortEn: 'Brass Trench',
    flameType: 'kerosene',
    emberTint: '#f97316',
    lightColor: '255, 140, 30'
  }
];

// Helper: Offscreen Texture & Pack Artwork Pre-Baking Engine
class TextureCacheEngine {
  smokePuffs: Record<number, HTMLCanvasElement> = {};
  packBodies: Record<string, HTMLCanvasElement> = {};
  packLids: Record<string, HTMLCanvasElement> = {};
  foils: Record<string, HTMLCanvasElement> = {};
  guillocheGold: HTMLCanvasElement | null = null;
  forgedCarbon: HTMLCanvasElement | null = null;
  initialized = false;

  createCanvas(w: number, h: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  init() {
    if (this.initialized) return;
    this.bakeGuillocheGold();
    this.bakeForgedCarbon();
    this.bakeFoils();

    PACK_STYLES.forEach(style => {
      this.packBodies[style.id] = this.bakePackBody(style);
      this.packLids[style.id] = this.bakePackLid(style);
    });

    const hues = [32, 42, 162, 170, 186, 195, 205, 275, 288];
    hues.forEach(h => {
      this.smokePuffs[h] = this.bakeSmokeSprite(h);
    });
    this.initialized = true;
  }

  bakeSmokeSprite(hue: number) {
    const size = 128;
    const c = this.createCanvas(size, size);
    const g = c.getContext('2d');
    if (!g) return c;
    const r = size / 2;

    const lobes = [
      { x: r, y: r, rad: r * 0.92, a: 0.40 },
      { x: r * 0.76, y: r * 0.84, rad: r * 0.65, a: 0.28 },
      { x: r * 1.24, y: r * 0.88, rad: r * 0.62, a: 0.26 },
      { x: r * 0.94, y: r * 1.18, rad: r * 0.60, a: 0.24 }
    ];

    lobes.forEach(l => {
      const grad = g.createRadialGradient(l.x, l.y, l.rad * 0.08, l.x, l.y, l.rad);
      grad.addColorStop(0, `hsla(${hue}, 58%, 88%, ${l.a})`);
      grad.addColorStop(0.45, `hsla(${hue}, 48%, 74%, ${l.a * 0.55})`);
      grad.addColorStop(1, `hsla(${hue}, 38%, 58%, 0)`);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(l.x, l.y, l.rad, 0, Math.PI * 2);
      g.fill();
    });
    return c;
  }

  bakeGuillocheGold() {
    const c = this.createCanvas(16, 16);
    const g = c.getContext('2d');
    if (!g) return;
    g.fillStyle = '#c8963e';
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = 'rgba(254, 249, 195, 0.55)';
    g.beginPath();
    g.moveTo(8, 0); g.lineTo(16, 8); g.lineTo(8, 8); g.closePath();
    g.fill();
    g.fillStyle = 'rgba(82, 45, 8, 0.5)';
    g.beginPath();
    g.moveTo(8, 16); g.lineTo(16, 8); g.lineTo(8, 8); g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(255, 250, 220, 0.65)';
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(8, 0); g.lineTo(16, 8); g.lineTo(8, 16); g.lineTo(0, 8); g.closePath();
    g.stroke();
    this.guillocheGold = c;
  }

  bakeForgedCarbon() {
    const c = this.createCanvas(24, 24);
    const g = c.getContext('2d');
    if (!g) return;
    g.fillStyle = '#11151f';
    g.fillRect(0, 0, 24, 24);
    const flakes = [
      [2, 2, 9, 5], [13, 4, 8, 6], [5, 12, 10, 5], [15, 15, 7, 6]
    ];
    flakes.forEach((f, idx) => {
      g.fillStyle = idx % 2 === 0 ? '#1e2638' : '#283248';
      g.fillRect(f[0], f[1], f[2], f[3]);
    });
    g.strokeStyle = 'rgba(255,255,255,0.06)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(24, 24);
    g.stroke();
    this.forgedCarbon = c;
  }

  bakeFoils() {
    const palettes: Record<string, string[]> = {
      gold: ['#926f1b', '#fef08a', '#d4af37', '#785810'],
      champagne: ['#9a6b32', '#fde68a', '#eab308', '#713f12'],
      silver: ['#64748b', '#f8fafc', '#cbd5e1', '#475569'],
      rosegold: ['#881337', '#fecdd3', '#fb7185', '#4c0519'],
      iridescent: ['#0e7490', '#67e8f9', '#e879f9', '#4c1d95']
    };
    Object.keys(palettes).forEach(key => {
      const cols = palettes[key];
      const c = this.createCanvas(128, 72);
      const g = c.getContext('2d');
      if (!g) return;
      const grad = g.createLinearGradient(0, 0, 128, 72);
      grad.addColorStop(0, cols[0]);
      grad.addColorStop(0.38, cols[1]);
      grad.addColorStop(0.68, cols[2]);
      grad.addColorStop(1, cols[3]);
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 72);

      g.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      g.lineWidth = 0.8;
      for (let x = -72; x < 128; x += 6) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + 72, 72);
        g.moveTo(x + 72, 0);
        g.lineTo(x, 72);
        g.stroke();
      }
      this.foils[key] = c;
    });
  }

  bakePackBody(style: PackStyle): HTMLCanvasElement {
    const w = 144;
    const h = 170;
    const scale = 2;
    const c = this.createCanvas(w * scale, h * scale);
    const g = c.getContext('2d');
    if (!g) return c;
    g.scale(scale, scale);

    const cx = w / 2;
    const cy = h / 2 + 4;

    if (style.id === 'obsidianSunburst') {
      const bg = g.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#161922');
      bg.addColorStop(0.5, '#0b0d13');
      bg.addColorStop(1, '#050609');
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);

      g.save();
      g.translate(cx, cy);
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        g.strokeStyle = i % 2 === 0 ? 'rgba(229, 193, 88, 0.34)' : 'rgba(229, 193, 88, 0.12)';
        g.lineWidth = i % 2 === 0 ? 1.4 : 0.7;
        g.beginPath();
        g.moveTo(Math.cos(angle) * 14, Math.sin(angle) * 14);
        g.lineTo(Math.cos(angle) * 120, Math.sin(angle) * 120);
        g.stroke();
      }

      const radii = [48, 36, 24];
      radii.forEach((r, idx) => {
        g.save();
        g.rotate(idx * (Math.PI / 4));
        g.strokeStyle = idx === 0 ? '#e5c158' : '#fef08a';
        g.lineWidth = idx === 0 ? 1.8 : 1.2;
        g.fillStyle = idx === 1 ? 'rgba(15, 17, 26, 0.85)' : 'rgba(229, 193, 88, 0.12)';
        g.beginPath();
        g.moveTo(0, -r);
        g.lineTo(r * 0.75, 0);
        g.lineTo(0, r);
        g.lineTo(-r * 0.75, 0);
        g.closePath();
        g.fill();
        g.stroke();
        g.restore();
      });

      const facets = [
        { pts: [[0, -18], [13, 0], [0, 0]], col: '#fef9c3' },
        { pts: [[13, 0], [0, 18], [0, 0]], col: '#d4af37' },
        { pts: [[0, 18], [-13, 0], [0, 0]], col: '#854d0e' },
        { pts: [[-13, 0], [0, -18], [0, 0]], col: '#eab308' }
      ];
      facets.forEach(f => {
        g.fillStyle = f.col;
        g.beginPath();
        g.moveTo(f.pts[0][0], f.pts[0][1]);
        g.lineTo(f.pts[1][0], f.pts[1][1]);
        g.lineTo(f.pts[2][0], f.pts[2][1]);
        g.closePath();
        g.fill();
      });
      g.restore();
      this.drawArtDecoFrame(g, w, h, '#e5c158', '#9a7b1c');
    } else if (style.id === 'crimsonSeigaiha') {
      const bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#8c141b');
      bg.addColorStop(0.55, '#630b11');
      bg.addColorStop(1, '#3b0407');
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);

      const waveR = 16;
      for (let row = 0; row < 14; row++) {
        const wy = 20 + row * 12;
        const offsetX = (row % 2) * waveR;
        for (let col = -1; col < 7; col++) {
          const wx = col * (waveR * 2) + offsetX;
          const sGrad = g.createRadialGradient(wx, wy, 2, wx, wy, waveR);
          sGrad.addColorStop(0, '#7f1118');
          sGrad.addColorStop(1, '#4c0509');
          g.fillStyle = sGrad;
          g.beginPath();
          g.arc(wx, wy, waveR, Math.PI, 0, false);
          g.fill();

          [waveR, waveR * 0.74, waveR * 0.48, waveR * 0.24].forEach((ar, ai) => {
            g.strokeStyle = ai === 0 ? 'rgba(246, 211, 101, 0.55)' : 'rgba(246, 211, 101, 0.25)';
            g.lineWidth = ai === 0 ? 1.2 : 0.75;
            g.beginPath();
            g.arc(wx, wy, ar, Math.PI, 0, false);
            g.stroke();
          });
        }
      }

      g.save();
      g.translate(cx, cy - 6);
      const mGrad = g.createRadialGradient(0, 0, 4, 0, 0, 38);
      mGrad.addColorStop(0, '#fde68a');
      mGrad.addColorStop(0.65, '#781016');
      mGrad.addColorStop(1, '#3b0407');
      g.fillStyle = mGrad;
      g.beginPath();
      g.arc(0, 0, 38, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#f6d365';
      g.lineWidth = 2;
      g.stroke();

      for (let k = 0; k < 12; k++) {
        g.save();
        g.rotate((k / 12) * Math.PI * 2);
        g.strokeStyle = '#fde68a';
        g.lineWidth = 1.1;
        g.fillStyle = k % 2 === 0 ? 'rgba(246, 211, 101, 0.35)' : 'rgba(140, 20, 27, 0.75)';
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(7, -16);
        g.lineTo(0, -33);
        g.lineTo(-7, -16);
        g.closePath();
        g.fill();
        g.stroke();
        g.restore();
      }
      g.fillStyle = '#fef08a';
      g.beginPath();
      g.arc(0, 0, 5.5, 0, Math.PI * 2);
      g.fill();
      g.restore();

      this.drawArtDecoFrame(g, w, h, '#f6d365', '#b45309');
    } else if (style.id === 'glacierPrism') {
      const bg = g.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#0c4a6e');
      bg.addColorStop(0.5, '#082f49');
      bg.addColorStop(1, '#041322');
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);

      const nodes = [
        [0, 0], [w * 0.5, 0], [w, 0],
        [0, h * 0.33], [w * 0.28, h * 0.26], [w * 0.72, h * 0.30], [w, h * 0.35],
        [0, h * 0.68], [w * 0.24, h * 0.66], [cx, cy], [w * 0.76, h * 0.64], [w, h * 0.70],
        [0, h], [w * 0.5, h], [w, h]
      ];
      const tris = [
        [0, 1, 4], [1, 2, 5], [1, 4, 5], [0, 3, 4], [2, 5, 6],
        [3, 4, 8], [4, 9, 8], [4, 5, 9], [5, 10, 9], [5, 6, 10],
        [3, 7, 8], [6, 10, 11], [7, 8, 12], [8, 12, 13], [8, 9, 13],
        [9, 10, 13], [10, 14, 13], [10, 11, 14]
      ];
      const shadeAlpha = [0.16, 0.08, 0.22, 0.12, 0.05, 0.18];
      tris.forEach((t, idx) => {
        const p0 = nodes[t[0]], p1 = nodes[t[1]], p2 = nodes[t[2]];
        g.fillStyle = `rgba(103, 232, 249, ${shadeAlpha[idx % shadeAlpha.length]})`;
        g.strokeStyle = 'rgba(186, 230, 253, 0.26)';
        g.lineWidth = 0.8;
        g.beginPath();
        g.moveTo(p0[0], p0[1]);
        g.lineTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        g.closePath();
        g.fill();
        g.stroke();
      });

      g.save();
      g.translate(cx, cy - 2);
      const hexGlow = g.createRadialGradient(0, 0, 3, 0, 0, 44);
      hexGlow.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
      hexGlow.addColorStop(0.45, 'rgba(34, 211, 238, 0.55)');
      hexGlow.addColorStop(1, 'rgba(8, 47, 73, 0)');
      g.fillStyle = hexGlow;
      g.beginPath();
      g.arc(0, 0, 44, 0, Math.PI * 2);
      g.fill();

      [34, 24, 14].forEach((hr, hi) => {
        g.save();
        g.rotate(hi * (Math.PI / 6));
        g.strokeStyle = hi === 0 ? '#e0f2fe' : '#67e8f9';
        g.lineWidth = hi === 0 ? 2 : 1.4;
        g.fillStyle = hi === 2 ? '#cffafe' : 'rgba(14, 116, 144, 0.35)';
        g.beginPath();
        for (let s = 0; s < 6; s++) {
          const a = (s / 6) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(a) * hr;
          const py = Math.sin(a) * hr;
          if (s === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.closePath();
        g.fill();
        g.stroke();
        g.restore();
      });
      g.restore();

      this.drawArtDecoFrame(g, w, h, '#e0f2fe', '#38bdf8');
    } else if (style.id === 'emeraldGuilloche') {
      const bg = g.createRadialGradient(cx, cy, 8, cx, cy, 110);
      bg.addColorStop(0, '#065f46');
      bg.addColorStop(0.6, '#043f2e');
      bg.addColorStop(1, '#021c15');
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);

      g.strokeStyle = 'rgba(52, 211, 153, 0.10)';
      g.lineWidth = 1;
      for (let y = -20; y < h + 20; y += 10) {
        g.beginPath();
        for (let x = 0; x <= w; x += 16) {
          const dy = (x / 16) % 2 === 0 ? 0 : 6;
          if (x === 0) g.moveTo(x, y + dy);
          else g.lineTo(x, y + dy);
        }
        g.stroke();
      }

      g.save();
      g.translate(cx, cy);
      const layers = [
        { R: 34, r: 21, d: 24, col: 'rgba(254, 205, 211, 0.52)', lw: 0.9 },
        { R: 26, r: 16, d: 18, col: 'rgba(110, 231, 183, 0.45)', lw: 0.85 },
        { R: 16, r: 10, d: 12, col: 'rgba(253, 164, 175, 0.75)', lw: 1.0 }
      ];
      layers.forEach(L => {
        g.strokeStyle = L.col;
        g.lineWidth = L.lw;
        g.beginPath();
        const steps = 360;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 14;
          const sx = (L.R - L.r) * Math.cos(t) + L.d * Math.cos(((L.R - L.r) / L.r) * t);
          const sy = (L.R - L.r) * Math.sin(t) - L.d * Math.sin(((L.R - L.r) / L.r) * t);
          if (i === 0) g.moveTo(sx, sy);
          else g.lineTo(sx, sy);
        }
        g.stroke();
      });

      const jewel = g.createRadialGradient(-2, -2, 1, 0, 0, 9);
      jewel.addColorStop(0, '#fff1f2');
      jewel.addColorStop(0.5, '#fb7185');
      jewel.addColorStop(1, '#881337');
      g.fillStyle = jewel;
      g.beginPath();
      g.arc(0, 0, 8.5, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#fecdd3';
      g.lineWidth = 1.4;
      g.stroke();
      g.restore();

      this.drawArtDecoFrame(g, w, h, '#fecdd3', '#fb7185');
    } else if (style.id === 'titaniumDamascus') {
      const bg = g.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#1e293b');
      bg.addColorStop(0.5, '#0f172a');
      bg.addColorStop(1, '#090d16');
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);

      for (let i = 0; i < 24; i++) {
        const baseY = i * 8 - 10;
        g.strokeStyle = i % 3 === 0
          ? 'rgba(34, 211, 238, 0.22)'
          : (i % 2 === 0 ? 'rgba(232, 121, 249, 0.18)' : 'rgba(148, 163, 184, 0.12)');
        g.lineWidth = i % 3 === 0 ? 1.3 : 0.8;
        g.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const wave = Math.sin(x * 0.065 + i * 0.45) * 9 + Math.cos(x * 0.03 - i * 0.3) * 6;
          if (x === 0) g.moveTo(x, baseY + wave);
          else g.lineTo(x, baseY + wave);
        }
        g.stroke();
      }

      g.save();
      g.translate(cx, cy);
      const traces = [
        [[-18, -12], [-36, -12], [-46, -26], [-46, -52]],
        [[18, -12], [36, -12], [46, -26], [46, -52]],
        [[-18, 12], [-36, 12], [-46, 26], [-46, 52]],
        [[18, 12], [36, 12], [46, 26], [46, 52]],
        [[0, -24], [0, -60]],
        [[0, 24], [0, 60]]
      ];
      traces.forEach((tr, idx) => {
        g.strokeStyle = idx % 2 === 0 ? '#22d3ee' : '#e879f9';
        g.lineWidth = 1.6;
        g.beginPath();
        tr.forEach((pt, pi) => {
          if (pi === 0) g.moveTo(pt[0], pt[1]);
          else g.lineTo(pt[0], pt[1]);
        });
        g.stroke();
        const last = tr[tr.length - 1];
        g.fillStyle = idx % 2 === 0 ? '#67e8f9' : '#f0abfc';
        g.beginPath();
        g.arc(last[0], last[1], 3, 0, Math.PI * 2);
        g.fill();
      });

      g.fillStyle = 'rgba(15, 23, 42, 0.92)';
      g.strokeStyle = '#22d3ee';
      g.lineWidth = 2;
      g.beginPath();
      for (let s = 0; s < 8; s++) {
        const a = (s / 8) * Math.PI * 2 + Math.PI / 8;
        const px = Math.cos(a) * 24;
        const py = Math.sin(a) * 24;
        if (s === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fill();
      g.stroke();

      const n1 = g.createRadialGradient(-7, 0, 1, -7, 0, 9);
      n1.addColorStop(0, '#ffffff');
      n1.addColorStop(0.5, '#22d3ee');
      n1.addColorStop(1, 'rgba(34, 211, 238, 0)');
      g.fillStyle = n1;
      g.beginPath();
      g.arc(-7, 0, 9, 0, Math.PI * 2);
      g.fill();

      const n2 = g.createRadialGradient(7, 0, 1, 7, 0, 9);
      n2.addColorStop(0, '#ffffff');
      n2.addColorStop(0.5, '#e879f9');
      n2.addColorStop(1, 'rgba(232, 121, 249, 0)');
      g.fillStyle = n2;
      g.beginPath();
      g.arc(7, 0, 9, 0, Math.PI * 2);
      g.fill();
      g.restore();

      this.drawArtDecoFrame(g, w, h, '#22d3ee', '#e879f9');
    }

    return c;
  }

  bakePackLid(style: PackStyle): HTMLCanvasElement {
    const w = 144;
    const h = 48;
    const scale = 2;
    const c = this.createCanvas(w * scale, h * scale);
    const g = c.getContext('2d');
    if (!g) return c;
    g.scale(scale, scale);

    const bodyCanvas = this.packBodies[style.id];
    if (bodyCanvas) {
      g.drawImage(bodyCanvas, 0, 0, w * scale, h * scale, 0, 0, w, h);
    }

    g.strokeStyle = style.trimPrimary;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(8, h - 10);
    g.lineTo(w / 2, h - 2);
    g.lineTo(w - 8, h - 10);
    g.stroke();

    g.strokeStyle = style.trimSecondary;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(14, h - 15);
    g.lineTo(w / 2, h - 7);
    g.lineTo(w - 14, h - 15);
    g.stroke();

    return c;
  }

  drawArtDecoFrame(g: CanvasRenderingContext2D, w: number, h: number, col1: string, col2: string) {
    g.strokeStyle = col1;
    g.lineWidth = 2;
    g.strokeRect(7, 7, w - 14, h - 14);

    g.strokeStyle = col2;
    g.lineWidth = 1;
    g.strokeRect(11, 11, w - 22, h - 22);

    const corners = [
      [7, 7, 1, 1],
      [w - 7, 7, -1, 1],
      [7, h - 7, 1, -1],
      [w - 7, h - 7, -1, -1]
    ];
    g.strokeStyle = col1;
    g.lineWidth = 1.6;
    corners.forEach(([cx, cy, dx, dy]) => {
      g.beginPath();
      g.moveTo(cx, cy + dy * 14);
      g.lineTo(cx + dx * 14, cy + dy * 14);
      g.lineTo(cx + dx * 14, cy);
      g.stroke();
    });
  }
}

const TextureCache = new TextureCacheEngine();

// Procedural Web Audio Synthesizer
class CyberSoundEngine {
  ctx: AudioContext | null = null;
  muted = false;
  activeNodes: any[] = [];

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopAllLooping();
    } else {
      this.init();
      this.playUiClick(660);
    }
    return this.muted;
  }

  stopAllLooping() {
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
      try { node.disconnect(); } catch (e) {}
    });
    this.activeNodes = [];
  }

  playUiClick(freq = 540) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.45, now + 0.055);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playPackTapAndDraw() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const tapOsc = this.ctx.createOscillator();
    const tapGain = this.ctx.createGain();
    tapOsc.type = 'sine';
    tapOsc.frequency.setValueAtTime(145, now + 0.40);
    tapOsc.frequency.exponentialRampToValueAtTime(52, now + 0.50);
    tapGain.gain.setValueAtTime(0.001, now);
    tapGain.gain.setValueAtTime(0.28, now + 0.40);
    tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    tapOsc.connect(tapGain);
    tapGain.connect(this.ctx.destination);
    tapOsc.start(now + 0.40);
    tapOsc.stop(now + 0.53);

    this.playFilteredNoise(0.54, 0.10, 2600, 'bandpass', 0.15);
    this.playFilteredNoise(0.92, 0.44, 1400, 'bandpass', 0.085);
  }

  playCapsuleCrush() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1020, now);
    osc.frequency.exponentialRampToValueAtTime(2550, now + 0.045);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
    this.playFilteredNoise(0.01, 0.08, 3800, 'highpass', 0.14);
  }

  playLighterIgnition(lighterId: string) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (lighterId === 'plastic1Yuan') {
      this.playFilteredNoise(0.56, 0.11, 3500, 'highpass', 0.22);
      this.playFilteredNoise(0.68, 1.40, 820, 'bandpass', 0.10);
    } else if (lighterId === 'royalDupont') {
      const partials = [3180, 4770, 6360, 7950];
      const gains = [0.17, 0.11, 0.055, 0.025];
      partials.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.35);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.setValueAtTime(gains[idx], now + 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.75 - idx * 0.22);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now + 0.35);
        osc.stop(now + 1.80);
        this.activeNodes.push(osc);
      });
      this.playFilteredNoise(0.68, 0.08, 2900, 'highpass', 0.12);
      this.playFilteredNoise(0.74, 1.35, 450, 'lowpass', 0.12);
    } else if (lighterId === 'tripleJet') {
      this.playFilteredNoise(0.42, 0.06, 2600, 'highpass', 0.15);
      this.playFilteredNoise(0.64, 0.05, 5400, 'highpass', 0.24);
      this.playFilteredNoise(0.68, 1.45, 2150, 'bandpass', 0.22);
    } else if (lighterId === 'steampunkBrass') {
      for (let i = 0; i < 4; i++) {
        this.playFilteredNoise(0.30 + i * 0.07, 0.04, 1850 + i * 220, 'bandpass', 0.13);
      }
      this.playFilteredNoise(0.66, 0.12, 3100, 'highpass', 0.20);
      this.playFilteredNoise(0.74, 1.38, 520, 'lowpass', 0.15);
    }
  }

  playBreathingCycle(inhaleDur = 4.0, holdDur = 4.0, exhaleDur = 6.0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const pad1 = this.ctx.createOscillator();
    const pad2 = this.ctx.createOscillator();
    const padGain = this.ctx.createGain();
    pad1.type = 'sine';
    pad2.type = 'triangle';

    pad1.frequency.setValueAtTime(174.61, now);
    pad1.frequency.linearRampToValueAtTime(220.0, now + inhaleDur);
    pad1.frequency.setValueAtTime(220.0, now + inhaleDur + holdDur);
    pad1.frequency.linearRampToValueAtTime(146.83, now + inhaleDur + holdDur + exhaleDur);

    pad2.frequency.setValueAtTime(261.63, now);
    pad2.frequency.linearRampToValueAtTime(329.63, now + inhaleDur);
    pad2.frequency.setValueAtTime(329.63, now + inhaleDur + holdDur);
    pad2.frequency.linearRampToValueAtTime(220.0, now + inhaleDur + holdDur + exhaleDur);

    padGain.gain.setValueAtTime(0.001, now);
    padGain.gain.linearRampToValueAtTime(0.05, now + inhaleDur * 0.8);
    padGain.gain.setValueAtTime(0.042, now + inhaleDur + holdDur);
    padGain.gain.exponentialRampToValueAtTime(0.0008, now + inhaleDur + holdDur + exhaleDur);

    pad1.connect(padGain);
    pad2.connect(padGain);
    padGain.connect(this.ctx.destination);
    const totalDur = inhaleDur + holdDur + exhaleDur;
    pad1.start(now);
    pad2.start(now);
    pad1.stop(now + totalDur + 0.05);
    pad2.stop(now + totalDur + 0.05);
    this.activeNodes.push(pad1, pad2);

    const bufferSize = Math.floor(this.ctx.sampleRate * inhaleDur);
    const crackleBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = crackleBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const pop = Math.random() < 0.004 ? (Math.random() * 2 - 1) * 0.94 : 0;
      const hiss = (Math.random() * 2 - 1) * 0.045;
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (pop + hiss) * env;
    }
    const crackleSrc = this.ctx.createBufferSource();
    crackleSrc.buffer = crackleBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1750;
    filter.Q.value = 0.95;
    const cGain = this.ctx.createGain();
    cGain.gain.value = 0.22;
    crackleSrc.connect(filter);
    filter.connect(cGain);
    cGain.connect(this.ctx.destination);
    crackleSrc.start(now);
    this.activeNodes.push(crackleSrc);

    this.playFilteredNoise(inhaleDur + holdDur, exhaleDur * 0.92, 600, 'bandpass', 0.095);
  }

  playStubOut() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.playFilteredNoise(0, 0.36, 1300, 'bandpass', 0.16);
  }

  playFilteredNoise(delaySec: number, durationSec: number, freq: number, filterType: BiquadFilterType = 'bandpass', peakGain = 0.1) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime + delaySec;
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * durationSec));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + durationSec * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    this.activeNodes.push(noise);
  }
}

const STATES = {
  IDLE: 'IDLE',
  DRAWING_CIGARETTE: 'DRAWING',
  READY_TO_LIGHT: 'READY_TO_LIGHT',
  LIGHTING: 'LIGHTING',
  LIT_IDLE: 'LIT_IDLE',
  SMOKING_CYCLE: 'SMOKING_CYCLE',
  STUBBING_OUT: 'STUBBING_OUT',
  FINISHED: 'FINISHED'
} as const;

type StateKey = typeof STATES[keyof typeof STATES];

const MAX_PUFFS = 6;
const INHALE_DURATION = 4.0;
const HOLD_DURATION = 4.0;
const EXHALE_DURATION = 6.0;
const TOTAL_CYCLE_DURATION = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}
function easeInOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function easeOutBack(t: number) {
  const x = clamp(t, 0, 1);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function easeOutElasticSmall(t: number) {
  const x = clamp(t, 0, 1);
  if (x === 0 || x === 1) return x;
  return Math.pow(2, -9 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export const CyberSmokeLuxury: React.FC = () => {
  const { language, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound engine instance
  const soundEngineRef = useRef<CyberSoundEngine | null>(null);

  // Synchronized state for UI controls
  const [currentStage, setCurrentStage] = useState<StateKey>(STATES.IDLE);
  const [packIndex, setPackIndex] = useState<number>(0);
  const [lighterIndex, setLighterIndex] = useState<number>(0);
  const [puffsRemaining, setPuffsRemaining] = useState<number>(MAX_PUFFS);
  const [capsulesCrushed, setCapsulesCrushed] = useState<number>(0);
  const [ashLength, setAshLength] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string>('');
  const [indicatorColor, setIndicatorColor] = useState<string>('#22d3ee');

  // Animation & simulation mutable state ref
  const simStateRef = useRef({
    current: STATES.IDLE as StateKey,
    packIndex: 0,
    lighterIndex: 0,
    animTime: 0,
    globalTime: 0,
    puffsRemaining: MAX_PUFFS,
    burnProgress: 0,
    burnTarget: 0,
    ashLength: 0,
    emberIntensity: 0,
    capsulesCrushed: 0,
    breathPhase: 'NONE' as 'NONE' | 'INHALE' | 'HOLD' | 'EXHALE',
    breathPhaseProgress: 0,
    breathRingScale: 0.45,
    stubProgress: 0,
    cameraOffsetX: 0,
    soundWaveRings: [] as Array<{
      x: number;
      y: number;
      r: number;
      maxR: number;
      life: number;
      color: string;
      label?: string;
    }>
  });

  const particlesRef = useRef({
    smoke: [] as any[],
    sparks: [] as any[],
    ash: [] as any[],
    dust: [] as any[]
  });

  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const viewSizeRef = useRef({ width: 360, height: 420 });

  // Update prompt text and UI indicators
  const syncUiFromState = useCallback(() => {
    const s = simStateRef.current;
    setCurrentStage(s.current);
    setPuffsRemaining(s.puffsRemaining);
    setCapsulesCrushed(s.capsulesCrushed);
    setAshLength(s.ashLength);
    setPackIndex(s.packIndex);
    setLighterIndex(s.lighterIndex);

    const curLighter = LIGHTER_STYLES[s.lighterIndex];
    const lighterLabel = language === 'zh' ? curLighter.shortZh : curLighter.shortEn;

    switch (s.current) {
      case STATES.IDLE:
        setIndicatorColor('#22d3ee');
        setPromptText(language === 'zh' ? '点击屏幕 · 轻弹开启精装烟盒' : 'Tap Screen · Flick open luxury pack');
        break;
      case STATES.DRAWING_CIGARETTE:
        setIndicatorColor('#e879f9');
        setPromptText(language === 'zh' ? '指尖轻弹开盖 · 正在抽出香烟...' : 'Flicking lid open · Drawing cigarette...');
        break;
      case STATES.READY_TO_LIGHT:
        setIndicatorColor('#f59e0b');
        setPromptText(
          language === 'zh'
            ? `再次点击 · 用【${lighterLabel}】点火`
            : `Tap again · Ignite with [${lighterLabel}]`
        );
        break;
      case STATES.LIGHTING:
        setIndicatorColor('#f97316');
        setPromptText(
          language === 'zh'
            ? `正在启动【${lighterLabel}】吸火引燃...`
            : `Igniting with [${lighterLabel}] · Flame suction...`
        );
        break;
      case STATES.LIT_IDLE:
        setIndicatorColor('#fb923c');
        setPromptText(
          language === 'zh'
            ? `点击配合呼吸引导品吸（剩余 ${s.puffsRemaining} 口）`
            : `Tap to inhale with breath guide (${s.puffsRemaining} puffs left)`
        );
        break;
      case STATES.SMOKING_CYCLE:
        setIndicatorColor('#e879f9');
        break;
      case STATES.STUBBING_OUT:
        setIndicatorColor('#fb7185');
        setPromptText(language === 'zh' ? '本支已品吸完毕 · 正在全息烟灰缸摁灭...' : 'Puff complete · Stubbing out in holo tray...');
        break;
      case STATES.FINISHED:
        setIndicatorColor('#10b981');
        setPromptText(language === 'zh' ? '点击屏幕 · 再来一根（随机盲盒换装）' : 'Tap screen · Draw another (blind box)');
        break;
    }
  }, [language]);

  const randomizeLoadout = useCallback((avoidSame = true) => {
    let nextPack = Math.floor(Math.random() * PACK_STYLES.length);
    let nextLighter = Math.floor(Math.random() * LIGHTER_STYLES.length);
    if (avoidSame && PACK_STYLES.length > 1 && nextPack === simStateRef.current.packIndex) {
      nextPack = (nextPack + 1) % PACK_STYLES.length;
    }
    if (avoidSame && LIGHTER_STYLES.length > 1 && nextLighter === simStateRef.current.lighterIndex) {
      nextLighter = (nextLighter + 1) % LIGHTER_STYLES.length;
    }
    const plasticColors = ['#059669', '#0284c7', '#db2777', '#7c3aed', '#d97706'];
    LIGHTER_STYLES[0].bodyTint = plasticColors[Math.floor(Math.random() * plasticColors.length)];

    simStateRef.current.packIndex = nextPack;
    simStateRef.current.lighterIndex = nextLighter;
    simStateRef.current.capsulesCrushed = 0;
    syncUiFromState();
  }, [syncUiFromState]);

  const resetSession = useCallback((shouldRandomize = true) => {
    soundEngineRef.current?.stopAllLooping();
    if (shouldRandomize) {
      randomizeLoadout(true);
    }
    const s = simStateRef.current;
    s.current = STATES.IDLE;
    s.animTime = 0;
    s.puffsRemaining = MAX_PUFFS;
    s.burnProgress = 0;
    s.burnTarget = 0;
    s.ashLength = 0;
    s.emberIntensity = 0;
    s.capsulesCrushed = 0;
    s.breathPhase = 'NONE';
    s.breathPhaseProgress = 0;
    s.breathRingScale = 0.45;
    s.stubProgress = 0;
    s.cameraOffsetX = 0;
    s.soundWaveRings = [];
    syncUiFromState();
  }, [randomizeLoadout, syncUiFromState]);

  const triggerPrimaryAction = useCallback(() => {
    soundEngineRef.current?.init();
    const s = simStateRef.current;
    switch (s.current) {
      case STATES.IDLE:
        HapticsService.medium();
        s.current = STATES.DRAWING_CIGARETTE;
        s.animTime = 0;
        soundEngineRef.current?.playPackTapAndDraw();
        syncUiFromState();
        break;

      case STATES.READY_TO_LIGHT:
        HapticsService.success();
        s.current = STATES.LIGHTING;
        s.animTime = 0;
        s.soundWaveRings = [];
        soundEngineRef.current?.playLighterIgnition(LIGHTER_STYLES[s.lighterIndex].id);
        syncUiFromState();
        break;

      case STATES.LIT_IDLE:
        if (s.puffsRemaining > 0) {
          HapticsService.light();
          s.current = STATES.SMOKING_CYCLE;
          s.animTime = 0;
          s.puffsRemaining -= 1;
          const consumedRatio = (MAX_PUFFS - s.puffsRemaining) / MAX_PUFFS;
          s.burnTarget = clamp(consumedRatio, 0, 1);
          soundEngineRef.current?.playBreathingCycle(INHALE_DURATION, HOLD_DURATION, EXHALE_DURATION);
          syncUiFromState();
        }
        break;

      case STATES.FINISHED:
        HapticsService.light();
        soundEngineRef.current?.playUiClick(680);
        resetSession(true);
        s.current = STATES.DRAWING_CIGARETTE;
        s.animTime = 0;
        soundEngineRef.current?.playPackTapAndDraw();
        syncUiFromState();
        break;

      default:
        break;
    }
  }, [resetSession, syncUiFromState]);

  const crushNextCapsule = useCallback(() => {
    const s = simStateRef.current;
    const pack = PACK_STYLES[s.packIndex];
    if (pack.capsuleCount <= 0) return;
    HapticsService.medium();
    if (s.capsulesCrushed >= pack.capsuleCount) {
      s.capsulesCrushed = 0;
    } else {
      s.capsulesCrushed += 1;
    }
    soundEngineRef.current?.playCapsuleCrush();

    const viewWidth = viewSizeRef.current.width;
    const viewHeight = viewSizeRef.current.height;
    const isPortrait = viewHeight > viewWidth;
    const sceneScale = clamp(Math.min(viewWidth / 390, viewHeight / 440), 0.72, 1.08);
    const totalLength = isPortrait
      ? Math.min(viewWidth * 0.58, 240 * sceneScale)
      : Math.min(viewWidth * 0.52, 280 * sceneScale);
    const filterLength = totalLength * 0.28;
    const centerX = viewWidth * 0.5 + s.cameraOffsetX;
    const centerY = viewHeight * 0.56;
    const rightEdgeX = centerX + totalLength * 0.46;
    const filterStartX = rightEdgeX - filterLength;

    const capX = filterStartX + filterLength * (s.capsulesCrushed === 1 ? 0.42 : 0.70);
    const capColor = s.capsulesCrushed === 1 ? '#22d3ee' : '#e879f9';

    for (let i = 0; i < 22; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 1.5;
      const speed = (50 + Math.random() * 165) * 0.85 * sceneScale;
      particlesRef.current.sparks.push({
        x: capX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.4 + Math.random() * 2.6,
        life: 1.0,
        decay: 1.5 + Math.random() * 1.9,
        color: capColor
      });
    }

    s.soundWaveRings.push({
      x: capX,
      y: centerY,
      r: 6 * sceneScale,
      maxR: 80 * sceneScale,
      life: 1.0,
      color: capColor
    });
    syncUiFromState();
  }, [syncUiFromState]);

  const tapCigaretteAsh = useCallback(() => {
    const s = simStateRef.current;
    if (s.ashLength <= 2) return;
    HapticsService.light();
    soundEngineRef.current?.playUiClick(860);

    const viewWidth = viewSizeRef.current.width;
    const viewHeight = viewSizeRef.current.height;
    const isPortrait = viewHeight > viewWidth;
    const sceneScale = clamp(Math.min(viewWidth / 390, viewHeight / 440), 0.72, 1.08);
    const totalLength = isPortrait
      ? Math.min(viewWidth * 0.58, 240 * sceneScale)
      : Math.min(viewWidth * 0.52, 280 * sceneScale);
    const thickness = Math.round((isPortrait ? 18 : 20) * sceneScale);
    const filterLength = totalLength * 0.28;
    const maxPaperLength = totalLength - filterLength;
    const centerX = viewWidth * 0.5 + s.cameraOffsetX;
    const centerY = viewHeight * 0.56;
    const rightEdgeX = centerX + totalLength * 0.46;
    const filterStartX = rightEdgeX - filterLength;
    const currentPaperLength = maxPaperLength * (1 - s.burnProgress * 0.88);
    const burnX = filterStartX - currentPaperLength;

    const chunks = Math.min(30, Math.floor(s.ashLength * 1.25));
    for (let i = 0; i < chunks; i++) {
      particlesRef.current.ash.push({
        x: burnX - Math.random() * s.ashLength * sceneScale,
        y: centerY + (Math.random() - 0.5) * thickness,
        vx: (Math.random() - 0.5) * 42 * sceneScale,
        vy: (20 + Math.random() * 78) * sceneScale,
        size: (2.2 + Math.random() * 4.5) * sceneScale,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 6,
        life: 1.0,
        isEmber: Math.random() < 0.28
      });
    }
    s.ashLength = 2;
    syncUiFromState();
  }, [syncUiFromState]);

  // Main Canvas Setup and Animation Loop
  useEffect(() => {
    TextureCache.init();
    if (!soundEngineRef.current) {
      soundEngineRef.current = new CyberSoundEngine();
    }

    // Init dust
    particlesRef.current.dust = [];
    for (let i = 0; i < 36; i++) {
      particlesRef.current.dust.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.9 + Math.random() * 1.7,
        speedY: -0.007 - Math.random() * 0.014,
        speedX: (Math.random() - 0.5) * 0.007,
        alpha: 0.14 + Math.random() * 0.35,
        hue: Math.random() < 0.5 ? 190 : 38
      });
    }

    randomizeLoadout(false);

    const resizeCanvas = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewSizeRef.current = { width: rect.width || 360, height: rect.height || 420 };
      canvasRef.current.width = Math.floor(viewSizeRef.current.width * dpr);
      canvasRef.current.height = Math.floor(viewSizeRef.current.height * dpr);
    };

    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    // Tick Animation Loop
    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      const s = simStateRef.current;
      s.globalTime += dt;
      s.animTime += dt;

      const viewWidth = viewSizeRef.current.width;
      const viewHeight = viewSizeRef.current.height;
      const isPortrait = viewHeight > viewWidth;
      const sceneScale = clamp(Math.min(viewWidth / 390, viewHeight / 440), 0.72, 1.08);

      let desiredOffsetX = 10 * sceneScale;
      if (s.current === STATES.LIGHTING) {
        desiredOffsetX = 24 * sceneScale;
      } else if (
        s.current === STATES.LIT_IDLE ||
        s.current === STATES.SMOKING_CYCLE ||
        s.current === STATES.STUBBING_OUT ||
        s.current === STATES.FINISHED
      ) {
        desiredOffsetX = lerp(12 * sceneScale, -28 * sceneScale, s.burnProgress);
      }
      s.cameraOffsetX = lerp(s.cameraOffsetX, desiredOffsetX, Math.min(1, dt * 6));

      // Canvas context rendering
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          ctx.save();
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          // 1. Cyber Background
          const bgGrad = ctx.createRadialGradient(
            viewWidth * 0.5, viewHeight * 0.45, 20,
            viewWidth * 0.5, viewHeight * 0.5, Math.max(viewWidth, viewHeight) * 0.85
          );
          bgGrad.addColorStop(0, '#0e1628');
          bgGrad.addColorStop(0.55, '#060a14');
          bgGrad.addColorStop(1, '#020408');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, viewWidth, viewHeight);

          // Grid
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.042)';
          ctx.lineWidth = 1;
          const gridSize = 56;
          const offsetX = (s.globalTime * 7) % gridSize;
          for (let x = -gridSize + offsetX; x < viewWidth + gridSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, viewHeight);
            ctx.stroke();
          }
          for (let y = 0; y < viewHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(viewWidth, y);
            ctx.stroke();
          }

          // Dust particles
          for (const p of particlesRef.current.dust) {
            p.x += p.speedX * dt;
            p.y += p.speedY * dt;
            if (p.y < -0.05) p.y = 1.05;
            if (p.x < -0.05) p.x = 1.05;
            if (p.x > 1.05) p.x = -0.05;
            ctx.fillStyle = `hsla(${p.hue}, 90%, 72%, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x * viewWidth, p.y * viewHeight, p.r, 0, Math.PI * 2);
            ctx.fill();
          }

          // 2. Breathing Guide HUD
          if (s.current === STATES.LIT_IDLE || s.current === STATES.SMOKING_CYCLE) {
            const bcx = viewWidth * 0.5;
            const bcy = isPortrait ? viewHeight * 0.32 : viewHeight * 0.34;
            const baseRadius = isPortrait
              ? Math.min(viewWidth * 0.19, viewHeight * 0.12)
              : Math.min(viewWidth, viewHeight) * 0.13;
            const currentRadius = baseRadius * (0.65 + s.breathRingScale * 0.65);

            ctx.save();
            ctx.translate(bcx, bcy);

            let ringColor = 'rgba(56, 189, 248, 0.45)';
            let glowColor = 'rgba(56, 189, 248, 0.18)';
            let phaseTitle = language === 'zh' ? 'READY // 点击开始深呼吸' : 'READY // Tap to inhale';
            let phaseSub = language === 'zh' ? '深吸 4.0s · 屏息 4.0s · 慢呼 6.0s' : 'Inhale 4.0s · Hold 4.0s · Exhale 6.0s';

            if (s.current === STATES.SMOKING_CYCLE) {
              if (s.breathPhase === 'INHALE') {
                ringColor = 'rgba(251, 146, 60, 0.88)';
                glowColor = 'rgba(251, 113, 133, 0.32)';
                phaseTitle = language === 'zh' ? '深吸 INHALE' : 'INHALE';
                phaseSub = language === 'zh' 
                  ? `引导环扩张 · 炭火深炽 (${(INHALE_DURATION * (1 - s.breathPhaseProgress)).toFixed(1)}s)`
                  : `Guide expanding · Ember glowing (${(INHALE_DURATION * (1 - s.breathPhaseProgress)).toFixed(1)}s)`;
              } else if (s.breathPhase === 'HOLD') {
                ringColor = 'rgba(232, 121, 249, 0.9)';
                glowColor = 'rgba(232, 121, 249, 0.32)';
                phaseTitle = language === 'zh' ? '屏息 HOLD' : 'HOLD';
                phaseSub = language === 'zh'
                  ? `内息充盈 · 静享微醺 (${(HOLD_DURATION * (1 - s.breathPhaseProgress)).toFixed(1)}s)`
                  : `Mindful stillness (${(HOLD_DURATION * (1 - s.breathPhaseProgress)).toFixed(1)}s)`;
              } else if (s.breathPhase === 'EXHALE') {
                ringColor = 'rgba(45, 212, 191, 0.88)';
                glowColor = 'rgba(45, 212, 191, 0.3)';
                phaseTitle = language === 'zh' ? '慢呼 EXHALE' : 'EXHALE';
                phaseSub = language === 'zh'
                  ? `引导环收缩 · 悠然吐雾 (${(EXHALE_DURATION * (1 - s.breathPhaseProgress)).toFixed(1)}s)`
                  : `Guide contracting · Releasing cloud (${(EXHALE_DURATION * (1 - s.breathPhaseProgress)).toFixed(1)}s)`;
              }
            }

            const haloGrad = ctx.createRadialGradient(0, 0, currentRadius * 0.35, 0, 0, currentRadius * 1.45);
            haloGrad.addColorStop(0, glowColor);
            haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius * 1.45, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.rotate(s.globalTime * 0.25);
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 10]);
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius * 1.12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.strokeStyle = ringColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
            ctx.stroke();

            if (s.current === STATES.SMOKING_CYCLE) {
              const cycleNorm = clamp(s.animTime / TOTAL_CYCLE_DURATION, 0, 1);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.arc(0, 0, currentRadius, -Math.PI / 2, -Math.PI / 2 + cycleNorm * Math.PI * 2);
              ctx.stroke();
            }

            const titleSize = Math.round(clamp(13 * sceneScale, 11, 14));
            const subSize = Math.round(clamp(10.5 * sceneScale, 9, 11.5));

            ctx.fillStyle = '#f8fafc';
            ctx.font = `700 ${titleSize}px ui-monospace, SFMono-Regular, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(phaseTitle, 0, -7 * sceneScale);

            ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
            ctx.font = `500 ${subSize}px system-ui, sans-serif`;
            ctx.fillText(phaseSub, 0, 10 * sceneScale);

            ctx.restore();
          }

          // 3. Geometry Calculations
          const totalLength = isPortrait
            ? Math.min(viewWidth * 0.58, 240 * sceneScale)
            : Math.min(viewWidth * 0.52, 280 * sceneScale);
          const thickness = Math.round((isPortrait ? 18 : 20) * sceneScale);
          const filterLength = totalLength * 0.28;
          const maxPaperLength = totalLength - filterLength;
          const centerX = viewWidth * 0.5 + s.cameraOffsetX;
          const centerY = viewHeight * 0.56;
          const rightEdgeX = centerX + totalLength * 0.46;
          const filterStartX = rightEdgeX - filterLength;
          const currentPaperLength = maxPaperLength * (1 - s.burnProgress * 0.88);
          const burnX = filterStartX - currentPaperLength;

          const packStyle = PACK_STYLES[s.packIndex];
          const lighterStyle = LIGHTER_STYLES[s.lighterIndex];

          // Particle spawn helper functions
          const getActiveSmokeHue = () => {
            if (packStyle.id === 'glacierPrism' && s.capsulesCrushed >= 1) return 186;
            if (packStyle.id === 'titaniumDamascus') {
              if (s.capsulesCrushed === 1) return 195;
              if (s.capsulesCrushed >= 2) return Math.random() < 0.5 ? 195 : 288;
            }
            return packStyle.smokeHue || 205;
          };

          const spawnTipSmoke = (x: number, y: number, intensity = 1) => {
            particlesRef.current.smoke.push({
              type: 'tip',
              x: x + (Math.random() - 0.5) * 5 * sceneScale,
              y: y - 4 * sceneScale,
              vx: (Math.random() - 0.5) * 14 * sceneScale,
              vy: (-40 - Math.random() * 28 * intensity) * sceneScale,
              radius: (7 + Math.random() * 5) * sceneScale,
              maxRadius: (38 + Math.random() * 34 * intensity) * sceneScale,
              alpha: 0.28 + Math.random() * 0.14 * intensity,
              life: 0,
              maxLife: 2.6 + Math.random() * 1.3,
              rot: Math.random() * Math.PI * 2,
              vRot: (Math.random() - 0.5) * 1.2,
              turbulenceSeed: Math.random() * 100,
              tintHue: getActiveSmokeHue()
            });
          };

          const spawnExhaleSmoke = (w: number, h: number, progress: number) => {
            for (let i = 0; i < 3; i++) {
              const spreadX = (Math.random() - 0.5) * (w * 0.24);
              const startX = w * 0.5 + spreadX;
              const startY = h * 0.94 + Math.random() * 20;
              const targetAngle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.44;
              const speed = (140 + Math.random() * 130 * (1 - progress * 0.35)) * Math.max(0.82, sceneScale);
              particlesRef.current.smoke.push({
                type: 'exhale',
                x: startX,
                y: startY,
                vx: Math.cos(targetAngle) * speed,
                vy: Math.sin(targetAngle) * speed,
                radius: (20 + Math.random() * 16) * sceneScale,
                maxRadius: (96 + Math.random() * 82) * sceneScale,
                alpha: 0.32 + Math.random() * 0.15,
                life: 0,
                maxLife: 2.8 + Math.random() * 1.4,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 1.5,
                turbulenceSeed: Math.random() * 200,
                tintHue: getActiveSmokeHue()
              });
            }
          };

          // 4. Draw Core Entities
          const drawCigarettePack = (
            x: number, y: number, tiltAngle: number, lidOpenProgress: number,
            extractedCigOffset: number, specularSweepPos = 0.5, packScale = 1
          ) => {
            const pw = 144;
            const ph = 212;
            const halfW = pw / 2;
            const halfH = ph / 2;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(tiltAngle);
            ctx.scale(packScale, packScale);

            ctx.fillStyle = packStyle.bevelDark;
            roundRectPath(ctx, -halfW - 9, -halfH + 5, pw + 9, ph, 12);
            ctx.fill();

            ctx.fillStyle = packStyle.bevelEdge;
            roundRectPath(ctx, -halfW - 5, -halfH + 2, pw + 5, ph, 11);
            ctx.fill();

            ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
            ctx.shadowBlur = 28;
            ctx.shadowOffsetY = 14;

            roundRectPath(ctx, -halfW + 3, -halfH, pw - 6, ph * 0.46, 9);
            ctx.fillStyle = '#05070e';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            const foilCanvas = TextureCache.foils[packStyle.foilStyle] || TextureCache.foils.gold;
            if (foilCanvas) {
              ctx.save();
              roundRectPath(ctx, -halfW + 7, -halfH + 4, pw - 14, 58, 6);
              ctx.clip();
              ctx.drawImage(foilCanvas, -halfW + 7, -halfH + 4, pw - 14, 58);
              ctx.restore();
            }

            const peelDepth = 10 + clamp(lidOpenProgress, 0, 1) * 22;
            ctx.fillStyle = '#070a14';
            ctx.beginPath();
            ctx.moveTo(-halfW + 22, -halfH + 4);
            ctx.lineTo(0, -halfH + 4 + peelDepth);
            ctx.lineTo(halfW - 22, -halfH + 4);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = packStyle.trimPrimary;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-halfW + 22, -halfH + 4);
            ctx.lineTo(0, -halfH + 4 + peelDepth);
            ctx.lineTo(halfW - 22, -halfH + 4);
            ctx.stroke();

            // Inner Cigarettes
            const cigCount = 7;
            const slotW = (pw - 26) / cigCount;
            for (let i = 0; i < cigCount; i++) {
              if (i === 3 && extractedCigOffset > 999) continue;
              const cx = -halfW + 13 + i * slotW + slotW * 0.5;
              const neighborPop = (i === 2 || i === 4) ? lidOpenProgress * 9 : (lidOpenProgress * 3.5);
              const lift = i === 3 ? extractedCigOffset : neighborPop;
              const cy = -halfH + 9 - lift;
              const cw = slotW * 0.82;

              ctx.fillStyle = packStyle.paperStyle === 'obsidian-black'
                ? '#181a24'
                : (packStyle.paperStyle === 'warm-ivory' || packStyle.paperStyle === 'cream' ? '#f5efe2' : '#f8fafc');
              roundRectPath(ctx, cx - cw / 2, cy, cw, 60, 3);
              ctx.fill();

              ctx.fillStyle = packStyle.filterColor;
              roundRectPath(ctx, cx - cw / 2, cy, cw, 28, 3);
              ctx.fill();

              ctx.fillStyle = packStyle.bandColor;
              ctx.fillRect(cx - cw / 2, cy + 25, cw, 2.5);

              ctx.fillStyle = '#e2e8f0';
              ctx.beginPath();
              ctx.ellipse(cx, cy + 1.5, cw * 0.46, 2.2, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            // Lower Body
            const bodyTopY = -halfH + 42;
            const bodyH = ph - 42;
            const bodySprite = TextureCache.packBodies[packStyle.id];

            ctx.save();
            roundRectPath(ctx, -halfW, bodyTopY, pw, bodyH, 10);
            ctx.clip();
            if (bodySprite) {
              ctx.drawImage(bodySprite, -halfW, bodyTopY, pw, bodyH);
            }

            const sweepX = lerp(-pw * 1.2, pw * 1.2, specularSweepPos);
            const sweepGrad = ctx.createLinearGradient(sweepX - 38, bodyTopY, sweepX + 38, bodyTopY + bodyH * 0.6);
            sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            sweepGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.22)');
            sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = sweepGrad;
            ctx.fillRect(-halfW, bodyTopY, pw, bodyH);

            const lidShadowH = (1 - clamp(lidOpenProgress, 0, 1)) * 12;
            if (lidShadowH > 0.5) {
              const shGrad = ctx.createLinearGradient(0, bodyTopY, 0, bodyTopY + lidShadowH);
              shGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
              shGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = shGrad;
              ctx.fillRect(-halfW, bodyTopY, pw, lidShadowH);
            }
            ctx.restore();

            roundRectPath(ctx, -halfW, bodyTopY, pw, bodyH, 10);
            ctx.strokeStyle = packStyle.trimPrimary;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Hinged Flip Lid
            ctx.save();
            ctx.translate(0, bodyTopY);
            const openClamped = clamp(lidOpenProgress, 0, 1.18);
            const flipScaleY = lerp(1, -0.86, openClamped);

            if (openClamped > 0.12) {
              ctx.fillStyle = packStyle.bevelDark;
              ctx.beginPath();
              ctx.moveTo(-halfW + 3, 0);
              ctx.lineTo(-halfW - 6 * Math.sin(openClamped * Math.PI * 0.5), -26 * openClamped);
              ctx.lineTo(-halfW + 14, -22 * openClamped);
              ctx.closePath();
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(halfW - 3, 0);
              ctx.lineTo(halfW + 6 * Math.sin(openClamped * Math.PI * 0.5), -26 * openClamped);
              ctx.lineTo(halfW - 14, -22 * openClamped);
              ctx.closePath();
              ctx.fill();
            }

            ctx.scale(1, flipScaleY);
            const lidSprite = TextureCache.packLids[packStyle.id];
            ctx.save();
            roundRectPath(ctx, -halfW, -44, pw, 46, 9);
            ctx.clip();
            if (lidSprite) {
              ctx.drawImage(lidSprite, -halfW, -44, pw, 46);
            }
            if (flipScaleY < 0) {
              ctx.fillStyle = 'rgba(10, 14, 24, 0.72)';
              ctx.fillRect(-halfW, -44, pw, 46);
            }
            ctx.restore();

            roundRectPath(ctx, -halfW, -44, pw, 46, 9);
            ctx.strokeStyle = packStyle.trimPrimary;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            ctx.restore();
          };

          const drawHeroCigarette = (
            hcx: number, hcy: number, angle: number, scale = 1,
            tipForeshorten = 0, externalLightGlow = 0, externalLightRGB = '255, 165, 40'
          ) => {
            ctx.save();
            ctx.translate(hcx, hcy);
            ctx.rotate(angle);
            ctx.scale(scale, scale);

            const halfThick = thickness / 2;
            const rightX = totalLength * 0.46;
            const fStartX = rightX - filterLength;
            const bX = fStartX - currentPaperLength;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.62)';
            ctx.shadowBlur = 18 * sceneScale;
            ctx.shadowOffsetY = 8 * sceneScale;

            const paperGrad = ctx.createLinearGradient(0, -halfThick, 0, halfThick);
            if (packStyle.paperStyle === 'obsidian-black') {
              paperGrad.addColorStop(0, '#2e3244');
              paperGrad.addColorStop(0.48, '#151821');
              paperGrad.addColorStop(1, '#090a0f');
            } else if (packStyle.paperStyle === 'warm-ivory' || packStyle.paperStyle === 'cream') {
              paperGrad.addColorStop(0, '#fffdf9');
              paperGrad.addColorStop(0.55, '#f3ead8');
              paperGrad.addColorStop(1, '#c8bba3');
            } else {
              paperGrad.addColorStop(0, '#ffffff');
              paperGrad.addColorStop(0.55, '#e2e8f0');
              paperGrad.addColorStop(1, '#94a3b8');
            }

            roundRectPath(ctx, bX, -halfThick, currentPaperLength + 4 * sceneScale, thickness, 3 * sceneScale);
            ctx.fillStyle = paperGrad;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Ribbing Lines
            ctx.strokeStyle = packStyle.paperStyle === 'obsidian-black'
              ? 'rgba(229, 193, 88, 0.09)'
              : 'rgba(148, 163, 184, 0.22)';
            ctx.lineWidth = 1;
            const ribStep = Math.max(4.5, 6 * sceneScale);
            for (let px = fStartX - ribStep; px > bX + 4 * sceneScale; px -= ribStep) {
              ctx.beginPath();
              ctx.moveTo(px, -halfThick + 1);
              ctx.lineTo(px, halfThick - 1);
              ctx.stroke();
            }

            // Filter Tip
            const filterGrad = ctx.createLinearGradient(0, -halfThick, 0, halfThick);
            if (packStyle.filterStyle === 'obsidian-gold') {
              filterGrad.addColorStop(0, '#272a3a');
              filterGrad.addColorStop(0.5, '#12131a');
              filterGrad.addColorStop(1, '#07080c');
            } else if (packStyle.filterStyle === 'crimson-ivory') {
              filterGrad.addColorStop(0, '#fffbeb');
              filterGrad.addColorStop(0.5, '#f5e8c7');
              filterGrad.addColorStop(1, '#cbb68e');
            } else if (packStyle.filterStyle === 'glacier-frost') {
              filterGrad.addColorStop(0, '#164e63');
              filterGrad.addColorStop(0.5, '#083344');
              filterGrad.addColorStop(1, '#041e2b');
            } else if (packStyle.filterStyle === 'emerald-rose') {
              filterGrad.addColorStop(0, '#065f46');
              filterGrad.addColorStop(0.5, '#042f2e');
              filterGrad.addColorStop(1, '#021a19');
            } else {
              filterGrad.addColorStop(0, '#262f45');
              filterGrad.addColorStop(0.5, '#111827');
              filterGrad.addColorStop(1, '#090d16');
            }

            roundRectPath(ctx, fStartX, -halfThick, filterLength, thickness, 4 * sceneScale);
            ctx.fillStyle = filterGrad;
            ctx.fill();

            ctx.fillStyle = packStyle.bandColor;
            ctx.fillRect(fStartX, -halfThick, 5 * sceneScale, thickness);
            ctx.fillStyle = packStyle.trimSecondary;
            ctx.fillRect(fStartX + 7.5 * sceneScale, -halfThick, 2 * sceneScale, thickness);

            if (tipForeshorten > 0.02) {
              ctx.fillStyle = '#e2e8f0';
              ctx.strokeStyle = packStyle.bandColor;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.ellipse(rightX, 0, 4.5 * sceneScale * tipForeshorten, halfThick * 0.92, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }

            // Crush Capsule Bead(s)
            if (packStyle.capsuleCount > 0) {
              const capPositions = packStyle.capsuleCount === 2 ? [0.42, 0.70] : [0.54];
              const capColors = ['#22d3ee', '#e879f9'];
              capPositions.forEach((posRatio, idx) => {
                const capX = fStartX + filterLength * posRatio;
                const isCrushed = s.capsulesCrushed > idx;
                const pulse = 0.75 + 0.25 * Math.sin(s.globalTime * 5 + idx);
                ctx.save();
                if (!isCrushed) {
                  ctx.strokeStyle = capColors[idx];
                  ctx.globalAlpha = 0.35 * pulse;
                  ctx.lineWidth = 1.2;
                  ctx.beginPath();
                  ctx.arc(capX, 0, 7.2 * sceneScale, 0, Math.PI * 2);
                  ctx.stroke();
                }
                ctx.globalAlpha = 1;
                ctx.fillStyle = isCrushed ? '#ffffff' : capColors[idx];
                ctx.shadowColor = capColors[idx];
                ctx.shadowBlur = (isCrushed ? 16 : 9 * pulse) * sceneScale;
                ctx.beginPath();
                ctx.arc(capX, 0, (isCrushed ? 5.2 : 4.2) * sceneScale, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = capColors[idx];
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.restore();
              });
            }

            if (externalLightGlow > 0.02) {
              const castGrad = ctx.createRadialGradient(bX, halfThick, 2 * sceneScale, bX + 18 * sceneScale, 0, 68 * sceneScale);
              castGrad.addColorStop(0, `rgba(${externalLightRGB}, ${0.55 * externalLightGlow})`);
              castGrad.addColorStop(1, `rgba(${externalLightRGB}, 0)`);
              ctx.fillStyle = castGrad;
              roundRectPath(ctx, bX, -halfThick, currentPaperLength, thickness, 3 * sceneScale);
              ctx.fill();
            }

            // Ember, Charring & Ash Cone
            if (s.emberIntensity > 0.01 || s.ashLength > 0) {
              const charW = 13 * sceneScale;
              const charGrad = ctx.createLinearGradient(bX - 2 * sceneScale, 0, bX + 12 * sceneScale, 0);
              charGrad.addColorStop(0, '#09090b');
              charGrad.addColorStop(0.45, '#451a03');
              charGrad.addColorStop(0.78, 'rgba(120, 53, 15, 0.35)');
              charGrad.addColorStop(1, 'rgba(69, 26, 3, 0)');
              ctx.fillStyle = charGrad;
              ctx.fillRect(bX - 1 * sceneScale, -halfThick, charW, thickness);

              const glowStrength = clamp(s.emberIntensity, 0, 1.3);
              const flicker = 0.92 + 0.08 * Math.sin(s.globalTime * 19);
              const activeGlow = glowStrength * flicker;

              if (activeGlow > 0.02) {
                const bloomRadius = thickness * (1.65 + activeGlow * 2.1);
                const bloomGrad = ctx.createRadialGradient(bX, 0, 2 * sceneScale, bX, 0, bloomRadius);
                bloomGrad.addColorStop(0, `rgba(255, 248, 200, ${0.95 * activeGlow})`);
                bloomGrad.addColorStop(0.28, `rgba(255, 95, 15, ${0.78 * activeGlow})`);
                bloomGrad.addColorStop(0.65, `rgba(220, 38, 38, ${0.28 * activeGlow})`);
                bloomGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
                ctx.fillStyle = bloomGrad;
                ctx.beginPath();
                ctx.arc(bX, 0, bloomRadius, 0, Math.PI * 2);
                ctx.fill();
              }

              const ashLen = Math.max(5, s.ashLength) * sceneScale;
              const ashStartX = bX - ashLen;
              const droopY = Math.min(6 * sceneScale, (ashLen / (35 * sceneScale)) * 5.5 * sceneScale);

              ctx.save();
              ctx.beginPath();
              ctx.moveTo(bX + 1 * sceneScale, -halfThick + 0.5);
              ctx.quadraticCurveTo(bX - ashLen * 0.5, -halfThick + droopY * 0.4, ashStartX + 3 * sceneScale, -halfThick + 1.8 * sceneScale + droopY);
              ctx.quadraticCurveTo(ashStartX - 2 * sceneScale, droopY, ashStartX + 3 * sceneScale, halfThick - 1.5 * sceneScale + droopY);
              ctx.quadraticCurveTo(bX - ashLen * 0.5, halfThick + droopY * 0.4, bX + 1 * sceneScale, halfThick - 0.5);
              ctx.closePath();

              const ashGrad = ctx.createLinearGradient(ashStartX, -halfThick, bX, halfThick);
              ashGrad.addColorStop(0, '#94a3b8');
              ashGrad.addColorStop(0.45, '#e2e8f0');
              ashGrad.addColorStop(0.8, '#475569');
              ashGrad.addColorStop(1, '#1e293b');
              ctx.fillStyle = ashGrad;
              ctx.fill();

              if (activeGlow > 0.05) {
                ctx.fillStyle = `rgba(255, 100, 15, ${0.92 * activeGlow})`;
                ctx.beginPath();
                ctx.ellipse(bX, 0, (4.8 + activeGlow * 4.5) * sceneScale, halfThick * 0.9, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(255, 228, 120, ${0.88 * activeGlow})`;
                ctx.lineWidth = 1.3 * sceneScale;
                for (let c = 0; c < 4; c++) {
                  const cyOff = (c - 1.5) * 4.2 * sceneScale;
                  ctx.beginPath();
                  ctx.moveTo(bX + 2 * sceneScale, cyOff);
                  ctx.lineTo(bX - (4 + activeGlow * 6) * sceneScale, cyOff + (c % 2 === 0 ? 2.5 : -2.5) * sceneScale);
                  ctx.lineTo(bX - (9 + activeGlow * 8) * sceneScale, cyOff);
                  ctx.stroke();
                }

                if (activeGlow > 0.45) {
                  ctx.fillStyle = `rgba(255, 253, 235, ${(activeGlow - 0.40) * 1.45})`;
                  ctx.beginPath();
                  ctx.ellipse(bX - 1 * sceneScale, 0, (3.2 + activeGlow * 2.8) * sceneScale, halfThick * 0.6, 0, 0, Math.PI * 2);
                  ctx.fill();
                }
              }

              ctx.strokeStyle = 'rgba(15, 23, 42, 0.62)';
              ctx.lineWidth = 1.2 * sceneScale;
              const ashStep = Math.max(3.5, 4.5 * sceneScale);
              for (let ax = bX - ashStep; ax > ashStartX + 3 * sceneScale; ax -= ashStep) {
                ctx.beginPath();
                ctx.moveTo(ax, -halfThick + 2 * sceneScale);
                ctx.lineTo(ax - 1.5 * sceneScale, droopY * 0.5);
                ctx.lineTo(ax + 1 * sceneScale, halfThick - 2 * sceneScale + droopY * 0.6);
                ctx.stroke();
              }
              ctx.restore();
            }

            ctx.restore();
          };

          const drawProceduralFlame = (fx: number, fy: number, intensity: number, suctionStrength: number, flameType: string) => {
            ctx.save();
            ctx.translate(fx, fy);
            const t = s.globalTime;
            const pullX = suctionStrength * 26 * intensity;

            if (flameType === 'tripleJet') {
              const offsets = [-9, 0, 9];
              offsets.forEach((ox, idx) => {
                const jetH = (64 + (idx === 1 ? 10 : 0) + Math.sin(t * 65 + idx) * 5) * intensity;
                const tipX = ox + pullX * 0.55;
                const jetGrad = ctx.createLinearGradient(ox, 0, tipX, -jetH);
                jetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
                jetGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.94)');
                jetGrad.addColorStop(0.78, 'rgba(37, 99, 235, 0.52)');
                jetGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');

                ctx.fillStyle = jetGrad;
                ctx.beginPath();
                ctx.moveTo(ox - 4.5, 0);
                ctx.quadraticCurveTo(ox + pullX * 0.2, -jetH * 0.5, tipX, -jetH);
                ctx.quadraticCurveTo(ox + pullX * 0.25, -jetH * 0.5, ox + 4.5, 0);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = 'rgba(224, 242, 254, 0.95)';
                for (let d = 1; d <= 3; d++) {
                  const frac = (d * 13) / 64;
                  ctx.beginPath();
                  ctx.ellipse(ox + pullX * 0.45 * frac, -d * 13 * intensity, 2.1, 4, 0, 0, Math.PI * 2);
                  ctx.fill();
                }
              });
            } else if (flameType === 'royalTwin') {
              [-5, 5].forEach((ox, idx) => {
                const sway = Math.sin(t * 15 + idx) * 3.5 * intensity + pullX;
                const fh = (54 + idx * 4 + Math.cos(t * 18) * 4) * intensity;
                const fw = 12 * intensity;

                ctx.fillStyle = 'rgba(245, 158, 11, 0.86)';
                ctx.beginPath();
                ctx.moveTo(ox, 2);
                ctx.bezierCurveTo(ox - fw, -fh * 0.25, ox - fw * 0.5 + sway * 0.45, -fh * 0.75, ox + sway, -fh);
                ctx.bezierCurveTo(ox + fw * 0.7 + sway * 0.55, -fh * 0.72, ox + fw, -fh * 0.25, ox, 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(254, 240, 138, 0.95)';
                ctx.beginPath();
                ctx.ellipse(ox + sway * 0.35, -fh * 0.38, fw * 0.48, fh * 0.36, pullX * 0.012, 0, Math.PI * 2);
                ctx.fill();
              });
            } else {
              const isKerosene = flameType === 'kerosene';
              const swayX = (Math.sin(t * 14) * 4.5 + Math.cos(t * 23) * 2.5) * intensity + pullX;
              const flameH = (56 + Math.sin(t * 19) * 6) * intensity;
              const flameW = 15 * intensity;

              ctx.fillStyle = isKerosene ? 'rgba(234, 88, 12, 0.92)' : 'rgba(249, 115, 22, 0.88)';
              ctx.beginPath();
              ctx.moveTo(0, 4);
              ctx.bezierCurveTo(-flameW * 1.2, -flameH * 0.25, -flameW * 0.6 + swayX * 0.45, -flameH * 0.75, swayX, -flameH);
              ctx.bezierCurveTo(flameW * 0.85 + swayX * 0.6, -flameH * 0.72, flameW * 1.2, -flameH * 0.25, 0, 4);
              ctx.fill();

              ctx.fillStyle = 'rgba(253, 224, 71, 0.96)';
              ctx.beginPath();
              ctx.moveTo(0, 2);
              ctx.bezierCurveTo(-flameW * 0.72, -flameH * 0.2, -flameW * 0.35 + swayX * 0.55, -flameH * 0.65, swayX * 0.82, -flameH * 0.80);
              ctx.bezierCurveTo(flameW * 0.5 + swayX * 0.55, -flameH * 0.65, flameW * 0.72, -flameH * 0.2, 0, 2);
              ctx.fill();

              ctx.fillStyle = '#bae6fd';
              ctx.beginPath();
              ctx.ellipse(pullX * 0.08, -flameH * 0.14, flameW * 0.32, flameH * 0.16, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          };

          const drawSteampunkGear = (gx: number, gy: number, radius: number, teeth: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(gx, gy);
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1.2;

            for (let i = 0; i < teeth; i++) {
              ctx.save();
              ctx.rotate((i / teeth) * Math.PI * 2);
              ctx.fillRect(-2.5, -radius - 3, 5, 6);
              ctx.restore();
            }
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.38, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          };

          const drawLighterAndFlame = (
            lx: number, ly: number, wristTilt: number, animTime: number,
            flameIntensity: number, suctionStrength: number, lScale = 1
          ) => {
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(wristTilt);
            ctx.scale(lScale, lScale);

            const id = lighterStyle.id;

            if (id === 'plastic1Yuan') {
              const lw = 54;
              const lh = 104;

              if (flameIntensity > 0.01) {
                drawProceduralFlame(-4, -lh / 2 - 23, flameIntensity, suctionStrength, 'butane');
              }

              const leverPress = (animTime > 0.54 && animTime < 1.96)
                ? easeOutBack(clamp((animTime - 0.54) / 0.14, 0, 1)) * 7
                : 0;
              ctx.save();
              ctx.translate(12, -lh / 2 - 4 + leverPress * 0.65);
              ctx.rotate(leverPress * 0.05);
              roundRectPath(ctx, -10, -7, 29, 9.5, 3.5);
              ctx.fillStyle = '#ef4444';
              ctx.fill();
              ctx.strokeStyle = '#991b1b';
              ctx.lineWidth = 1.2;
              ctx.stroke();
              ctx.restore();

              // Wheel & Hood
              ctx.fillStyle = '#94a3b8';
              roundRectPath(ctx, 4, -lh / 2 - 20, 12, 18, 2);
              ctx.fill();
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 1;
              for (let sy = -lh / 2 - 18; sy < -lh / 2 - 4; sy += 3) {
                ctx.beginPath();
                ctx.moveTo(4, sy);
                ctx.lineTo(16, sy);
                ctx.stroke();
              }

              roundRectPath(ctx, -lw / 2 + 5, -lh / 2 - 22, 28, 24, 4);
              ctx.fillStyle = '#cbd5e1';
              ctx.fill();
              ctx.strokeStyle = '#64748b';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              ctx.fillStyle = '#1e293b';
              [-12, -4].forEach(hx => {
                roundRectPath(ctx, hx, -lh / 2 - 18, 4.5, 9, 2);
                ctx.fill();
              });

              // Translucent Body & Sloshing Butane
              const bodyColor = lighterStyle.bodyTint || '#059669';
              roundRectPath(ctx, -lw / 2, -lh / 2, lw, lh, 8);
              ctx.fillStyle = 'rgba(10, 15, 28, 0.85)';
              ctx.fill();

              ctx.save();
              roundRectPath(ctx, -lw / 2 + 2, -lh / 2 + 2, lw - 4, lh - 4, 7);
              ctx.clip();

              const fuelLevelY = -lh / 2 + 22 + Math.sin(s.globalTime * 3) * 2.5;
              const fGrad = ctx.createLinearGradient(0, fuelLevelY, 0, lh / 2);
              fGrad.addColorStop(0, bodyColor);
              fGrad.addColorStop(1, 'rgba(4, 30, 20, 0.95)');
              ctx.fillStyle = fGrad;
              ctx.fillRect(-lw / 2, fuelLevelY, lw, lh);

              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              for (let b = 0; b < 6; b++) {
                const bx = -lw / 2 + 8 + (b * 7.5);
                const by = fuelLevelY + 14 + ((b * 13 + s.globalTime * 8) % 45);
                ctx.beginPath();
                ctx.arc(bx, by, 1.2 + (b % 2) * 0.8, 0, Math.PI * 2);
                ctx.fill();
              }

              ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(0, -lh / 2);
              ctx.lineTo(0, lh / 2);
              ctx.stroke();

              const gloss = ctx.createLinearGradient(-lw / 2, 0, lw / 2, 0);
              gloss.addColorStop(0, 'rgba(255,255,255,0.45)');
              gloss.addColorStop(0.2, 'rgba(255,255,255,0.05)');
              gloss.addColorStop(0.8, 'rgba(0,0,0,0.25)');
              gloss.addColorStop(1, 'rgba(255,255,255,0.18)');
              ctx.fillStyle = gloss;
              ctx.fillRect(-lw / 2, -lh / 2, lw, lh);
              ctx.restore();

              roundRectPath(ctx, -lw / 2, -lh / 2, lw, lh, 8);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            } else if (id === 'royalDupont') {
              const lw = 62;
              const lh = 98;

              if (flameIntensity > 0.01) {
                drawProceduralFlame(-4, -lh / 2 - 8, flameIntensity, suctionStrength, 'royalTwin');
              }

              const rollerSpin = (animTime > 0.62 && animTime < 0.85) ? (animTime - 0.62) * 40 : 0;
              ctx.fillStyle = '#fde68a';
              roundRectPath(ctx, lw / 2 - 11, -lh / 2 - 20, 9, 20, 2);
              ctx.fill();
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 1;
              for (let ry = -lh / 2 - 18 + (rollerSpin % 3); ry < -lh / 2 - 2; ry += 3) {
                ctx.beginPath();
                ctx.moveTo(lw / 2 - 11, ry);
                ctx.lineTo(lw / 2 - 2, ry);
                ctx.stroke();
              }

              ctx.fillStyle = '#f59e0b';
              roundRectPath(ctx, -12, -lh / 2 - 9, 20, 9, 2);
              ctx.fill();

              roundRectPath(ctx, -lw / 2, -lh / 2, lw, lh, 4);
              if (TextureCache.guillocheGold) {
                ctx.fillStyle = ctx.createPattern(TextureCache.guillocheGold, 'repeat') || '#d97706';
              } else {
                ctx.fillStyle = '#d97706';
              }
              ctx.fill();

              roundRectPath(ctx, -lw / 2 + 7, -lh / 2 + 8, 14, lh - 16, 2);
              ctx.fillStyle = '#090b10';
              ctx.fill();
              ctx.strokeStyle = '#fde68a';
              ctx.lineWidth = 1.1;
              ctx.stroke();

              roundRectPath(ctx, lw / 2 - 21, -lh / 2 + 8, 14, lh - 16, 2);
              ctx.fillStyle = '#090b10';
              ctx.fill();
              ctx.stroke();

              roundRectPath(ctx, -lw / 2, -lh / 2, lw, lh, 4);
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 2;
              ctx.stroke();

              // 110-deg Lid
              const openT = easeOutElasticSmall(clamp((animTime - 0.32) / 0.45, 0, 1));
              const closeT = easeInOutCubic(clamp((animTime - 1.88) / 0.24, 0, 1));
              const lidAngle = (openT * (1 - closeT)) * (Math.PI * 0.56);

              ctx.save();
              ctx.translate(-lw / 2, -lh / 2);
              ctx.rotate(-lidAngle);

              const capH = 30;
              roundRectPath(ctx, 0, -capH, lw, capH, 4);
              if (TextureCache.guillocheGold) {
                ctx.fillStyle = ctx.createPattern(TextureCache.guillocheGold, 'repeat') || '#d97706';
              } else {
                ctx.fillStyle = '#d97706';
              }
              ctx.fill();

              roundRectPath(ctx, 7, -capH + 5, 14, capH - 10, 2);
              ctx.fillStyle = '#090b10';
              ctx.fill();
              ctx.strokeStyle = '#fde68a';
              ctx.lineWidth = 1.1;
              ctx.stroke();

              roundRectPath(ctx, lw - 21, -capH + 5, 14, capH - 10, 2);
              ctx.fillStyle = '#090b10';
              ctx.fill();
              ctx.stroke();

              roundRectPath(ctx, 0, -capH, lw, capH, 4);
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.restore();
            } else if (id === 'tripleJet') {
              const lw = 64;
              const lh = 98;

              if (flameIntensity > 0.01) {
                drawProceduralFlame(-6, -lh / 2 - 14, flameIntensity, suctionStrength, 'tripleJet');
              }

              if (animTime >= 0.60 && animTime <= 0.73) {
                ctx.save();
                ctx.strokeStyle = '#67e8f9';
                ctx.shadowColor = '#00f3ff';
                ctx.shadowBlur = 12;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-16, -lh / 2 - 14);
                ctx.lineTo(-6, -lh / 2 - 22 + (Math.random() - 0.5) * 6);
                ctx.lineTo(4, -lh / 2 - 14);
                ctx.stroke();
                ctx.restore();
              }

              roundRectPath(ctx, -20, -lh / 2 - 14, 30, 14, 3);
              ctx.fillStyle = '#e2e8f0';
              ctx.fill();
              ctx.fillStyle = '#0284c7';
              [-13, -5, 3].forEach(nx => {
                ctx.beginPath();
                ctx.arc(nx, -lh / 2 - 14, 3, 0, Math.PI * 2);
                ctx.fill();
              });

              const pressProgress = easeOutBack(clamp((animTime - 0.36) / 0.22, 0, 1)) * (1 - clamp((animTime - 1.88) / 0.22, 0, 1));
              const btnOffset = pressProgress * 7;

              roundRectPath(ctx, lw / 2 - 6 - btnOffset, -lh / 2 + 8, 14, 28, 4);
              ctx.fillStyle = '#ef4444';
              ctx.fill();
              ctx.strokeStyle = '#fca5a5';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(lw / 2 - 4 - btnOffset, -lh / 2 + 12);
              ctx.lineTo(12, -lh / 2 - 4);
              ctx.stroke();

              ctx.save();
              ctx.translate(12, -lh / 2 - 4);
              ctx.rotate(pressProgress * 1.38);
              roundRectPath(ctx, -36, -16, 40, 14, 4);
              ctx.fillStyle = '#334155';
              ctx.fill();
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.restore();

              roundRectPath(ctx, -lw / 2, -lh / 2, lw, lh, 8);
              ctx.fillStyle = '#1e293b';
              ctx.fill();
              ctx.strokeStyle = '#64748b';
              ctx.lineWidth = 2;
              ctx.stroke();

              roundRectPath(ctx, -lw / 2 + 7, -lh / 2 + 10, 33, lh - 20, 5);
              if (TextureCache.forgedCarbon) {
                ctx.fillStyle = ctx.createPattern(TextureCache.forgedCarbon, 'repeat') || '#0f172a';
              } else {
                ctx.fillStyle = '#0f172a';
              }
              ctx.fill();
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1;
              ctx.stroke();

              roundRectPath(ctx, 11, -lh / 2 + 16, 10, lh - 32, 4);
              ctx.fillStyle = '#450a0a';
              ctx.fill();
              const levelY = Math.sin(s.globalTime * 4) * 3;
              roundRectPath(ctx, 12, -4 + levelY, 8, lh / 2 - 14 - levelY, 3);
              ctx.fillStyle = '#ef4444';
              ctx.fill();
            } else if (id === 'steampunkBrass') {
              const lw = 64;
              const lh = 98;

              if (flameIntensity > 0.01) {
                drawProceduralFlame(-10, -lh / 2 - 18, flameIntensity, suctionStrength, 'kerosene');
              }

              ctx.fillStyle = '#92400e';
              roundRectPath(ctx, -18, -lh / 2 - 12, 16, 12, 3);
              ctx.fill();
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 2.6;
              ctx.beginPath();
              ctx.moveTo(-10, -lh / 2 - 12);
              ctx.quadraticCurveTo(-12, -lh / 2 - 20, -8, -lh / 2 - 22);
              ctx.stroke();

              const armOpen = easeOutBack(clamp((animTime - 0.30) / 0.34, 0, 1)) * (1 - clamp((animTime - 1.88) / 0.24, 0, 1));
              ctx.save();
              ctx.translate(14, -lh / 2 - 6);
              ctx.rotate(armOpen * 1.48);
              ctx.strokeStyle = '#eab308';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(-24, -6);
              ctx.stroke();
              roundRectPath(ctx, -34, -18, 20, 14, 4);
              ctx.fillStyle = '#ca8a04';
              ctx.fill();
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.restore();

              const brassGrad = ctx.createLinearGradient(-lw / 2, 0, lw / 2, 0);
              brassGrad.addColorStop(0, '#78350f');
              brassGrad.addColorStop(0.45, '#d97706');
              brassGrad.addColorStop(0.7, '#f59e0b');
              brassGrad.addColorStop(1, '#451a03');
              roundRectPath(ctx, -lw / 2, -lh / 2, lw, lh, 8);
              ctx.fillStyle = brassGrad;
              ctx.fill();
              ctx.strokeStyle = '#fde68a';
              ctx.lineWidth = 2;
              ctx.stroke();

              // Glass Sight Window
              roundRectPath(ctx, -23, -10, 16, 44, 7);
              ctx.fillStyle = '#271206';
              ctx.fill();
              ctx.save();
              roundRectPath(ctx, -22, -9, 14, 42, 6);
              ctx.clip();
              ctx.fillStyle = 'rgba(245, 158, 11, 0.78)';
              ctx.fillRect(-23, 2, 16, 34);
              ctx.strokeStyle = '#fef3c7';
              ctx.lineWidth = 3;
              ctx.setLineDash([3, 2]);
              ctx.beginPath();
              ctx.moveTo(-15, -9);
              ctx.bezierCurveTo(-19, 8, -11, 18, -16, 32);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.restore();
              roundRectPath(ctx, -23, -10, 16, 44, 7);
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 1.4;
              ctx.stroke();

              ctx.fillStyle = '#fef08a';
              for (let ry = -lh / 2 + 10; ry <= lh / 2 - 10; ry += 18) {
                ctx.beginPath();
                ctx.arc(-lw / 2 + 5, ry, 2.1, 0, Math.PI * 2);
                ctx.arc(lw / 2 - 5, ry, 2.1, 0, Math.PI * 2);
                ctx.fill();
              }

              const gearAngle = armOpen * Math.PI * 1.7 + (flameIntensity > 0 ? s.globalTime * 1.4 : 0);
              drawSteampunkGear(13, -18, 13, 8, gearAngle, '#fde047');
              drawSteampunkGear(-4, -29, 9, 6, -gearAngle * 1.35, '#f97316');

              const gx = 12;
              const gy = 20;
              ctx.fillStyle = '#0f172a';
              ctx.beginPath();
              ctx.arc(gx, gy, 13, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#fde047';
              ctx.lineWidth = 2;
              ctx.stroke();

              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(gx, gy, 9.5, -0.4, 0.8);
              ctx.stroke();

              const needleAngle = -2.1 + (flameIntensity * 2.3) + Math.sin(s.globalTime * 28) * 0.14 * flameIntensity;
              ctx.save();
              ctx.translate(gx, gy);
              ctx.rotate(needleAngle);
              ctx.strokeStyle = '#f8fafc';
              ctx.lineWidth = 1.7;
              ctx.beginPath();
              ctx.moveTo(0, 2);
              ctx.lineTo(0, -9.5);
              ctx.stroke();
              ctx.restore();
            }

            ctx.restore();
          };

          // 5. Stage State Machine Render Branching
          if (s.current === STATES.IDLE) {
            const floatY = Math.sin(s.globalTime * 2.2) * 6 * sceneScale;
            const tilt = Math.sin(s.globalTime * 1.4) * 0.035;
            const sweep = 0.5 + 0.42 * Math.sin(s.globalTime * 1.1);
            drawCigarettePack(viewWidth * 0.5, centerY + floatY, tilt, 0, 0, sweep, sceneScale);
          } else if (s.current === STATES.DRAWING_CIGARETTE) {
            const t = s.animTime;
            const packTargetX = viewWidth * 0.5 - (isPortrait ? 32 * sceneScale : 58 * sceneScale);
            const packTargetY = centerY + 12 * sceneScale;

            const slideIn = easeOutBack(clamp(t / 0.42, 0, 1));
            const fingerFlick = (t > 0.38 && t < 0.60)
              ? -Math.sin(((t - 0.38) / 0.22) * Math.PI) * 22 * sceneScale
              : 0;
            const slideOut = easeInOutCubic(clamp((t - 1.38) / 0.85, 0, 1));

            const packY = lerp(viewHeight + 170 * sceneScale, packTargetY, slideIn) + fingerFlick + slideOut * 350 * sceneScale;
            const packTilt = lerp(-0.16, 0.04, slideIn) + (fingerFlick * 0.0032);
            const lidOpen = easeOutBack(clamp((t - 0.45) / 0.38, 0, 1));
            const sweepPos = clamp(t / 1.5, 0, 1);

            if (t < 1.38) {
              const initialPop = easeOutBack(clamp((t - 0.46) / 0.25, 0, 1)) * 25;
              const fullSlide = easeInOutCubic(clamp((t - 0.84) / 0.50, 0, 1)) * 58;
              drawCigarettePack(packTargetX, packY, packTilt, lidOpen, initialPop + fullSlide, sweepPos, sceneScale);
            } else {
              drawCigarettePack(packTargetX, packY, packTilt, lidOpen, 9999, sweepPos, sceneScale);

              const rawArc = clamp((t - 1.38) / 0.84, 0, 1);
              const moveT = easeOutBack(rawArc);
              const startX = packTargetX;
              const startY = packTargetY - 112 * sceneScale;
              const curX = lerp(startX, centerX, easeInOutCubic(rawArc));
              const curY = lerp(startY, centerY, moveT) - Math.sin(rawArc * Math.PI) * 28 * sceneScale;
              const curAngle = lerp(-Math.PI / 2, 0, easeInOutCubic(rawArc));
              const curScale = lerp(0.58, 1.0, easeOutCubic(rawArc));
              const foreshorten = Math.sin(rawArc * Math.PI);
              drawHeroCigarette(curX, curY, curAngle, curScale, foreshorten);
            }

            if (t >= 2.32) {
              s.current = STATES.READY_TO_LIGHT;
              s.animTime = 0;
              syncUiFromState();
            }
          } else if (s.current === STATES.READY_TO_LIGHT) {
            const hoverY = Math.sin(s.globalTime * 2.5) * 2.5 * sceneScale;
            drawHeroCigarette(centerX, centerY + hoverY, 0, 1);
          } else if (s.current === STATES.LIGHTING) {
            const t = s.animTime;
            const targetLighterX = burnX - 8 * sceneScale;
            const targetLighterY = centerY + 86 * sceneScale;

            const enterT = easeOutBack(clamp(t / 0.50, 0, 1));
            const exitT = easeInOutCubic(clamp((t - 1.90) / 0.50, 0, 1));
            const swingX = isPortrait ? 24 * sceneScale : 64 * sceneScale;
            const lighterX = lerp(targetLighterX - swingX, targetLighterX, enterT) - exitT * (swingX * 0.8);
            const lighterY = lerp(viewHeight + 140 * sceneScale, targetLighterY, enterT) + exitT * 260 * sceneScale;
            const wristTilt = lerp(-0.20, 0.05, enterT) - exitT * 0.18;

            if (lighterStyle.id === 'royalDupont' && t >= 0.35 && t <= 0.40 && s.soundWaveRings.length === 0) {
              s.soundWaveRings.push({
                x: lighterX,
                y: lighterY - 45 * sceneScale,
                r: 10 * sceneScale,
                maxR: 125 * sceneScale,
                life: 1.0,
                color: '#fde047',
                label: 'CLING ♪'
              });
            }

            if (t > 0.62 && t < 0.74 && Math.random() < 0.82) {
              for (let i = 0; i < 7; i++) {
                const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 1.5;
                const speed = (50 + Math.random() * 165) * sceneScale;
                particlesRef.current.sparks.push({
                  x: burnX - 4 * sceneScale,
                  y: centerY + 14 * sceneScale,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  size: 1.4 + Math.random() * 2.6,
                  life: 1.0,
                  decay: 1.5 + Math.random() * 1.9,
                  color: lighterStyle.emberTint
                });
              }
            }

            let flameStrength = 0;
            if (t >= 0.68 && t <= 1.90) {
              flameStrength = clamp((t - 0.68) / 0.16, 0, 1) * (1 - clamp((t - 1.74) / 0.16, 0, 1));
            }

            const suctionStrength = (t > 0.90 && t < 1.70)
              ? Math.sin(clamp((t - 0.90) / 0.80, 0, 1) * Math.PI)
              : 0;

            if (t > 0.82) {
              const heatProgress = clamp((t - 0.82) / 0.92, 0, 1);
              s.emberIntensity = lerp(0, 0.90, heatProgress);
              s.ashLength = lerp(0, 5.5, heatProgress);
              if (Math.random() < 0.36) {
                spawnTipSmoke(burnX, centerY, 0.95);
              }
            }

            drawHeroCigarette(
              centerX, centerY, 0, 1, 0,
              flameStrength * (0.65 + suctionStrength * 0.35),
              lighterStyle.lightColor
            );

            drawLighterAndFlame(lighterX, lighterY, wristTilt, t, flameStrength, suctionStrength, sceneScale);

            if (t >= 2.42) {
              s.current = STATES.LIT_IDLE;
              s.animTime = 0;
              s.emberIntensity = 0.36;
              syncUiFromState();
            }
          } else if (s.current === STATES.LIT_IDLE) {
            s.emberIntensity = 0.34 + 0.08 * Math.sin(s.globalTime * 3.6);
            s.breathRingScale = lerp(s.breathRingScale, 0.45, dt * 4);

            if (Math.random() < 0.24) {
              spawnTipSmoke(burnX, centerY, 0.65);
            }

            const hoverY = Math.sin(s.globalTime * 2.2) * 2 * sceneScale;
            drawHeroCigarette(centerX, centerY + hoverY, 0, 1);
          } else if (s.current === STATES.SMOKING_CYCLE) {
            const t = s.animTime;
            const startBurn = (MAX_PUFFS - s.puffsRemaining - 1) / MAX_PUFFS;

            if (t < INHALE_DURATION) {
              s.breathPhase = 'INHALE';
              const p = clamp(t / INHALE_DURATION, 0, 1);
              s.breathPhaseProgress = p;
              s.breathRingScale = lerp(0.45, 1.0, easeInOutCubic(p));
              s.emberIntensity = lerp(0.38, 1.22, easeOutCubic(p));
              s.burnProgress = lerp(startBurn, s.burnTarget, easeInOutCubic(p));
              s.ashLength += dt * 8.2;

              if (Math.random() < 0.36) {
                spawnTipSmoke(burnX, centerY, 0.95);
              }
            } else if (t < INHALE_DURATION + HOLD_DURATION) {
              s.breathPhase = 'HOLD';
              const p = clamp((t - INHALE_DURATION) / HOLD_DURATION, 0, 1);
              s.breathPhaseProgress = p;
              s.breathRingScale = 1.0 + 0.03 * Math.sin(p * Math.PI * 2);
              s.emberIntensity = lerp(1.18, 0.55, p);

              if (Math.random() < 0.26) {
                spawnTipSmoke(burnX, centerY, 0.8);
              }
            } else if (t < TOTAL_CYCLE_DURATION) {
              s.breathPhase = 'EXHALE';
              const p = clamp((t - INHALE_DURATION - HOLD_DURATION) / EXHALE_DURATION, 0, 1);
              s.breathPhaseProgress = p;
              s.breathRingScale = lerp(1.0, 0.42, easeInOutCubic(p));
              s.emberIntensity = lerp(0.55, 0.34, p);

              if (p < 0.84) {
                spawnExhaleSmoke(viewWidth, viewHeight, p);
              }
              if (Math.random() < 0.36) {
                spawnTipSmoke(burnX, centerY, 1.0);
              }
            } else {
              s.breathPhase = 'NONE';
              if (s.puffsRemaining <= 0) {
                s.current = STATES.STUBBING_OUT;
                s.animTime = 0;
                soundEngineRef.current?.playStubOut();
                tapCigaretteAsh();
                syncUiFromState();
              } else {
                s.current = STATES.LIT_IDLE;
                s.animTime = 0;
                syncUiFromState();
              }
            }

            drawHeroCigarette(centerX, centerY, 0, 1);
          } else if (s.current === STATES.STUBBING_OUT) {
            const t = s.animTime;
            const p = clamp(t / 1.45, 0, 1);
            s.stubProgress = p;
            s.emberIntensity = lerp(0.5, 0, p);

            const trayX = burnX;
            const trayY = centerY + 42 * sceneScale;

            ctx.save();
            ctx.translate(trayX, trayY);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 48 * sceneScale, 14 * sceneScale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            const pressDown = Math.sin(clamp(p * 1.4, 0, 1) * Math.PI) * 18 * sceneScale;
            const tiltAngle = -0.18 * Math.sin(clamp(p * 1.3, 0, 1) * Math.PI);
            drawHeroCigarette(centerX, centerY + pressDown, tiltAngle, 1);

            if (t < 0.7 && Math.random() < 0.45) {
              spawnTipSmoke(trayX, trayY - 8 * sceneScale, 1.2);
            }

            if (t >= 1.48) {
              s.current = STATES.FINISHED;
              s.animTime = 0;
              syncUiFromState();
            }
          } else if (s.current === STATES.FINISHED) {
            const trayX = burnX;
            const trayY = centerY + 42 * sceneScale;
            ctx.save();
            ctx.translate(trayX, trayY);
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.68)';
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 48 * sceneScale, 14 * sceneScale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            drawHeroCigarette(centerX, centerY + 12 * sceneScale, -0.08, 1);
          }

          // 6. Fast Particle Renderer
          for (let i = s.soundWaveRings.length - 1; i >= 0; i--) {
            const ring = s.soundWaveRings[i];
            ring.life -= dt * 1.12;
            if (ring.life <= 0) {
              s.soundWaveRings.splice(i, 1);
              continue;
            }
            const curR = lerp(ring.r, ring.maxR, 1 - Math.pow(ring.life, 2));
            ctx.save();
            ctx.strokeStyle = ring.color;
            ctx.globalAlpha = ring.life;
            ctx.lineWidth = 2.2 * ring.life;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, curR, 0, Math.PI * 2);
            ctx.stroke();
            if (ring.label) {
              ctx.fillStyle = ring.color;
              ctx.font = '800 13px ui-monospace, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(ring.label, ring.x, ring.y - curR - 8);
            }
            ctx.restore();
          }

          for (let i = particlesRef.current.ash.length - 1; i >= 0; i--) {
            const p = particlesRef.current.ash[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 190 * dt;
            p.rot += p.vRot * dt;
            p.life -= dt * 0.85;
            if (p.life <= 0 || p.y > viewHeight + 30) {
              particlesRef.current.ash.splice(i, 1);
              continue;
            }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.isEmber
              ? `rgba(255, 110, 25, ${p.life})`
              : `rgba(148, 163, 184, ${p.life * 0.85})`;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.72);
            ctx.restore();
          }

          for (let i = particlesRef.current.sparks.length - 1; i >= 0; i--) {
            const sp = particlesRef.current.sparks[i];
            sp.x += sp.vx * dt;
            sp.y += sp.vy * dt;
            sp.vy += 125 * dt;
            sp.life -= sp.decay * dt;
            if (sp.life <= 0) {
              particlesRef.current.sparks.splice(i, 1);
              continue;
            }
            ctx.save();
            ctx.fillStyle = sp.color;
            ctx.globalAlpha = clamp(sp.life, 0, 1);
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          for (let i = particlesRef.current.smoke.length - 1; i >= 0; i--) {
            const sm = particlesRef.current.smoke[i];
            sm.life += dt;
            const norm = sm.life / sm.maxLife;
            if (norm >= 1) {
              particlesRef.current.smoke.splice(i, 1);
              continue;
            }

            const curlWave = Math.sin(s.globalTime * 2.2 + sm.turbulenceSeed + sm.y * 0.018);
            sm.vx += curlWave * (sm.type === 'exhale' ? 44 : 25) * dt;
            sm.vx *= Math.pow(0.92, dt * 60);
            sm.vy *= Math.pow(0.985, dt * 60);

            sm.x += sm.vx * dt;
            sm.y += sm.vy * dt;
            sm.rot += sm.vRot * dt;

            const curRadius = lerp(sm.radius, sm.maxRadius, easeOutCubic(norm));
            const env = norm < 0.14 ? norm / 0.14 : Math.pow(1 - (norm - 0.14) / 0.86, 1.55);
            const curAlpha = clamp(sm.alpha * env, 0, 1);

            const sprite = TextureCache.smokePuffs[sm.tintHue] || TextureCache.smokePuffs[205];
            if (sprite) {
              ctx.save();
              ctx.translate(sm.x, sm.y);
              ctx.rotate(sm.rot);
              ctx.globalAlpha = curAlpha;
              ctx.drawImage(sprite, -curRadius, -curRadius * 0.85, curRadius * 2, curRadius * 1.7);
              ctx.restore();
            }
          }

          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      ro.disconnect();
      soundEngineRef.current?.stopAllLooping();
    };
  }, [randomizeLoadout, syncUiFromState, language]);

  // Handle pointer interactions on Canvas
  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = simStateRef.current;
    const pack = PACK_STYLES[s.packIndex];
    if (pack.capsuleCount > 0 && (s.current === STATES.READY_TO_LIGHT || s.current === STATES.LIT_IDLE)) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const viewWidth = viewSizeRef.current.width;
        const viewHeight = viewSizeRef.current.height;
        const isPortrait = viewHeight > viewWidth;
        const sceneScale = clamp(Math.min(viewWidth / 390, viewHeight / 440), 0.72, 1.08);
        const totalLength = isPortrait
          ? Math.min(viewWidth * 0.58, 240 * sceneScale)
          : Math.min(viewWidth * 0.52, 280 * sceneScale);
        const thickness = Math.round((isPortrait ? 18 : 20) * sceneScale);
        const filterLength = totalLength * 0.28;
        const centerX = viewWidth * 0.5 + s.cameraOffsetX;
        const centerY = viewHeight * 0.56;
        const rightEdgeX = centerX + totalLength * 0.46;
        const filterStartX = rightEdgeX - filterLength;

        if (
          clickX >= filterStartX - 28 &&
          clickX <= rightEdgeX + 28 &&
          Math.abs(clickY - centerY) <= Math.max(thickness * 2.6, 44)
        ) {
          crushNextCapsule();
          return;
        }
      }
    }
    triggerPrimaryAction();
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticsService.selection();
    if (soundEngineRef.current) {
      const muted = soundEngineRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleRandomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticsService.selection();
    soundEngineRef.current?.playUiClick(720);
    resetSession(true);
  };

  const currentPack = PACK_STYLES[packIndex];
  const isCigVisible = ([
    STATES.READY_TO_LIGHT,
    STATES.LIGHTING,
    STATES.LIT_IDLE,
    STATES.SMOKING_CYCLE
  ] as StateKey[]).includes(currentStage);

  const showPuffTracker = isCigVisible;
  const showTapAsh = (currentStage === STATES.LIT_IDLE || currentStage === STATES.SMOKING_CYCLE) && ashLength > 6;
  const showCapsuleBtn = currentPack.capsuleCount > 0 && isCigVisible;

  return (
    <div className="w-full flex flex-col">
      {/* Main Procedural Cyber Canvas Chamber */}
      <div
        ref={containerRef}
        className="relative w-full h-[410px] sm:h-[440px] rounded-3xl overflow-hidden bg-[#04060b] border border-cyan-500/25 shadow-2xl flex items-center justify-center select-none"
      >
        <canvas
          ref={canvasRef}
          onPointerUp={handleCanvasPointerUp}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none block"
          aria-label="Cyber Smoke Procedural Canvas"
        />

        {/* Top Floating Action HUD */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center space-x-1.5 pointer-events-auto">
            {/* Tap Ash Button */}
            {showTapAsh && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  tapCigaretteAsh();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 active:scale-95 text-amber-300 border border-amber-500/40 backdrop-blur-md text-[11px] font-mono font-bold flex items-center space-x-1 transition shadow-lg"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'zh' ? '弹烟灰' : 'Tap Ash'}</span>
              </button>
            )}
          </div>

          {/* Right Top HUD: Randomize Blind Box */}
          <div className="flex items-center space-x-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleRandomize}
              title={language === 'zh' ? '随机盲盒换装 / 再来一根' : 'Random Blind Box / New Stick'}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 backdrop-blur-md text-[11px] font-mono font-bold flex items-center space-x-1 transition active:scale-95 shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '再来一根' : 'New Pack'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Floating Interactive Stack */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-col items-center space-y-2 z-20 pointer-events-none">
          {/* Puff Tracker Pills */}
          {showPuffTracker && (
            <div className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/25 flex items-center space-x-2 text-[10px] font-mono shadow-md">
              <span className="text-slate-400">
                {language === 'zh' ? '剩余品吸' : 'Puffs'}:
              </span>
              <div className="flex items-center space-x-1.5">
                {Array.from({ length: MAX_PUFFS }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < puffsRemaining
                        ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] scale-105'
                        : 'bg-slate-700/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerPrimaryAction();
            }}
            className="pointer-events-auto w-full max-w-sm px-4 py-2.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800/90 active:scale-98 border border-cyan-500/35 backdrop-blur-lg shadow-xl shadow-black/60 flex items-center justify-between text-xs font-mono font-bold transition-all"
            style={{
              boxShadow: `0 0 20px ${indicatorColor}22`
            }}
          >
            <div className="flex items-center space-x-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300"
                style={{
                  background: indicatorColor,
                  boxShadow: `0 0 10px ${indicatorColor}`
                }}
              />
              <span className="text-slate-100 truncate">
                {promptText}
              </span>
            </div>

            <span className="text-[10px] text-cyan-400/80 font-mono tracking-wider ml-2 shrink-0 hidden sm:inline">
              [TAP]
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
