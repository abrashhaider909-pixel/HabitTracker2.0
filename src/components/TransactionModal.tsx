import React, { useState } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => void;
  defaultDate: string;
}

const COMMON_CATEGORIES: Record<TransactionType, string[]> = {
  income: [
    'Engineering Salary',
    'Consulting / Freelance',
    'Bonus / Equity',
    'Dividends / Interest',
    'Side Project / SaaS',
    'Other Inflow',
  ],
  expense: [
    'Housing & Utilities',
    'Food & Nutrition',
    'Tech & Learning',
    'Health & Gym',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Other Outflow',
  ],
  savings: [
    'Index Funds & S&P 500',
    'Emergency Reserve',
    'Crypto / Alternative',
    'Real Estate Fund',
    'High Yield Savings',
  ],
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultDate,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(COMMON_CATEGORIES.expense[0]);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate);
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(COMMON_CATEGORIES[newType][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!description.trim()) return;

    onSave({
      type,
      amount: parsedAmount,
      category,
      description: description.trim(),
      date,
      paymentMethod,
    });
    // Reset
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Log Financial Transaction
            </h3>
            <p className="text-xs text-slate-500">Record cash inflow, outflow, or reserve</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type Selector (Income, Expense, Savings) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transaction Classification
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Income</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                <span>Expense</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('savings')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'savings'
                    ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Savings</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">$</span>
              <input
                id="tx-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0F766E] font-mono font-bold transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              id="tx-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all cursor-pointer"
            >
              {COMMON_CATEGORIES[type].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <input
              id="tx-desc-input"
              type="text"
              required
              placeholder="e.g. Organic grocery store or Monthly cloud hosting"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction Date
              </label>
              <input
                id="tx-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0F766E] font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                id="tx-payment-channel"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all cursor-pointer"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit / Checking">Debit / Checking</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Direct Deposit">Direct Deposit</option>
                <option value="Cash / Other">Cash / Other</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-tx-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
