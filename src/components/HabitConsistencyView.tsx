import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Award, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  BarChart3,
  CalendarCheck2,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell 
} from 'recharts';
import { Habit, LifeDimension } from '../types';
import { getTodayDateStr, addDays, parseLocalDate } from '../lib/dateUtils';

interface HabitConsistencyViewProps {
  habits: Habit[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleHabitDate: (habitId: string, date: string) => void;
}

export const HabitConsistencyView: React.FC<HabitConsistencyViewProps> = ({
  habits,
  selectedDate,
  onSelectDate,
  onToggleHabitDate,
}) => {
  const [subView, setSubView] = useState<'matrix' | 'chart' | 'calendar'>('matrix');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [hoveredCell, setHoveredCell] = useState<{ habitId: string; date: string } | null>(null);

  // Generate the list of the past 30 days (up to today)
  const past30Days = useMemo(() => {
    const days: Array<{
      dateStr: string;
      dayNum: number;
      dayName: string;
      monthName: string;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const todayStr = getTodayDateStr();

    for (let i = 29; i >= 0; i--) {
      const dateStr = addDays(todayStr, -i);
      const d = parseLocalDate(dateStr);
      days.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      });
    }
    return days;
  }, [selectedDate]);

  // Filter habits if category selected
  const filteredHabits = useMemo(() => {
    if (activeCategoryFilter === 'all') return habits;
    return habits.filter(h => h.category === activeCategoryFilter);
  }, [habits, activeCategoryFilter]);

  // 30-day completion data for the recharts graph
  const chartData = useMemo(() => {
    const totalHabits = habits.length;
    return past30Days.map(day => {
      const completedOnDay = habits.filter(h => h.completedDates.includes(day.dateStr)).length;
      const percentage = totalHabits > 0 ? Math.round((completedOnDay / totalHabits) * 100) : 0;
      return {
        date: day.dateStr,
        label: `${day.monthName} ${day.dayNum}`,
        completed: completedOnDay,
        total: totalHabits,
        percentage,
        isToday: day.isToday,
      };
    });
  }, [past30Days, habits]);

  // Overall 30-day stats
  const overall30DayStats = useMemo(() => {
    if (habits.length === 0) return { avgRate: 0, totalCompletions: 0, bestDay: 'N/A' };
    let totalPossible = past30Days.length * habits.length;
    let totalCompleted = 0;
    let maxOnSingleDay = -1;
    let bestDayStr = 'N/A';

    past30Days.forEach(day => {
      const count = habits.filter(h => h.completedDates.includes(day.dateStr)).length;
      totalCompleted += count;
      if (count > maxOnSingleDay) {
        maxOnSingleDay = count;
        bestDayStr = `${day.monthName} ${day.dayNum}`;
      }
    });

    return {
      avgRate: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
      totalCompletions: totalCompleted,
      bestDay: bestDayStr,
      maxOnSingleDay,
    };
  }, [past30Days, habits]);

  // Helper to compute consistency badge
  const getConsistencyTier = (completedCount: number, totalDays: number = 30) => {
    const pct = (completedCount / totalDays) * 100;
    if (pct >= 85) return { label: 'Titan', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (pct >= 70) return { label: 'Disciplined', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (pct >= 50) return { label: 'Steady', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    return { label: 'Building', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              30-Day Average Consistency
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {overall30DayStats.avgRate}%
            </span>
            <span className="text-xs text-slate-400">across all routines</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overall30DayStats.avgRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Completions (Month)
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 tracking-tight">
              {overall30DayStats.totalCompletions}
            </span>
            <span className="text-xs text-slate-400">habits logged</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Peak execution day: <strong className="text-slate-200">{overall30DayStats.bestDay}</strong>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Highest Active Streak
            </span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-300 tracking-tight">
              {habits.reduce((max, h) => Math.max(max, h.streak), 0)}
            </span>
            <span className="text-xs text-slate-400">consecutive days</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Never miss twice: protect your daily chain
          </p>
        </div>
      </div>

      {/* Sub-view Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-900/60 border border-slate-800 rounded-2xl">
        {/* View Switcher */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
          <button
            id="view-switch-matrix"
            onClick={() => setSubView('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subView === 'matrix' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>30-Day Heatmap Matrix</span>
          </button>

          <button
            id="view-switch-chart"
            onClick={() => setSubView('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subView === 'chart' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Consistency Trend Graph</span>
          </button>

          <button
            id="view-switch-calendar"
            onClick={() => setSubView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subView === 'calendar' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Month Calendar</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Filter:
          </span>
          {['all', 'education', 'religion', 'health', 'social', 'career'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: 30-Day Heatmap Matrix */}
      {subView === 'matrix' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>30-Day Habit Execution Matrix</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Interactive
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any cell to toggle completion for that day. Hover to view date and details.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-[9px]">✓</div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded border-2 border-indigo-400" />
                <span>Selected Day</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                  <th className="py-2.5 px-3 font-semibold text-slate-300 w-56 sticky left-0 bg-slate-900 z-10">
                    Habit / Routine
                  </th>
                  <th className="py-2.5 px-2 font-semibold text-center w-24">
                    Streak
                  </th>
                  <th className="py-2.5 px-2 font-semibold text-center w-28">
                    30-Day Rate
                  </th>
                  {/* Day columns */}
                  {past30Days.map((day) => (
                    <th 
                      key={day.dateStr}
                      onClick={() => onSelectDate(day.dateStr)}
                      className={`py-2 px-1 text-center font-mono cursor-pointer transition-colors ${
                        day.isSelected 
                          ? 'bg-indigo-600/30 text-indigo-300 font-bold rounded-t-lg' 
                          : day.isToday 
                          ? 'text-emerald-400 font-bold' 
                          : 'hover:text-white'
                      }`}
                      title={`${day.monthName} ${day.dayNum} (${day.dateStr})`}
                    >
                      <div className="text-[9px] uppercase text-slate-500">{day.dayName}</div>
                      <div className="text-[11px]">{day.dayNum}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHabits.map((habit) => {
                  // Count completed in past 30 days
                  const completedIn30Days = past30Days.filter(d => habit.completedDates.includes(d.dateStr)).length;
                  const tier = getConsistencyTier(completedIn30Days, 30);
                  const ratePct = Math.round((completedIn30Days / 30) * 100);

                  return (
                    <tr key={habit.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Habit Name Column */}
                      <td className="py-2.5 px-3 sticky left-0 bg-slate-900 z-10 flex items-center gap-2">
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block truncate max-w-[180px]" title={habit.title}>
                            {habit.title}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {habit.category} • {habit.isDaily ? 'Daily' : 'Task'}
                          </span>
                        </div>
                      </td>

                      {/* Streak Column */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                          <Flame className="w-3 h-3 fill-amber-400/30" />
                          <span>{habit.streak}d</span>
                        </div>
                      </td>

                      {/* 30-Day Completion Rate Column */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tier.color}`}>
                            {tier.label} ({ratePct}%)
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {completedIn30Days}/30 days
                          </span>
                        </div>
                      </td>

                      {/* Day Cells */}
                      {past30Days.map((day) => {
                        const isDone = habit.completedDates.includes(day.dateStr);
                        return (
                          <td 
                            key={day.dateStr}
                            className={`py-2 px-1 text-center ${day.isSelected ? 'bg-indigo-600/10' : ''}`}
                          >
                            <button
                              type="button"
                              onClick={() => onToggleHabitDate(habit.id, day.dateStr)}
                              className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center transition-all active:scale-90 ${
                                isDone
                                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs hover:bg-emerald-400'
                                  : day.isToday
                                  ? 'bg-slate-800 border-2 border-indigo-400/80 hover:border-indigo-300 text-transparent'
                                  : 'bg-slate-800/80 hover:bg-slate-700 text-transparent'
                              }`}
                              title={`${habit.title} on ${day.monthName} ${day.dayNum}: ${isDone ? 'Completed' : 'Missed'} (Click to toggle)`}
                            >
                              {isDone && <span className="text-[11px] leading-none">✓</span>}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Consistency Trend Graph */}
      {subView === 'chart' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                30-Day Routine Execution Curve
              </h3>
              <p className="text-xs text-slate-400">
                Percentage of habits completed each day over the past month
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Target: 80%+ consistency
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="consistencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="label" 
                  stroke="#64748b" 
                  tick={{ fontSize: 10 }}
                  interval={2} 
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 10 }} 
                  domain={[0, 100]} 
                  unit="%" 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs shadow-xl">
                          <span className="font-bold text-white block mb-1">
                            {data.label} {data.isToday ? '(Today)' : ''}
                          </span>
                          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                            <span>Completion Rate: {data.percentage}%</span>
                          </div>
                          <span className="text-slate-400 text-[11px] block mt-0.5">
                            {data.completed} of {data.total} habits completed
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#consistencyGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 3: Monthly Calendar View */}
      {subView === 'calendar' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Monthly Consistency Calendar
              </h3>
              <p className="text-xs text-slate-400">
                Days color-coded by daily completion level. Click any date to view and inspect routines.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> 100%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-700" /> 60-99%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-600" /> 1-59%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-800" /> 0%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 pt-2">
            {past30Days.map((day) => {
              const completedOnDay = habits.filter(h => h.completedDates.includes(day.dateStr)).length;
              const totalHabits = habits.length;
              const pct = totalHabits > 0 ? Math.round((completedOnDay / totalHabits) * 100) : 0;
              const isSelected = day.dateStr === selectedDate;

              let bgClass = 'bg-slate-950 border-slate-800 text-slate-400';
              if (pct === 100) bgClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
              else if (pct >= 60) bgClass = 'bg-emerald-900/30 border-emerald-700/40 text-emerald-400';
              else if (pct > 0) bgClass = 'bg-amber-500/10 border-amber-500/30 text-amber-300';

              return (
                <button
                  key={day.dateStr}
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${bgClass} ${
                    isSelected ? 'ring-2 ring-indigo-500 shadow-lg scale-102' : 'hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-slate-400">{day.dayName}</span>
                    <span className="text-xs font-extrabold text-white font-mono">{day.dayNum}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-extrabold block">
                      {pct}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {completedOnDay}/{totalHabits} done
                    </span>
                  </div>
                  {day.isToday && (
                    <span className="absolute bottom-1 right-1.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
