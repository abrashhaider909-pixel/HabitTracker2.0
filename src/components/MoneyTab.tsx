import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  PieChart as PieChartIcon, 
  Plus, 
  Search, 
  Trash2, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Transaction, TransactionType } from '../types';

interface MoneyTabProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onRefreshSupabase?: () => Promise<void>;
  isSyncingSupabase?: boolean;
}

const PIE_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#64748b', // Slate
];

export const MoneyTab: React.FC<MoneyTabProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onRefreshSupabase,
  isSyncingSupabase = false,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculations from real transactions
  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalSavings = useMemo(() => {
    return transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const netCashFlow = totalIncome - totalExpenses - totalSavings;

  // Savings rate calculation
  const savingsRate = totalIncome > 0
    ? Math.round((totalSavings / totalIncome) * 100)
    : 0;

  // Financial Wellness Score (0 - 100)
  const wellnessScore = useMemo(() => {
    if (totalIncome === 0) return 50;
    let score = 50;
    // Savings score (up to +30 points)
    score += Math.min(30, savingsRate * 1.2);
    // Expense control (up to +20 points)
    const expenseRatio = totalExpenses / totalIncome;
    if (expenseRatio <= 0.5) score += 20;
    else if (expenseRatio <= 0.7) score += 10;
    else score -= 15;
    // Surplus check
    if (netCashFlow >= 0) score += 10;
    else score -= 15;

    return Math.min(100, Math.max(10, Math.round(score)));
  }, [totalIncome, totalExpenses, totalSavings, savingsRate, netCashFlow]);

  // Top spending category detector
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const topSpendingCategory = expenseByCategory[0] || null;
  const topSpendingPercentage = (topSpendingCategory && totalExpenses > 0)
    ? Math.round((topSpendingCategory.value / totalExpenses) * 100)
    : 0;

  // Visual Chart 1: Cash Flow Comparison data
  const cashFlowChartData = [
    {
      name: 'Total Flows',
      Income: totalIncome,
      Expenses: totalExpenses,
      Savings: totalSavings,
    },
  ];

  // Visual Chart 2: Category Pie Data
  const pieChartData = expenseByCategory.map(item => ({
    name: item.name,
    value: item.value,
  }));

  // Filtered transactions for ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        if (!matchDesc && !matchCat) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Cloud Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Money Track &amp; Financial OS
            </h2>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{transactions.length} records</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cash flow, category breakdowns, and wealth building targets
          </p>
        </div>

        {/* Sync & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onRefreshSupabase && (
            <button
              id="refresh-supabase-btn"
              onClick={() => onRefreshSupabase()}
              disabled={isSyncingSupabase}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
              title="Pull latest real transactions from Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>{isSyncingSupabase ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>
          )}

          <button
            id="money-add-tx-btn-top"
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Salary, consulting, SaaS inflow</p>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 tracking-tight font-mono">
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Living, tech tools, operations</p>
        </div>

        {/* Total Savings */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings &amp; Assets</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-400 tracking-tight font-mono">
              ${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Index funds, emergency, investments</p>
        </div>

        {/* Net Free Cashflow */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              netCashFlow >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {netCashFlow >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tight font-mono ${
              netCashFlow >= 0 ? 'text-white' : 'text-rose-400'
            }`}>
              {netCashFlow < 0 ? '-' : ''}${Math.abs(netCashFlow).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {netCashFlow >= 0 ? 'Surplus capital retained' : 'Deficit / overspending alert'}
          </p>
        </div>

        {/* Financial Discipline Score */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Score</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 tracking-tight font-mono">
              {wellnessScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                wellnessScore >= 80 ? 'bg-emerald-400' : wellnessScore >= 60 ? 'bg-indigo-400' : 'bg-rose-400'
              }`}
              style={{ width: `${wellnessScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Comparison Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Cash Inflow vs Outflow</h3>
              <p className="text-xs text-slate-400">Balance between income, lifestyle burn, and wealth allocation</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Savings Rate: {savingsRate}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Savings" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Expense Distribution</h3>
              <p className="text-xs text-slate-400">Where capital is being spent</p>
            </div>
            {topSpendingCategory && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
                Top: {topSpendingCategory.name} ({topSpendingPercentage}%)
              </span>
            )}
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pieChartData.length === 0 ? (
              <div className="text-center text-slate-500 text-xs">
                <PieChartIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>No expense data logged yet.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Spent']}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Ledger Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        {/* Ledger Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Financial Ledger</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                ({filteredTransactions.length} of {transactions.length})
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete historical record of cash flows &amp; balance updates
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'income' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'expense' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilterType('savings')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'savings' ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Savings
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            id="money-search-input"
            type="text"
            placeholder="Search by description or category (e.g. Salary, Rent, AWS, Groceries)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Wallet className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">
                        {transactions.length === 0
                          ? 'No transactions recorded yet'
                          : 'No transactions match your search filter'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {transactions.length === 0
                          ? 'Log your real income, expenses, or savings to start tracking your cash flow.'
                          : 'Try clearing your search query or switching filters.'}
                      </p>
                      {transactions.length === 0 && (
                        <div className="pt-2 flex items-center justify-center gap-2">
                          <button
                            onClick={onAddTransaction}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            + Log First Transaction
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          isIncome 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isExpense
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {tx.paymentMethod || 'Card'}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap font-mono">
                        <span className={
                          isIncome 
                            ? 'text-emerald-400' 
                            : isExpense 
                            ? 'text-rose-400' 
                            : 'text-indigo-300'
                        }>
                          {isIncome ? '+' : isExpense ? '-' : ''}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          id={`delete-tx-${tx.id}`}
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
