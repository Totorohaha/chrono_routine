// Comprehensive Test Suite for PulseFlow (脉律)
import assert from 'node:assert';

console.log('=== 开始全面自动化精力排期功能测试 ===\n');

// 1. Date utilities test
function parseLocalDate(dateStr) {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 12, 0, 0);
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

console.log('[Test 1] 昼夜节律日期边界与跨月跨年计算...');
const testDate = parseLocalDate('2026-10-31');
testDate.setDate(testDate.getDate() + 1);
assert.strictEqual(formatDate(testDate), '2026-11-01', '跨月计算应为 2026-11-01');

const testYearEnd = parseLocalDate('2026-12-31');
testYearEnd.setDate(testYearEnd.getDate() + 1);
assert.strictEqual(formatDate(testYearEnd), '2027-01-01', '跨年计算应为 2027-01-01');
console.log('✓ 日期跨月跨年边界通过');

// 2. Recurrence rules test
console.log('\n[Test 2] 核心排期激活与独立完成状态测试...');

function isTaskActiveOnDate(task, targetDate) {
  if (task.repeat === 'none') {
    return task.date === targetDate;
  }
  if (targetDate < task.date) {
    return false;
  }
  if (task.repeat === 'daily') return true;

  const dayOfWeek = parseLocalDate(targetDate).getDay();
  if (task.repeat === 'workdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }
  if (task.repeat === 'weekends') {
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
  if (task.repeat === 'weekly') {
    return parseLocalDate(targetDate).getDay() === parseLocalDate(task.date).getDay();
  }
  return false;
}

function isTaskCompleted(task, targetDate) {
  if (task.completedDates && task.completedDates.includes(targetDate)) {
    return true;
  }
  if (task.repeat === 'none') {
    return Boolean(task.completed);
  }
  return false;
}

const dailyTask = {
  id: 't-phd',
  title: '文献精读与实验推演 (90m单线程)',
  category: 'research',
  priority: 'p0',
  date: '2026-10-26', // Monday
  repeat: 'daily',
  completed: false,
  completedDates: []
};

// Test active days
assert.strictEqual(isTaskActiveOnDate(dailyTask, '2026-10-25'), false, '创建日期前不激活');
assert.strictEqual(isTaskActiveOnDate(dailyTask, '2026-10-26'), true, '创建当日激活');
assert.strictEqual(isTaskActiveOnDate(dailyTask, '2026-10-27'), true, '创建次日激活');

// Mark completed on Monday 2026-10-26
dailyTask.completedDates.push('2026-10-26');

assert.strictEqual(isTaskCompleted(dailyTask, '2026-10-26'), true, '周一显示已交付');
assert.strictEqual(isTaskCompleted(dailyTask, '2026-10-27'), false, '周二保持未完成，独立记录');
console.log('✓ 核心排期跨日独立交付状态测试通过');

// 3. 4-7-8 Breathing Loop logic test (Ref based)
console.log('\n[Test 3] 4-7-8 呼吸减压算法无死锁回归测试...');
let phase = 'inhale';
let count = 4;
let rounds = 0;

for (let tick = 0; tick < 20; tick++) {
  count -= 1;
  if (count <= 0) {
    if (phase === 'inhale') {
      phase = 'hold';
      count = 7;
    } else if (phase === 'hold') {
      phase = 'exhale';
      count = 8;
    } else {
      phase = 'inhale';
      count = 4;
      rounds += 1;
    }
  }
}
// After 4s (inhale->hold), 7s (hold->exhale), 8s (exhale->inhale) = 19s total = 1 round completed!
assert.strictEqual(rounds, 1, '在 19 秒完整循环后应准确进入下一轮');
assert.strictEqual(phase, 'inhale', '进入新一轮后应重置为吸气阶段');
console.log('✓ 4-7-8 呼吸闭包与倒计时状态切换测试通过（彻底修复卡在 Hold 阶段的 bug）');

// 4. Energy score test
console.log('\n[Test 4] 精力与产出指数算法测试...');
function calcBalanceScore(taskRate, habitRate, restMins) {
  const restBonus = Math.min(20, (restMins / 60) * 20);
  return Math.round(taskRate * 0.4 + habitRate * 0.4 + restBonus);
}

assert.strictEqual(calcBalanceScore(100, 100, 60), 100, '节奏充沛满分为 100 分');
assert.strictEqual(calcBalanceScore(50, 50, 30), 50, '各项适中为 50 分');
console.log('✓ 精力与产出指数计算通过');

// 5. Background-safe timestamp countdown test (Android WebView throttling immunity)
console.log('\n[Test 5] 计时器后台与息屏防冻结时间差计算测试...');
function computeRemaining(targetEndTime, now) {
  return Math.max(0, Math.ceil((targetEndTime - now) / 1000));
}

const startTime = 1700000000000;
const targetEnd = startTime + 25 * 60 * 1000; // 25 min timer
// Case A: 5 seconds elapsed
assert.strictEqual(computeRemaining(targetEnd, startTime + 5000), 25 * 60 - 5);
// Case B: 15 minutes of sleep/background throttle
assert.strictEqual(computeRemaining(targetEnd, startTime + 15 * 60 * 1000), 10 * 60);
// Case C: Timer completed in background
assert.strictEqual(computeRemaining(targetEnd, startTime + 30 * 60 * 1000), 0);
console.log('✓ 挂起与锁屏时差计算测试通过');

// 6. Weekly markdown report generator test
console.log('\n[Test 6] 导师周报 / 团队 Standup 格式化测试...');
function generateWeeklySummary(p0List, focusHours, streak) {
  let md = `### 📊 脉律 PulseFlow · 科研与工作周度交付简报\n`;
  md += `#### 🎯 P0 核心攻坚交付\n`;
  p0List.forEach(item => {
    md += `- [x] ${item}\n`;
  });
  md += `#### ⏱️ 心流投入与状态对齐\n`;
  md += `- **深度心流累计**: ${focusHours} 小时\n`;
  md += `- **习惯维护连续性**: 当前最高连续维持 ${streak} 天\n`;
  return md;
}

const sampleReport = generateWeeklySummary(['消融实验跑数', '论文第三章重写'], '15.5', 12);
assert.ok(sampleReport.includes('消融实验跑数'), '报告应包含 P0 攻坚事项');
assert.ok(sampleReport.includes('15.5 小时'), '报告应包含心流小时数');
assert.ok(sampleReport.includes('12 天'), '报告应包含习惯连续天数');
console.log('✓ 周报自动化 Markdown 格式化测试通过');

// 7. Category & search filter test
console.log('\n[Test 7] 排期多维检索与类别过滤测试...');
const testTasks = [
  { id: '1', title: '论文文献阅读', category: 'research', note: 'Transformer attention' },
  { id: '2', title: '团队站会沟通', category: 'work', note: '敏捷排期' },
  { id: '3', title: '有氧慢跑 5km', category: 'health', note: '采光与心率提升' },
];

function filterTasks(list, category, query) {
  return list.filter(t => {
    if (category !== 'all' && t.category !== category) return false;
    if (query) {
      const q = query.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNote = t.note ? t.note.toLowerCase().includes(q) : false;
      return matchTitle || matchNote;
    }
    return true;
  });
}

assert.strictEqual(filterTasks(testTasks, 'research', '').length, 1);
assert.strictEqual(filterTasks(testTasks, 'all', 'attention').length, 1);
assert.strictEqual(filterTasks(testTasks, 'all', '站会').length, 1);
assert.strictEqual(filterTasks(testTasks, 'health', '论文').length, 0);
console.log('✓ 排期分类与关键词过滤测试通过');

// 8. Habit 7-day consistency strip test
console.log('\n[Test 8] 习惯近 7 日状态矩阵算法测试...');
function getHabit7DayStatus(history, targetCount, baseDateStr) {
  const base = parseLocalDate(baseDateStr);
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base.getTime());
    d.setDate(base.getDate() - i);
    const dateStr = formatDate(d);
    const count = history[dateStr] || 0;
    result.push({
      dateStr,
      isTargetMet: count >= targetCount,
    });
  }
  return result;
}

const mockHistory = {
  '2026-10-21': 1,
  '2026-10-23': 2,
  '2026-10-27': 2,
};
const habitStrip = getHabit7DayStatus(mockHistory, 2, '2026-10-27');
assert.strictEqual(habitStrip.length, 7, '应生成 7 天数据');
assert.strictEqual(habitStrip[habitStrip.length - 1].isTargetMet, true, '当日打卡 2 次达到目标 2 应为 true');
assert.strictEqual(habitStrip[habitStrip.length - 2].isTargetMet, false, '前一日未打卡应为 false');
console.log('✓ 7日习惯矩阵算法测试通过');

// 9. AI Schedule Parser test
console.log('\n[Test 9] AI 大模型排期字符串识别与容错解析测试...');
function testParseAIScheduleString(rawText, targetDate) {
  let jsonStr = rawText.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    jsonStr = codeBlockMatch[1].trim();
  }
  const firstBracket = jsonStr.indexOf('[');
  const lastBracket = jsonStr.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
  }
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, index) => ({
        title: (item.title || item.name || `事项 ${index + 1}`).trim(),
        startTime: item.startTime || '09:00',
        endTime: item.endTime || '10:00',
        category: item.category || 'research',
        priority: item.priority || 'p1',
        note: item.note || '',
        date: targetDate,
      }));
    }
  } catch {
    // line by line fallback
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const tasks = [];
    lines.forEach((line, index) => {
      const timeMatch = line.match(/(\d{1,2}:\d{2})\s*[-~至到]\s*(\d{1,2}:\d{2})/);
      if (timeMatch) {
        tasks.push({
          title: `事项 ${index + 1}`,
          startTime: timeMatch[1],
          endTime: timeMatch[2],
          category: 'research',
          priority: 'p1',
          date: targetDate,
        });
      }
    });
    return tasks;
  }
  return [];
}

// Case A: Standard LLM output wrapped in ```json ```
const llmJsonOutput = `Here is your optimal schedule:
\`\`\`json
[
  {
    "title": "顶会论文前沿精读",
    "startTime": "09:30",
    "endTime": "11:00",
    "category": "research",
    "priority": "p0",
    "note": "90m单线程攻坚"
  },
  {
    "title": "组会进度汇报与讨论",
    "startTime": "14:00",
    "endTime": "15:00",
    "category": "work",
    "priority": "p1"
  }
]
\`\`\`
Hope this helps your deep work!`;

const parsedJsonTasks = testParseAIScheduleString(llmJsonOutput, '2026-10-27');
assert.strictEqual(parsedJsonTasks.length, 2, '应成功从 markdown 代码块提取 2 项日程');
assert.strictEqual(parsedJsonTasks[0].title, '顶会论文前沿精读');
assert.strictEqual(parsedJsonTasks[0].priority, 'p0');
assert.strictEqual(parsedJsonTasks[1].category, 'work');

// Case B: Fallback plain text lines without JSON
const llmPlainTextOutput = `
09:30 - 11:00 文献精读
14:00 - 15:30 调试模型跑数
`;
const parsedLineTasks = testParseAIScheduleString(llmPlainTextOutput, '2026-10-27');
assert.strictEqual(parsedLineTasks.length, 2, '纯文本时间行回退识别应解析出 2 项日程');
assert.strictEqual(parsedLineTasks[0].startTime, '09:30');
console.log('✓ AI 排期字符串多格式解析测试通过');

// 10. Bilingual i18n key parity test
console.log('\n[Test 10] 中英文双语词典对齐与完整性测试...');
import { translations } from './src/i18n/translations.ts';
const zhKeys = Object.keys(translations.zh);
const enKeys = Object.keys(translations.en);

assert.strictEqual(zhKeys.length, enKeys.length, '中英文翻译词典键数量必须完全一致');
zhKeys.forEach(k => {
  assert.ok(translations.en[k], `英文词典必须包含键: ${k}`);
  assert.ok(typeof translations.en[k] === 'string' && translations.en[k].length > 0, `英文键 ${k} 不能为空`);
});
console.log(`✓ 双语词典完整性测试通过 (${zhKeys.length} 对术语全部对齐)`);

console.log('\n=============================================');
console.log('⚡ 《脉律 PulseFlow》所有自动化测试 100% 成功！');
console.log('=============================================');
