import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Filter, 
  BookOpen, 
  HeartHandshake, 
  SunMedium, 
  Activity, 
  Briefcase, 
  Layers, 
  Sparkles,
  CalendarCheck,
  CalendarDays,
  LayoutGrid,
  TrendingUp,
  Award
} from 'lucide-react';
import { Habit, LifeDimension } from '../types';
import { HabitConsistencyView } from './HabitConsistencyView';

interface HabitsTabProps {
  habits: Habit[];
  selectedDate: string;
  onToggleHabit: (habitId: string) => void;
  onToggleHabitDate: (habitId: string, date: string) => void;
  onSelectDate: (date: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
  onOpenAddModal: () => void;
  onEvaluateDay: () => void;
}

export const HabitsTab: React.FC<HabitsTabProps> = ({
  habits,
  selectedDate,
  onToggleHabit,
  onToggleHabitDate,
  onSelectDate,
  onDeleteHabit,
  onEditHabit,
  onOpenAddModal,
  onEvaluateDay,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'consistency'>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'task'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 14-day recent window for the mini card sparkline dots
  const recent14Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  // Category styling and metadata
  const categoryConfig: Record<LifeDimension, { label: string; icon: any; color: string; badgeBg: string; textCol: string }> = {
    education: {
      label: 'Education',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-400',
      badgeBg: 'bg-blue-500/10 border-blue-500/30',
      textCol: 'text-blue-400',
    },
    social: {
      label: 'Social',
      icon: HeartHandshake,
      color: 'from-pink-500 to-rose-400',
      badgeBg: 'bg-pink-500/10 border-pink-500/30',
      textCol: 'text-pink-400',
    },
    religion: {
      label: 'Religion',
      icon: SunMedium,
      color: 'from-amber-500 to-yellow-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30',
      textCol: 'text-amber-400',
    },
    health: {
      label: 'Health',
      icon: Activity,
      color: 'from-emerald-500 to-teal-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
      textCol: 'text-emerald-400',
    },
    career: {
      label: 'Career',
      icon: Briefcase,
      color: 'from-violet-500 to-purple-400',
      badgeBg: 'bg-violet-500/10 border-violet-500/30',
      textCol: 'text-violet-400',
    },
  };

  // Filtered habits
  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      // Category filter
      if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
      // Type filter
      if (filterType === 'daily' && !h.isDaily) return false;
      if (filterType === 'task' && h.isDaily) return false;
      // Search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(query);
        const matchesDesc = h.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [habits, selectedCategory, filterType, searchQuery]);

  // Daily statistics for selected date
  const completedCount = habits.filter(h => h.completedDates.includes(selectedDate)).length;
  const totalCount = habits.length;
  const executionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Category breakdown counts
  const categoryStats = useMemo(() => {
    const cats: Record<LifeDimension, { total: number; completed: number }> = {
      education: { total: 0, completed: 0 },
      social: { total: 0, completed: 0 },
      religion: { total: 0, completed: 0 },
      health: { total: 0, completed: 0 },
      career: { total: 0, completed: 0 },
    };

    habits.forEach(h => {
      if (cats[h.category]) {
        cats[h.category].total += 1;
        if (h.completedDates.includes(selectedDate)) {
          cats[h.category].completed += 1;
        }
      }
    });
    return cats;
  }, [habits, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Execution Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Execution</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{executionPercentage}%</span>
            <span className="text-xs text-slate-400 font-medium">({completedCount} of {totalCount} done)</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${executionPercentage}%` }}
            />
          </div>
        </div>

        {/* Daily Habits Active */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Recurring</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {habits.filter(h => h.isDaily).length}
            </span>
            <span className="text-xs text-slate-400 font-medium">auto-resets at midnight</span>
          </div>
          <p className="mt-2 text-xs text-indigo-300/80 font-medium">
            Non-negotiable foundational routine
          </p>
        </div>

        {/* Longest Active Streak */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Top Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 tracking-tight">
              {habits.reduce((max, h) => Math.max(max, h.streak), 0)}
            </span>
            <span className="text-xs text-slate-400 font-medium">days in a row</span>
          </div>
          <p className="mt-2 text-xs text-amber-400/80 font-medium">
            Compound consistency unlocks mastery
          </p>
        </div>

        {/* AI Action Trigger */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">5D AI Judgement</span>
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div className="mt-1">
            <p className="text-xs text-slate-300">Evaluate today's routine against your 5 core life pillars.</p>
          </div>
          <button
            id="habits-evaluate-btn"
            onClick={onEvaluateDay}
            className="mt-2 w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judge Today's Routine</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Daily Execution Cards vs 30-Day Consistency View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            id="habits-view-cards-btn"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Daily Habits & Routines</span>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-black/20 text-white/90">
              {habits.length}
            </span>
          </button>

          <button
            id="habits-view-consistency-btn"
            onClick={() => setViewMode('consistency')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              viewMode === 'consistency'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>30-Day Consistency & Progress</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Month Matrix & Graph
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Track consistency to trigger 5D score improvements</span>
        </div>
      </div>

      {viewMode === 'consistency' ? (
        <HabitConsistencyView
          habits={habits}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onToggleHabitDate={onToggleHabitDate}
        />
      ) : (
        <>
          {/* 5-Dimension Mini Progress Badges */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" /> 5 Dimensions:
            </span>
            {(['education', 'religion', 'health', 'social', 'career'] as LifeDimension[]).map(dim => {
              const cfg = categoryConfig[dim];
              const Icon = cfg.icon;
              const stat = categoryStats[dim];
              const isSelected = selectedCategory === dim;
              return (
                <button
                  key={dim}
                  id={`filter-dim-${dim}`}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : dim)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${cfg.textCol}`} />
                  <span>{cfg.label}</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-semibold">
                    {stat.completed}/{stat.total}
                  </span>
                </button>
              );
            })}
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-indigo-400 hover:underline ml-auto"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Control Bar: Search & Sub-filters & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                id="habits-search-input"
                type="text"
                placeholder="Search habits or tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Daily vs One-time filter */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({habits.length})
                </button>
                <button
                  onClick={() => setFilterType('daily')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'daily' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daily ({habits.filter(h => h.isDaily).length})
                </button>
                <button
                  onClick={() => setFilterType('task')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'task' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  One-Time ({habits.filter(h => !h.isDaily).length})
                </button>
              </div>

              <button
                id="habits-add-new-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Routine Target</span>
              </button>
            </div>
          </div>

          {/* Habit Cards Grid */}
          {filteredHabits.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-white">No habits match your filters</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try adjusting your search or category filter, or add a new high-leverage habit to build momentum.
              </p>
              <button
                onClick={onOpenAddModal}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Habit</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredHabits.map((habit) => {
                const isCompleted = habit.completedDates.includes(selectedDate);
                const cfg = categoryConfig[habit.category];
                const CategoryIcon = cfg.icon;

                return (
                  <div
                    key={habit.id}
                    id={`habit-card-${habit.id}`}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
                      isCompleted
                        ? 'bg-slate-900/50 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                        : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Custom Checkbox Toggle Button */}
                      <button
                        id={`habit-toggle-${habit.id}`}
                        onClick={() => onToggleHabit(habit.id)}
                        className="mt-0.5 flex-shrink-0 transition-transform active:scale-95 focus:outline-none"
                        title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                      >
                        {isCompleted ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/30">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-slate-600 hover:border-indigo-400 flex items-center justify-center bg-slate-950/40 transition-colors">
                            <Circle className="w-3.5 h-3.5 text-transparent hover:text-indigo-400/30" />
                          </div>
                        )}
                      </button>

                      {/* Body Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${cfg.badgeBg} ${cfg.textCol} inline-flex items-center gap-1`}>
                            <CategoryIcon className="w-2.5 h-2.5" />
                            {cfg.label}
                          </span>

                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            habit.isDaily
                              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {habit.isDaily ? 'Daily Habit' : 'One-Time Task'}
                          </span>

                          {habit.priority === 'high' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              P1 High
                            </span>
                          )}

                          {habit.isDaily && (
                            <div className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                              <Flame className="w-3.5 h-3.5 fill-amber-400/30 animate-pulse" />
                              <span>{habit.streak}d streak</span>
                            </div>
                          )}
                        </div>

                        <h3 className={`mt-1.5 text-sm font-semibold tracking-tight transition-all ${
                          isCompleted ? 'text-slate-400 line-through decoration-slate-600' : 'text-white'
                        }`}>
                          {habit.title}
                        </h3>

                        {habit.description && (
                          <p className={`mt-1 text-xs line-clamp-2 ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                            {habit.description}
                          </p>
                        )}

                        {/* 14-Day Mini Activity Sparkline Dots */}
                        {habit.isDaily && (
                          <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                              14d History:
                            </span>
                            <div className="flex items-center gap-1">
                              {recent14Days.map((dateStr) => {
                                const isDone = habit.completedDates.includes(dateStr);
                                const isCurSelected = dateStr === selectedDate;
                                const isToday = dateStr === new Date().toISOString().split('T')[0];
                                return (
                                  <button
                                    key={dateStr}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleHabitDate(habit.id, dateStr);
                                    }}
                                    className={`w-3.5 h-3.5 rounded-sm transition-transform active:scale-75 ${
                                      isDone
                                        ? 'bg-emerald-400 hover:bg-emerald-300'
                                        : 'bg-slate-800 hover:bg-slate-700'
                                    } ${
                                      isCurSelected ? 'ring-1 ring-white' : ''
                                    } ${
                                      isToday ? 'border border-indigo-400' : ''
                                    }`}
                                    title={`${dateStr}: ${isDone ? 'Completed' : 'Missed'} (Click to toggle)`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Metadata Footer: Duration, timeOfDay, best streak */}
                        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          {habit.bestStreak > 0 && (
                            <span className="text-slate-400">
                              Best Record: <strong className="text-amber-400">{habit.bestStreak} days</strong>
                            </span>
                          )}

                          {habit.targetDurationMinutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{habit.targetDurationMinutes} mins</span>
                            </div>
                          )}

                          {habit.timeOfDay && habit.timeOfDay !== 'anytime' && (
                            <span className="capitalize text-slate-500">
                              • {habit.timeOfDay}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions (Edit / Delete) */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`habit-edit-${habit.id}`}
                          onClick={() => onEditHabit(habit)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Habit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`habit-delete-${habit.id}`}
                          onClick={() => onDeleteHabit(habit.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
