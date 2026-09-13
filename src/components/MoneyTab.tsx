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
  AlertTriangle, 
  CheckCircle2, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
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
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculations
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
  // Factors: savings rate (target 20%+), expense ratio (<60%), positive cash flow
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
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              ${totalIncome.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Gross monthly inflow
          </p>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              ${totalExpenses.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-rose-400 flex items-center gap-1 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" /> Outflow & burn rate
          </p>
        </div>

        {/* Total Savings */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invested / Saved</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-indigo-300 tracking-tight">
              ${totalSavings.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-indigo-400 font-medium">
            {savingsRate}% monthly savings rate
          </p>
        </div>

        {/* Net Cash Reserve */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-extrabold tracking-tight ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${netCashFlow.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            {netCashFlow >= 0 ? 'Surplus ready for allocation' : 'Deficit alert'}
          </p>
        </div>

        {/* Financial Wellness Score */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Wellness Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{wellnessScore}</span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${wellnessScore}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            {wellnessScore >= 80 ? 'Grade A • Pristine discipline' : wellnessScore >= 60 ? 'Grade B • Healthy velocity' : 'Caution • Rebalance burn'}
          </span>
        </div>
      </div>

      {/* Top Spending Category Detector Banner */}
      {topSpendingCategory && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Top Outflow Detected:
                </span>
                <span className="text-sm font-extrabold text-white">{topSpendingCategory.name}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Consumes <span className="font-bold text-amber-300">${topSpendingCategory.value.toLocaleString()}</span> ({topSpendingPercentage}% of total outflow). Target keeping primary fixed overhead under 50% of gross income.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {topSpendingPercentage}% of Total Burn
            </span>
          </div>
        </div>
      )}

      {/* Visual Charts Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Cash Flow In vs Out */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Monthly Capital Flows</h3>
              <p className="text-xs text-slate-400">Income vs. Expenses vs. Savings</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Income
              <span className="w-2 h-2 rounded-full bg-rose-400 ml-2" /> Expenses
              <span className="w-2 h-2 rounded-full bg-indigo-400 ml-2" /> Savings
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Savings" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown Donut */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Outflow Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution across expense categories</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-indigo-400" />
          </div>
          {pieChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No expense transactions logged yet
            </div>
          ) : (
            <div className="h-64 w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Ledger Header & Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Financial Ledger</h3>
            <p className="text-xs text-slate-400">All registered inflows, outflows, and asset investments</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Type selector */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'income' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'expense' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setFilterType('savings')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'savings' ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Savings
              </button>
            </div>

            {/* Add Transaction Button */}
            <button
              id="money-add-tx-btn"
              onClick={onAddTransaction}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Transaction</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            id="money-search-input"
            type="text"
            placeholder="Search by description or category (e.g. Salary, Rent, LeetCode, Groceries)..."
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
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isSavings = tx.type === 'savings';

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
                          {isIncome ? '+' : isExpense ? '-' : ''}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          id={`delete-tx-${tx.id}`}
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
