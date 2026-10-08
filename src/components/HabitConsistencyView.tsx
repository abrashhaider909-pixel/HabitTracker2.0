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
    if (pct >= 85) return { label: 'Titan', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (pct >= 70) return { label: 'Disciplined', color: 'bg-teal-50 text-[#0F766E] border-teal-200' };
    if (pct >= 50) return { label: 'Steady', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    return { label: 'Building', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              30-Day Average Consistency
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {overall30DayStats.avgRate}%
            </span>
            <span className="text-xs text-slate-500">across all routines</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
            <div 
              className="bg-[#0F766E] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overall30DayStats.avgRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Completions (Month)
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-900 tracking-tight">
              {overall30DayStats.totalCompletions}
            </span>
            <span className="text-xs text-slate-500">habits logged</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Peak execution day: <strong className="text-slate-800">{overall30DayStats.bestDay}</strong>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Highest Active Streak
            </span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-900 tracking-tight">
              {habits.reduce((max, h) => Math.max(max, h.streak), 0)}
            </span>
            <span className="text-xs text-slate-500">consecutive days</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Never miss twice: protect your daily chain
          </p>
        </div>
      </div>

      {/* Sub-view Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-100/80 border border-slate-200/80 rounded-2xl">
        {/* View Switcher */}
        <div className="flex items-center bg-slate-200/70 rounded-xl p-1">
          <button
            id="view-switch-matrix"
            onClick={() => setSubView('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subView === 'matrix' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>30-Day Heatmap Matrix</span>
          </button>

          <button
            id="view-switch-chart"
            onClick={() => setSubView('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subView === 'chart' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Consistency Trend Graph</span>
          </button>

          <button
            id="view-switch-calendar"
            onClick={() => setSubView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subView === 'calendar' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Month Calendar</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Filter:
          </span>
          {['all', 'education', 'religion', 'health', 'social', 'career'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-white text-[#0F766E] font-bold border border-teal-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: 30-Day Heatmap Matrix */}
      {subView === 'matrix' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>30-Day Habit Execution Matrix</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                  Interactive
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any cell to toggle completion for that day. Click header to select that day.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-[#0F766E] flex items-center justify-center text-white font-bold text-[9px]">✓</div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300" />
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded border-2 border-teal-500" />
                <span>Selected Day</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500">
                  <th className="py-2.5 px-3 font-semibold text-slate-700 w-56 sticky left-0 bg-white z-10">
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
                          ? 'bg-teal-50 text-[#0F766E] font-bold rounded-t-lg' 
                          : day.isToday 
                          ? 'text-[#0F766E] font-bold' 
                          : 'hover:text-slate-900'
                      }`}
                      title={`${day.monthName} ${day.dayNum} (${day.dateStr})`}
                    >
                      <div className="text-[9px] uppercase text-slate-400">{day.dayName}</div>
                      <div className="text-[11px]">{day.dayNum}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHabits.map((habit) => {
                  // Count completed in past 30 days
                  const completedIn30Days = past30Days.filter(d => habit.completedDates.includes(d.dateStr)).length;
                  const tier = getConsistencyTier(completedIn30Days, 30);
                  const ratePct = Math.round((completedIn30Days / 30) * 100);

                  return (
                    <tr key={habit.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Habit Name Column */}
                      <td className="py-2.5 px-3 sticky left-0 bg-white z-10 flex items-center gap-2">
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-900 block truncate max-w-[180px]" title={habit.title}>
                            {habit.title}
                          </span>
                          <span className="text-[10px] text-slate-500 capitalize">
                            {habit.category} • {habit.isDaily ? 'Daily' : 'Task'}
                          </span>
                        </div>
                      </td>

                      {/* Streak Column */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold">
                          <Flame className="w-3 h-3 fill-amber-500/20 text-amber-600" />
                          <span>{habit.streak}d</span>
                        </div>
                      </td>

                      {/* 30-Day Completion Rate Column */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tier.color}`}>
                            {tier.label} ({ratePct}%)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
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
                            className={`py-2 px-1 text-center ${day.isSelected ? 'bg-teal-50/50' : ''}`}
                          >
                            <button
                              type="button"
                              onClick={() => onToggleHabitDate(habit.id, day.dateStr)}
                              className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                                isDone
                                  ? 'bg-[#0F766E] text-white font-bold shadow-xs hover:bg-[#0D655E]'
                                  : day.isToday
                                  ? 'bg-slate-100 border-2 border-teal-500 text-transparent'
                                  : 'bg-slate-100 hover:bg-slate-200 text-transparent'
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
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                30-Day Routine Execution Curve
              </h3>
              <p className="text-xs text-slate-500">
                Percentage of habits completed each day over the past month
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200">
                Target: 80%+ consistency
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="consistencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 10 }}
                  interval={2} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 10 }} 
                  domain={[0, 100]} 
                  unit="%" 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-md">
                          <span className="font-bold text-slate-900 block mb-1">
                            {data.label} {data.isToday ? '(Today)' : ''}
                          </span>
                          <div className="flex items-center gap-2 text-[#0F766E] font-semibold">
                            <span>Completion Rate: {data.percentage}%</span>
                          </div>
                          <span className="text-slate-500 text-[11px] block mt-0.5">
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
                  stroke="#0F766E" 
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
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Monthly Consistency Calendar
              </h3>
              <p className="text-xs text-slate-500">
                Days color-coded by daily completion level. Click any date to view and inspect routines.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600" /> 100%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-500" /> 60-99%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" /> 1-59%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200" /> 0%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 pt-2">
            {past30Days.map((day) => {
              const completedOnDay = habits.filter(h => h.completedDates.includes(day.dateStr)).length;
              const totalHabits = habits.length;
              const pct = totalHabits > 0 ? Math.round((completedOnDay / totalHabits) * 100) : 0;
              const isSelected = day.dateStr === selectedDate;

              let bgClass = 'bg-slate-50 border-slate-200 text-slate-600';
              if (pct === 100) bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-900';
              else if (pct >= 60) bgClass = 'bg-teal-50 border-teal-300 text-teal-900';
              else if (pct > 0) bgClass = 'bg-amber-50 border-amber-300 text-amber-900';

              return (
                <button
                  key={day.dateStr}
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${bgClass} ${
                    isSelected ? 'ring-2 ring-[#0F766E] shadow-sm' : 'hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-slate-400">{day.dayName}</span>
                    <span className="text-xs font-extrabold text-slate-800 font-mono">{day.dayNum}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-extrabold block">
                      {pct}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {completedOnDay}/{totalHabits} done
                    </span>
                  </div>
                  {day.isToday && (
                    <span className="absolute bottom-1 right-1.5 text-[8px] font-bold uppercase tracking-wider text-[#0F766E]">
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
