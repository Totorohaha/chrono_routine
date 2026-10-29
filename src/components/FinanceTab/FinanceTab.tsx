import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  TrendingDown,
  TrendingUp,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  PieChart,
  Trash2,
  X,
} from 'lucide-react';
import { TransactionItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../UI/Toast';
import { HapticsService } from '../../services/haptics';
import { getTodayStr, parseLocalDate } from '../../utils/date';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './TransactionModal';

interface FinanceTabProps {
  transactions: TransactionItem[];
  onAddTransaction: () => void;
  onEditTransaction: (item: TransactionItem) => void;
  onDeleteTransaction: (id: string) => void;
  selectedCalendarDate: string;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  selectedCalendarDate,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const todayStr = getTodayStr();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => todayStr.slice(0, 7)); // YYYY-MM
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [syncWithCalendarDate, setSyncWithCalendarDate] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showBreakdown, setShowBreakdown] = useState<boolean>(true);

  // Month navigation
  const handlePrevMonth = () => {
    HapticsService.selection();
    const [y, m] = selectedMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    const yr = prev.getFullYear();
    const mo = String(prev.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yr}-${mo}`);
  };

  const handleNextMonth = () => {
    HapticsService.selection();
    const [y, m] = selectedMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    const yr = next.getFullYear();
    const mo = String(next.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yr}-${mo}`);
  };

  const handleResetToCurrentMonth = () => {
    HapticsService.selection();
    setSelectedMonth(todayStr.slice(0, 7));
  };

  // Month display label
  const monthDisplayLabel = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    if (language === 'zh') {
      return `${y}年${parseInt(m, 10)}月`;
    }
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [selectedMonth, language]);

  // Filter transactions for current month (or synced calendar date)
  const monthTransactions = useMemo(() => {
    return transactions.filter((item) => {
      if (syncWithCalendarDate) {
        return item.date === selectedCalendarDate;
      }
      return item.date.startsWith(selectedMonth);
    });
  }, [transactions, selectedMonth, syncWithCalendarDate, selectedCalendarDate]);

  // Monthly summary metrics
  const { totalExpense, totalIncome, netBalance, todayExpense, savingsRate } = useMemo(() => {
    let exp = 0;
    let inc = 0;
    monthTransactions.forEach((item) => {
      if (item.type === 'expense') {
        exp += item.amount;
      } else {
        inc += item.amount;
      }
    });

    let todayExp = 0;
    transactions.forEach((item) => {
      if (item.date === todayStr && item.type === 'expense') {
        todayExp += item.amount;
      }
    });

    const net = inc - exp;
    const rate = inc > 0 ? Math.round((net / inc) * 100) : 0;

    return {
      totalExpense: exp,
      totalIncome: inc,
      netBalance: net,
      todayExpense: todayExp,
      savingsRate: rate,
    };
  }, [monthTransactions, transactions, todayStr]);

  // Filtered transactions for the list
  const filteredTransactions = useMemo(() => {
    const query = searchKeyword.trim().toLowerCase();
    return monthTransactions
      .filter((item) => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (!query) return true;
        const noteMatch = (item.note || '').toLowerCase().includes(query);
        const catMatch = (item.categoryLabel || '').toLowerCase().includes(query);
        const amountMatch = String(item.amount).includes(query);
        return noteMatch || catMatch || amountMatch;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [monthTransactions, filterType, searchKeyword]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, { items: TransactionItem[]; dayExpense: number; dayIncome: number }> = {};
    filteredTransactions.forEach((item) => {
      if (!groups[item.date]) {
        groups[item.date] = { items: [], dayExpense: 0, dayIncome: 0 };
      }
      groups[item.date].items.push(item);
      if (item.type === 'expense') {
        groups[item.date].dayExpense += item.amount;
      } else {
        groups[item.date].dayIncome += item.amount;
      }
    });
    return groups;
  }, [filteredTransactions]);

  // Category breakdown for expenses
  const categoryBreakdownList = useMemo(() => {
    const map: Record<string, { catId: string; total: number; count: number }> = {};
    monthTransactions.forEach((item) => {
      if (item.type === 'expense') {
        if (!map[item.category]) {
          map[item.category] = { catId: item.category, total: 0, count: 0 };
        }
        map[item.category].total += item.amount;
        map[item.category].count += 1;
      }
    });

    return Object.values(map)
      .map((entry) => {
        const option = EXPENSE_CATEGORIES.find((c) => c.id === entry.catId) || {
          id: entry.catId,
          icon: '📦',
          labelKey: 'financeCatOtherExp',
          color: '#64748b',
          bgLight: 'bg-slate-100',
          bgDark: 'dark:bg-slate-800',
        };
        const percentage = totalExpense > 0 ? (entry.total / totalExpense) * 100 : 0;
        return {
          ...entry,
          option,
          percentage,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [monthTransactions, totalExpense]);

  // CSV Export
  const handleExportCSV = () => {
    HapticsService.success();
    if (monthTransactions.length === 0) {
      showToast(t('noTransactions'), 'info');
      return;
    }

    const headers = language === 'zh' ? '日期,类型,分类,金额,备注\n' : 'Date,Type,Category,Amount,Note\n';
    const rows = monthTransactions.map((item) => {
      const typeLabel = item.type === 'expense' ? t('transTypeExpense') : t('transTypeIncome');
      const catLabel = item.categoryLabel || item.category;
      const cleanNote = (item.note || '').replace(/,/g, ' ');
      return `${item.date},${typeLabel},${catLabel},${item.amount.toFixed(2)},"${cleanNote}"`;
    });

    const csvContent = '\uFEFF' + headers + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pulseflow_transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(t('exportCSVSuccess'), 'success');
  };

  // Helper to format date header
  const formatDateHeader = (dateStr: string) => {
    const d = parseLocalDate(dateStr);
    const isToday = dateStr === todayStr;
    const weekdayZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    const weekdayEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

    if (language === 'zh') {
      const monthDay = `${d.getMonth() + 1}月${d.getDate()}日`;
      return `${monthDay} ${weekdayZh} ${isToday ? '(今天)' : ''}`;
    }
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${monthDay} ${weekdayEn} ${isToday ? '(Today)' : ''}`;
  };

  // Find category option by ID
  const getCategoryMeta = (catId: string, type: 'expense' | 'income') => {
    const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return (
      list.find((c) => c.id === catId) || {
        id: catId,
        icon: type === 'expense' ? '💸' : '💰',
        labelKey: type === 'expense' ? 'financeCatOtherExp' : 'financeCatOtherInc',
        color: '#64748b',
        bgLight: 'bg-slate-100',
        bgDark: 'dark:bg-slate-800',
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-none">
      {/* Scrollable Content with Safe Bottom Padding */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-3 stable-scroll pb-8">
        {/* Month Selector & Action Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900/90 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handlePrevMonth}
              title={t('prevMonth')}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 px-0.5">
              {monthDisplayLabel}
            </span>
            <button
              onClick={handleNextMonth}
              title={t('nextMonth')}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {selectedMonth !== todayStr.slice(0, 7) && (
              <button
                onClick={handleResetToCurrentMonth}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded-lg hover:underline transition shrink-0"
              >
                {t('currentMonth')}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {/* Sync with calendar date toggle */}
            <button
              onClick={() => {
                HapticsService.selection();
                setSyncWithCalendarDate(!syncWithCalendarDate);
              }}
              title={syncWithCalendarDate ? t('viewAllMonth') : t('filterBySelectedDate')}
              className={`px-2 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 transition active:scale-95 shrink-0 ${
                syncWithCalendarDate
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono whitespace-nowrap">
                {syncWithCalendarDate ? selectedCalendarDate.slice(5) : t('filterBySelectedDate')}
              </span>
            </button>

            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              title={t('exportCSV')}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Financial Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-4 shadow-xl border border-teal-500/20 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

          {/* Top Row: Total Expense & Quick Today Pill */}
          <div className="flex items-center justify-between relative z-10 mb-3 gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{t('monthExpense')}</span>
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white mt-0.5 truncate">
                <span className="text-lg text-slate-400 mr-1 font-bold">¥</span>
                {totalExpense.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="text-right shrink-0 bg-teal-950/70 border border-teal-500/30 px-2.5 py-1 rounded-2xl">
              <span className="text-[10px] text-teal-300/80 font-medium block leading-tight">
                {t('todayExpense')}
              </span>
              <span className="text-xs font-bold font-mono text-teal-300 block leading-tight mt-0.5">
                ¥{todayExpense.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bottom Row: Income & Net Balance */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 relative z-10">
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1 truncate">
                <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{t('monthIncome')}</span>
              </span>
              <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-0.5 truncate">
                ¥{totalIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5 truncate">
                <span className="truncate">{t('monthBalance')}</span>
                {totalIncome > 0 && (
                  <span className="text-[10px] text-teal-300 font-mono bg-teal-900/60 px-1 py-0.2 rounded shrink-0">
                    {savingsRate}%
                  </span>
                )}
              </span>
              <div
                className={`text-sm sm:text-base font-bold font-mono mt-0.5 truncate ${
                  netBalance >= 0 ? 'text-teal-300' : 'text-rose-400'
                }`}
              >
                {netBalance >= 0 ? '+' : ''}¥
                {netBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Button: "记一笔" */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              HapticsService.medium();
              onAddTransaction();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-teal-600/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{t('addTransactionBtn')}</span>
          </button>
        </div>

        {/* Category Breakdown Widget (Collapsible) */}
        {categoryBreakdownList.length > 0 && (
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 dark:text-slate-200 mb-2"
            >
              <div className="flex items-center space-x-1.5">
                <PieChart className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{t('categoryBreakdown')}</span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {categoryBreakdownList.length} {t('scheduleItemsCount')} · {showBreakdown ? '收起' : '展开'}
              </span>
            </button>

            {showBreakdown && (
              <div className="space-y-2 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                {categoryBreakdownList.slice(0, 5).map((item) => (
                  <div key={item.catId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-medium min-w-0 pr-2">
                        <span className="shrink-0">{item.option.icon}</span>
                        <span className="truncate">{t(item.option.labelKey as any)}</span>
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400 shrink-0">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1.5">
                          {item.percentage.toFixed(1)}%
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          ¥{item.total.toFixed(2)}
                        </span>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(3, item.percentage))}%`,
                          backgroundColor: item.option.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="space-y-2 pt-0.5">
          {/* Full-width Search Bar with Clear Button */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('searchTransPlaceholder')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 transition"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons and Records Count */}
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <button
                onClick={() => {
                  HapticsService.selection();
                  setFilterType('all');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {t('filterAllTrans')}
              </button>
              <button
                onClick={() => {
                  HapticsService.selection();
                  setFilterType('expense');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {t('filterExpOnly')}
              </button>
              <button
                onClick={() => {
                  HapticsService.selection();
                  setFilterType('income');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'income'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {t('filterIncOnly')}
              </button>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="font-semibold">{t('transactionList')}</span>
              <span className="text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full text-[11px]">
                {filteredTransactions.length} {t('totalRecords')}
              </span>
            </div>
          </div>
        </div>

        {/* Transactions List Grouped by Date */}
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl mb-3 shadow-inner">
              🪙
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('noTransactions')}</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{t('noTransactionsDesc')}</p>
            <button
              onClick={() => {
                HapticsService.medium();
                onAddTransaction();
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 active:scale-95 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('addTransactionBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {Object.entries(groupedTransactions).map(([dateStr, group]) => (
              <div key={dateStr} className="space-y-1.5">
                {/* Date Header with Daily Subtotal */}
                <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold font-mono truncate pr-2">{formatDateHeader(dateStr)}</span>
                  <div className="space-x-2 font-mono text-[11px] shrink-0">
                    {group.dayExpense > 0 && (
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        支 ¥{group.dayExpense.toFixed(2)}
                      </span>
                    )}
                    {group.dayIncome > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        收 ¥{group.dayIncome.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Transactions on this date */}
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
                  {group.items.map((item) => {
                    const meta = getCategoryMeta(item.category, item.type);
                    const isExpense = item.type === 'expense';

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          HapticsService.selection();
                          onEditTransaction(item);
                        }}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        {/* Left: Icon & Note/Category */}
                        <div className="flex items-center space-x-3 min-w-0 flex-1 pr-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${meta.bgLight} ${meta.bgDark}`}
                          >
                            {meta.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {item.note || t(meta.labelKey as any)}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 truncate">
                              <span className="shrink-0">{t(meta.labelKey as any)}</span>
                              {item.note && <span className="text-slate-300 dark:text-slate-600 shrink-0">·</span>}
                              {item.note && <span className="truncate">{item.note}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Quick Delete */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <div
                            className={`text-sm font-bold font-mono tracking-tight ${
                              isExpense ? 'text-slate-800 dark:text-slate-100' : 'text-emerald-500 font-extrabold'
                            }`}
                          >
                            {isExpense ? '-' : '+'}¥{item.amount.toFixed(2)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(t('deleteTransConfirm'))) {
                                HapticsService.medium();
                                onDeleteTransaction(item.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 transition rounded-lg"
                            title={t('deleteTransBtn')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
