import { ScheduleItem, Category, Priority } from '../types';

export const AI_PROMPT_TEMPLATE_ZH = `你是一位精通时间管理与认知神经生物学的精力排期规划师。
请根据我接下来描述的今日工作与生活事项，将其拆解并规划为符合「超昼夜节律 (Ultradian Rhythm)」与科学精力分配的日程安排。

【我的今日待办描述】：
[请在此处输入你今天的待办或科研/工作设想，例如：早上精读2篇顶会论文，下午2点与导师讨论实验进展，4点调试代码跑消融实验，晚上有氧慢跑放松]

【输出规范要求】：
1. 必须输出且仅输出一个纯 JSON 数组，用 \`\`\`json 包裹，不要添加多余的问候语或解释说明。
2. 每一个任务对象必须包含以下字段：
   - "title" (string): 简明扼要的事项名称，突出具体交付物
   - "startTime" (string): 24小时制 HH:mm，如 "09:30"
   - "endTime" (string): 24小时制 HH:mm，如 "11:00"
   - "category" (string): 必须是以下六个英文枚举值之一：
     "research" (科研攻坚/论文文献/实验跑数/论文撰写)
     "work" (工作事务/组会讨论/需求对接/协同沟通)
     "health" (身体充能/户外采光/防久坐拉伸/营养进食)
     "mind" (脑雾清理/复盘思考/深度阅读)
     "rest" (深度休整/NSDR快充/离线断网睡眠)
     "life" (生活节奏/通勤采买/个人琐事)
   - "priority" (string): 必须是 "p0" (核心硬仗, 限1-2项), "p1" (稳步推进), "p2" (机动弹性)
   - "note" (string): 简短的认知策略或免打扰提示，如 "90m单线程深度心流，关闭即时通知"
3. 规划逻辑：核心高耗能脑力任务优先安排在上午认知峰值时段，时长建议 60-90 分钟，并适度穿插午后休息。
`;

export const AI_PROMPT_TEMPLATE_EN = `You are an expert cognitive performance strategist and circadian rhythm scheduler.
Please convert my daily tasks into a high-performance, single-thread ultradian schedule.

[MY RAW TASKS & PLANS FOR TODAY]:
[Type your raw daily tasks here, e.g.: Read 2 NeurIPS papers this morning, 2 PM meeting with research advisor, 4 PM run PyTorch training ablation, evening jog and light reading]

[OUTPUT SPECIFICATION]:
1. Output ONLY a valid JSON array wrapped in \`\`\`json codeblock without any additional conversational text.
2. Each item must contain:
   - "title": Concise task name
   - "startTime": 24h format HH:mm, e.g. "09:30"
   - "endTime": 24h format HH:mm, e.g. "11:00"
   - "category": One of ["research", "work", "health", "mind", "rest", "life"]
   - "priority": One of ["p0", "p1", "p2"]
   - "note": Brief cognitive strategy or focus note
3. Respect 90-minute ultradian cognitive peaks for core deep work.
`;

const CATEGORY_MAP: Record<string, Category> = {
  research: 'research',
  科研: 'research',
  学术: 'research',
  论文: 'research',
  实验: 'research',
  paper: 'research',
  study: 'research',

  health: 'health',
  健康: 'health',
  身体: 'health',
  运动: 'health',
  健身: 'health',
  跑步: 'health',

  mind: 'mind',
  脑雾: 'mind',
  心智: 'mind',
  冥想: 'mind',
  阅读: 'mind',
  复盘: 'mind',

  work: 'work',
  工作: 'work',
  会议: 'work',
  组会: 'work',
  协同: 'work',
  事务: 'work',

  rest: 'rest',
  休息: 'rest',
  休整: 'rest',
  睡眠: 'rest',
  午休: 'rest',
  nsdr: 'rest',

  life: 'life',
  生活: 'life',
  日常: 'life',
  杂务: 'life',
};

const PRIORITY_MAP: Record<string, Priority> = {
  p0: 'p0',
  '0': 'p0',
  core: 'p0',
  high: 'p0',
  核心: 'p0',
  重要: 'p0',

  p1: 'p1',
  '1': 'p1',
  mid: 'p1',
  medium: 'p1',
  普通: 'p1',
  稳步: 'p1',

  p2: 'p2',
  '2': 'p2',
  low: 'p2',
  弹性: 'p2',
  机动: 'p2',
};

function normalizeTime(timeStr?: string, defaultHour = 9): string {
  if (!timeStr) {
    return `${String(defaultHour).padStart(2, '0')}:00`;
  }
  const clean = timeStr.trim().replace(/：/g, ':');
  const match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return `${String(defaultHour).padStart(2, '0')}:00`;
}

interface RawTaskObject {
  title?: string;
  name?: string;
  startTime?: string;
  start?: string;
  time?: string;
  endTime?: string;
  end?: string;
  category?: string;
  priority?: string;
  note?: string;
  memo?: string;
  isAllDay?: boolean;
}

export function parseAIScheduleString(rawText: string, targetDate: string): ScheduleItem[] {
  if (!rawText || !rawText.trim()) return [];

  let jsonStr = rawText.trim();

  // 1. Try extracting json block from markdown ```json ... ```
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // 2. Try locating outermost array [ ... ]
  const firstBracket = jsonStr.indexOf('[');
  const lastBracket = jsonStr.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
  }

  // 3. Attempt JSON parse
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .filter((item): item is RawTaskObject => typeof item === 'object' && item !== null)
        .map((item, index) => {
          const rawTitle = (item.title || item.name || `事项 ${index + 1}`).trim();
          const rawStart = normalizeTime(item.startTime || item.start || item.time, 9 + index);
          
          let rawEnd = item.endTime || item.end;
          if (!rawEnd) {
            const startH = parseInt(rawStart.split(':')[0], 10);
            const startM = parseInt(rawStart.split(':')[1], 10);
            const endH = Math.min(23, startH + 1);
            rawEnd = `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
          } else {
            rawEnd = normalizeTime(rawEnd, 10 + index);
          }

          const catKey = (item.category || 'research').toLowerCase().trim();
          const category: Category = CATEGORY_MAP[catKey] || 'research';

          const prioKey = (item.priority || 'p1').toLowerCase().trim();
          const priority: Priority = PRIORITY_MAP[prioKey] || 'p1';

          return {
            id: `ai_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
            title: rawTitle,
            startTime: rawStart,
            endTime: rawEnd,
            date: targetDate,
            category,
            priority,
            note: item.note || item.memo || '',
            isAllDay: Boolean(item.isAllDay),
            repeat: 'none',
            completed: false,
            completedDates: [],
            focusMinutes: 0,
          };
        });
    }
  } catch {
    // Fall back to line-by-line parsing
  }

  // 4. Line-by-line fallback parser for plain text lists
  // e.g.: 09:30 - 11:00 文献精读 | 科研 | P0 | 备注
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const tasks: ScheduleItem[] = [];

  lines.forEach((line, index) => {
    // Regex looking for time range like 09:30 - 11:00 or 09:30-11:00
    const timeMatch = line.match(/(\d{1,2}:\d{2})\s*[-~至到]\s*(\d{1,2}:\d{2})/);
    if (timeMatch) {
      const startTime = normalizeTime(timeMatch[1]);
      const endTime = normalizeTime(timeMatch[2]);
      const afterTime = line.replace(timeMatch[0], '').replace(/^[\s|:：—\-]+/, '').trim();

      // Split remaining by pipe or whitespace
      const segments = afterTime.split(/[|丨]/).map((s) => s.trim()).filter(Boolean);
      const title = segments[0] || `事项 ${index + 1}`;
      
      let category: Category = 'research';
      let priority: Priority = 'p1';
      let note = '';

      if (segments.length > 1) {
        segments.slice(1).forEach((seg) => {
          const lower = seg.toLowerCase();
          if (CATEGORY_MAP[lower]) category = CATEGORY_MAP[lower];
          else if (PRIORITY_MAP[lower]) priority = PRIORITY_MAP[lower];
          else if (!note) note = seg;
        });
      }

      tasks.push({
        id: `ai_line_${Date.now()}_${index}`,
        title,
        startTime,
        endTime,
        date: targetDate,
        category,
        priority,
        note,
        isAllDay: false,
        repeat: 'none',
        completed: false,
        completedDates: [],
        focusMinutes: 0,
      });
    }
  });

  return tasks;
}
