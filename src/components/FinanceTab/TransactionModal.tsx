import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Calendar, Tag, FileText, DollarSign } from 'lucide-react';
import { TransactionItem, TransactionType } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { HapticsService } from '../../services/haptics';
import { getTodayStr } from '../../utils/date';

export interface CategoryOption {
  id: string;
  icon: string;
  labelKey: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { id: 'food', icon: '🍔', labelKey: 'financeCatFood', color: '#f97316', bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-950/40' },
  { id: 'transport', icon: '🚇', labelKey: 'financeCatTransport', color: '#3b82f6', bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-950/40' },
  { id: 'shopping', icon: '🛍️', labelKey: 'financeCatShopping', color: '#ec4899', bgLight: 'bg-pink-50', bgDark: 'dark:bg-pink-950/40' },
  { id: 'housing', icon: '🏠', labelKey: 'financeCatHousing', color: '#8b5cf6', bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-950/40' },
  { id: 'entertainment', icon: '🎮', labelKey: 'financeCatEntertainment', color: '#06b6d4', bgLight: 'bg-cyan-50', bgDark: 'dark:bg-cyan-950/40' },
  { id: 'learning', icon: '📚', labelKey: 'financeCatLearning', color: '#10b981', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-950/40' },
  { id: 'medical', icon: '💊', labelKey: 'financeCatMedical', color: '#f43f5e', bgLight: 'bg-rose-50', bgDark: 'dark:bg-rose-950/40' },
  { id: 'social', icon: '🎁', labelKey: 'financeCatSocial', color: '#eab308', bgLight: 'bg-yellow-50', bgDark: 'dark:bg-yellow-950/40' },
  { id: 'other_exp', icon: '📦', labelKey: 'financeCatOtherExp', color: '#64748b', bgLight: 'bg-slate-100', bgDark: 'dark:bg-slate-800' },
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  { id: 'salary', icon: '💼', labelKey: 'financeCatSalary', color: '#10b981', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-950/40' },
  { id: 'freelance', icon: '💻', labelKey: 'financeCatFreelance', color: '#06b6d4', bgLight: 'bg-cyan-50', bgDark: 'dark:bg-cyan-950/40' },
  { id: 'investment', icon: '📈', labelKey: 'financeCatInvestment', color: '#f59e0b', bgLight: 'bg-amber-50', bgDark: 'dark:bg-amber-950/40' },
  { id: 'bonus', icon: '🧧', labelKey: 'financeCatBonus', color: '#ec4899', bgLight: 'bg-pink-50', bgDark: 'dark:bg-pink-950/40' },
  { id: 'reimburse', icon: '🧾', labelKey: 'financeCatReimburse', color: '#8b5cf6', bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-950/40' },
  { id: 'other_inc', icon: '💰', labelKey: 'financeCatOtherInc', color: '#14b8a6', bgLight: 'bg-teal-50', bgDark: 'dark:bg-teal-950/40' },
];

const QUICK_AMOUNT_PRESETS = [10, 20, 50, 100, 200, 500];

const QUICK_NOTE_SUGGESTIONS = [
  'noteBreakfast',
  'noteLunch',
  'noteDinner',
  'noteCoffee',
  'noteSubway',
  'noteTaxi',
  'noteGroceries',
  'noteDaily',
  'notePhone',
];

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    type: TransactionType;
    amount: number;
    category: string;
    categoryLabel: string;
    categoryLabelEn: string;
    date: string;
    note: string;
  }) => void;
  onDelete?: (id: string) => void;
  initialData?: TransactionItem | null;
  defaultDate?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultDate,
}) => {
  const { t, language } = useLanguage();
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCatId, setSelectedCatId] = useState<string>('food');
  const [date, setDate] = useState<string>(getTodayStr());
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(String(initialData.amount));
      setSelectedCatId(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note || '');
    } else {
      setType('expense');
      setAmountStr('');
      setSelectedCatId('food');
      setDate(defaultDate || getTodayStr());
      setNote('');
    }
    setErrorMessage('');
  }, [initialData, defaultDate, isOpen]);

  // Adjust default category when switching type
  const handleTypeChange = (newType: TransactionType) => {
    HapticsService.selection();
    setType(newType);
    if (newType === 'expense' && !EXPENSE_CATEGORIES.some((c) => c.id === selectedCatId)) {
      setSelectedCatId(EXPENSE_CATEGORIES[0].id);
    } else if (newType === 'income' && !INCOME_CATEGORIES.some((c) => c.id === selectedCatId)) {
      setSelectedCatId(INCOME_CATEGORIES[0].id);
    }
  };

  const handleQuickAddAmount = (val: number) => {
    HapticsService.selection();
    const current = parseFloat(amountStr) || 0;
    const next = (current + val).toFixed(2);
    setAmountStr(next.endsWith('.00') ? String(current + val) : next);
    setErrorMessage('');
  };

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const activeCategory = currentCategories.find((c) => c.id === selectedCatId) || currentCategories[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) {
      setErrorMessage(t('amountRequiredError'));
      return;
    }

    HapticsService.success();
    onSave({
      id: initialData?.id,
      type,
      amount: Math.round(val * 100) / 100,
      category: activeCategory.id,
      categoryLabel: t(activeCategory.labelKey as any),
      categoryLabelEn: activeCategory.labelKey,
      date,
      note: note.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (initialData && onDelete && confirm(t('deleteTransConfirm'))) {
      HapticsService.medium();
      onDelete(initialData.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              🪙
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {initialData ? t('editTransactionModalTitle') : t('addTransactionModalTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 stable-scroll min-h-0">
          {/* Expense / Income Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-sm font-bold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.01]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              💸 {t('transTypeExpense')}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-sm font-bold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.01]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              💰 {t('transTypeIncome')}
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-500" />
                <span>{t('transAmountLabel')}</span>
              </span>
              {errorMessage && <span className="text-xs text-rose-500 font-medium">{errorMessage}</span>}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold font-mono text-slate-400 dark:text-slate-500 select-none">
                ¥
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={t('transAmountPlaceholder')}
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoFocus={!initialData}
                className="w-full pl-10 pr-4 py-3 text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap mr-0.5">
                {t('quickAmounts')}:
              </span>
              {QUICK_AMOUNT_PRESETS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition active:scale-95 shrink-0"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-teal-500" />
              <span>{t('transCategoryLabel')}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {currentCategories.map((cat) => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      HapticsService.selection();
                      setSelectedCatId(cat.id);
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl border text-center transition-all active:scale-95 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/90 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold shadow-xs ring-1 ring-teal-500/40'
                        : 'border-slate-200/70 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl mb-1 shrink-0">{cat.icon}</span>
                    <span className="text-xs font-semibold leading-tight w-full text-center truncate px-0.5">
                      {t(cat.labelKey as any)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-teal-500" />
              <span>{t('transDateLabel')}</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition font-mono"
            />
          </div>

          {/* Note Input & Quick Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-teal-500" />
              <span>{t('transNoteLabel')}</span>
            </label>
            <input
              type="text"
              placeholder={t('transNotePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={40}
              className="w-full px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
            />

            {/* Quick Note Suggestions */}
            <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap mr-0.5">
                {t('quickNotes')}:
              </span>
              {QUICK_NOTE_SUGGESTIONS.map((key) => {
                const label = t(key as any);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      HapticsService.selection();
                      setNote(label);
                    }}
                    className="px-2.5 py-0.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95 shrink-0"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          {initialData && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center space-x-1 text-xs font-semibold"
              title={t('deleteTransBtn')}
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('deleteTransBtn')}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30 active:scale-95 transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{t('saveTransBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
