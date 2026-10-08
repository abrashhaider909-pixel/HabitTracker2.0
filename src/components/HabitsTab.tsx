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
  Award,
  Check,
  X
} from 'lucide-react';
import { Habit, LifeDimension } from '../types';
import { HabitConsistencyView } from './HabitConsistencyView';
import { isHabitCompleted } from '../lib/streaks';
import { getTodayDateStr, addDays } from '../lib/dateUtils';

interface HabitsTabProps {
  habits: Habit[];
  selectedDate: string;
  onToggleHabit: (habitId: string) => void;
  onToggleHabitDate: (habitId: string, date: string) => void;
  onSelectDate: (date: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
  onOpenAddModal: () => void;
  onOpenEventPlanner?: () => void;
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
  onOpenEventPlanner,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'consistency'>('cards');
  const [selectedCategories, setSelectedCategories] = useState<LifeDimension[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'task'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 14-day recent window for the mini card sparkline dots (timezone-safe)
  const recent14Days = useMemo(() => {
    const days: string[] = [];
    const today = getTodayDateStr();
    for (let i = 13; i >= 0; i--) {
      days.push(addDays(today, -i));
    }
    return days;
  }, []);

  // Rolling 7-day strip centered on selectedDate for instant 1-tap mobile & PC day navigation
  const rolling7Days = useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayOfWeek: string;
      dayNum: number;
      isToday: boolean;
      isSelected: boolean;
      completedCount: number;
      totalCount: number;
    }> = [];
    const today = getTodayDateStr();
    for (let i = -3; i <= 3; i++) {
      const dStr = addDays(selectedDate, i);
      const parts = dStr.split('-');
      const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const dayOfWeek = dObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = dObj.getDate();
      const done = habits.filter((h) => isHabitCompleted(h, dStr)).length;
      list.push({
        dateStr: dStr,
        dayOfWeek,
        dayNum,
        isToday: dStr === today,
        isSelected: dStr === selectedDate,
        completedCount: done,
        totalCount: habits.length,
      });
    }
    return list;
  }, [selectedDate, habits]);

  // Category styling and metadata
  const categoryConfig: Record<LifeDimension, {
    label: string;
    icon: React.ElementType;
    color: string;
    badgeBg: string;
    textCol: string;
    activeBg: string;
    activeBorder: string;
    activeText: string;
    activeRing: string;
    activePill: string;
  }> = {
    education: {
      label: 'Education',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-400',
      badgeBg: 'bg-blue-50 border-blue-200',
      textCol: 'text-blue-700',
      activeBg: 'bg-blue-50',
      activeBorder: 'border-blue-400',
      activeText: 'text-blue-800',
      activeRing: 'ring-blue-200',
      activePill: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    health: {
      label: 'Health',
      icon: Activity,
      color: 'from-emerald-500 to-teal-400',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      textCol: 'text-emerald-700',
      activeBg: 'bg-emerald-50',
      activeBorder: 'border-emerald-400',
      activeText: 'text-emerald-800',
      activeRing: 'ring-emerald-200',
      activePill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    career: {
      label: 'Career',
      icon: Briefcase,
      color: 'from-violet-500 to-purple-400',
      badgeBg: 'bg-purple-50 border-purple-200',
      textCol: 'text-purple-700',
      activeBg: 'bg-purple-50',
      activeBorder: 'border-purple-400',
      activeText: 'text-purple-800',
      activeRing: 'ring-purple-200',
      activePill: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    religion: {
      label: 'Religion',
      icon: SunMedium,
      color: 'from-amber-500 to-yellow-400',
      badgeBg: 'bg-amber-50 border-amber-200',
      textCol: 'text-amber-800',
      activeBg: 'bg-amber-50',
      activeBorder: 'border-amber-400',
      activeText: 'text-amber-900',
      activeRing: 'ring-amber-200',
      activePill: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    social: {
      label: 'Social',
      icon: HeartHandshake,
      color: 'from-pink-500 to-rose-400',
      badgeBg: 'bg-rose-50 border-rose-200',
      textCol: 'text-rose-700',
      activeBg: 'bg-rose-50',
      activeBorder: 'border-rose-400',
      activeText: 'text-rose-800',
      activeRing: 'ring-rose-200',
      activePill: 'bg-rose-100 text-rose-800 border-rose-300',
    },
  };

  // Toggle category visibility
  const handleToggleCategory = (dim: LifeDimension) => {
    setSelectedCategories((prev) => {
      if (prev.length === 0) {
        return [dim];
      }
      if (prev.includes(dim)) {
        const next = prev.filter((c) => c !== dim);
        return next;
      }
      const next = [...prev, dim];
      if (next.length === 5) {
        return [];
      }
      return next;
    });
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories([]);
  };

  // Filtered habits
  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(h.category)) {
        return false;
      }
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
  }, [habits, selectedCategories, filterType, searchQuery]);

  // Daily statistics for selected date
  const completedCount = habits.filter(h => isHabitCompleted(h, selectedDate)).length;
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
        if (isHabitCompleted(h, selectedDate)) {
          cats[h.category].completed += 1;
        }
      }
    });
    return cats;
  }, [habits, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Execution Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Done</span>
            <CalendarCheck className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{executionPercentage}%</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium">({completedCount}/{totalCount})</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 sm:h-2 overflow-hidden border border-slate-200">
            <div 
              className="bg-[#0F766E] h-full rounded-full transition-all duration-500"
              style={{ width: `${executionPercentage}%` }}
            />
          </div>
        </div>

        {/* Daily Habits Active */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Routines</span>
            <Layers className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {habits.filter(h => h.isDaily).length}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium">active targets</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 font-medium truncate">
            Foundational routines
          </p>
        </div>

        {/* Longest Active Streak */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-tight">
              {habits.reduce((max, h) => Math.max(max, h.streak), 0)}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium">days in a row</span>
          </div>
          <p className="mt-1.5 text-[11px] text-amber-700/80 font-medium truncate">
            Consistent momentum
          </p>
        </div>

        {/* Event Planner Quick Trigger */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[#0F766E] uppercase tracking-wider">Event &amp; Reminders</span>
            <CalendarDays className="w-4 h-4 text-[#0F766E]" />
          </div>
          <p className="mt-1 text-[11px] text-slate-600 line-clamp-1 sm:line-clamp-2">Plan dates, milestones &amp; get alerts.</p>
          <button
            id="habits-event-planner-btn"
            onClick={onOpenEventPlanner}
            className="mt-2 w-full py-1.5 px-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-[11px] sm:text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Plan Events</span>
          </button>
        </div>
      </div>

      {/* 7-Day Rolling Interactive Date Navigation Strip */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        {rolling7Days.map((day) => (
          <button
            key={day.dateStr}
            onClick={() => onSelectDate(day.dateStr)}
            className={`flex-1 min-w-[48px] sm:min-w-[65px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              day.isSelected
                ? 'bg-[#0F766E] text-white shadow-xs scale-[1.02]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <span className={`text-[10px] uppercase font-bold tracking-wider ${day.isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
              {day.dayOfWeek}
            </span>
            <span className={`text-sm sm:text-base font-black my-0.5 ${day.isSelected ? 'text-white' : 'text-slate-900'}`}>
              {day.dayNum}
            </span>
            {day.isToday ? (
              <span className={`text-[8px] font-extrabold uppercase px-1 rounded-sm ${day.isSelected ? 'bg-white/20 text-white' : 'bg-teal-50 text-[#0F766E]'}`}>
                Today
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  day.completedCount > 0 
                    ? day.completedCount === day.totalCount ? 'bg-emerald-400' : 'bg-teal-400' 
                    : 'bg-slate-300'
                }`} />
                <span className="text-[9px] font-mono text-slate-400">{day.completedCount}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* View Switcher: Daily Execution Cards vs 30-Day Consistency View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            id="habits-view-cards-btn"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Daily Habits &amp; Routines</span>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {habits.length}
            </span>
          </button>

          <button
            id="habits-view-consistency-btn"
            onClick={() => setViewMode('consistency')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              viewMode === 'consistency'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#0F766E]" />
            <span>30-Day Consistency &amp; Progress</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
              Month Matrix &amp; Graph
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Track consistency and maintain streaks across all categories</span>
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
          {/* Category Filter Chips */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#0F766E]" />
                  Category Filters:
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  {selectedCategories.length === 0
                    ? 'Showing all categories'
                    : `Filtered to ${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'}`}
                </span>
              </div>
              {selectedCategories.length > 0 && (
                <button
                  id="filter-chip-clear"
                  onClick={handleSelectAllCategories}
                  className="flex items-center gap-1 text-xs text-[#0F766E] hover:underline transition-colors font-medium cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Show All Categories</span>
                </button>
              )}
            </div>

            {/* Chips Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
              {/* All Categories Chip */}
              <button
                id="filter-chip-all"
                onClick={handleSelectAllCategories}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategories.length === 0
                    ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${selectedCategories.length === 0 ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                <span>All Categories</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold transition-colors ${
                  selectedCategories.length === 0
                    ? 'bg-[#0F766E] text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {habits.length}
                </span>
              </button>

              {/* Individual Category Chips */}
              {(['education', 'health', 'career', 'religion', 'social'] as LifeDimension[]).map(dim => {
                const cfg = categoryConfig[dim];
                const Icon = cfg.icon;
                const stat = categoryStats[dim];
                const isSelected = selectedCategories.includes(dim);

                return (
                  <button
                    key={dim}
                    id={`filter-chip-${dim}`}
                    onClick={() => handleToggleCategory(dim)}
                    title={isSelected ? `Click to hide ${cfg.label}` : `Click to toggle ${cfg.label} visibility`}
                    className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.activeText} shadow-xs`
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-current' : cfg.textCol}`} />
                    <span>{cfg.label}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 text-current stroke-[2.5]" />
                    )}
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold transition-colors ${
                      isSelected
                        ? cfg.activePill
                        : 'bg-slate-200 text-slate-600 group-hover:text-slate-900'
                    }`}>
                      {stat.completed}/{stat.total}
                    </span>
                  </button>
                );
              })}
            </div>
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
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] shadow-xs transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Daily vs One-time filter */}
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({habits.length})
                </button>
                <button
                  onClick={() => setFilterType('daily')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === 'daily' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daily ({habits.filter(h => h.isDaily).length})
                </button>
                <button
                  onClick={() => setFilterType('task')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === 'task' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  One-Time ({habits.filter(h => !h.isDaily).length})
                </button>
              </div>

              <button
                id="habits-add-new-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0F766E] hover:bg-[#0D655E] text-white transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Routine Target</span>
              </button>
            </div>
          </div>

          {/* Habit Cards Grid */}
          {filteredHabits.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">No habits match your filters</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your search or category filter, or add a new high-leverage habit to build momentum.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                {(selectedCategories.length > 0 || filterType !== 'all' || searchQuery.trim() !== '') && (
                  <button
                    id="habits-empty-reset-btn"
                    onClick={() => {
                      setSelectedCategories([]);
                      setFilterType('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}
                <button
                  id="habits-empty-create-btn"
                  onClick={onOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Habit</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredHabits.map((habit) => {
                const isCompleted = isHabitCompleted(habit, selectedDate);
                const cfg = categoryConfig[habit.category];
                const CategoryIcon = cfg.icon;

                return (
                  <div
                    key={habit.id}
                    id={`habit-card-${habit.id}`}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
                      isCompleted
                        ? 'bg-teal-50/40 border-teal-200/80 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Custom Checkbox Toggle Button */}
                      <button
                        id={`habit-toggle-${habit.id}`}
                        onClick={() => onToggleHabit(habit.id)}
                        className="mt-0.5 flex-shrink-0 transition-transform active:scale-95 focus:outline-none cursor-pointer"
                        title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                      >
                        {isCompleted ? (
                          <div className="w-6 h-6 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shadow-xs ring-2 ring-teal-200">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-slate-300 hover:border-[#0F766E] flex items-center justify-center bg-white transition-colors">
                            <Circle className="w-3.5 h-3.5 text-transparent hover:text-teal-400" />
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
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {habit.isDaily ? 'Daily Habit' : 'One-Time Task'}
                          </span>

                          {habit.priority === 'high' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              P1 High
                            </span>
                          )}

                          {habit.isDaily && (
                            <div className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold">
                              <Flame className="w-3.5 h-3.5 fill-amber-500/20 text-amber-600" />
                              <span>{habit.streak}d streak</span>
                            </div>
                          )}
                        </div>

                        <h3 className={`mt-1.5 text-sm font-semibold tracking-tight transition-all ${
                          isCompleted ? 'text-slate-400 line-through decoration-slate-400' : 'text-slate-900'
                        }`}>
                          {habit.title}
                        </h3>

                        {habit.description && (
                          <p className={`mt-1 text-xs line-clamp-2 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                            {habit.description}
                          </p>
                        )}

                        {/* 14-Day Mini Activity Sparkline Dots */}
                        {habit.isDaily && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                              14d History:
                            </span>
                            <div className="flex items-center gap-1">
                              {recent14Days.map((dateStr) => {
                                const isDone = habit.completedDates.includes(dateStr);
                                const isCurSelected = dateStr === selectedDate;
                                const isToday = dateStr === getTodayDateStr();
                                return (
                                  <button
                                    key={dateStr}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleHabitDate(habit.id, dateStr);
                                    }}
                                    className={`w-3.5 h-3.5 rounded-sm transition-transform active:scale-75 cursor-pointer ${
                                      isDone
                                        ? 'bg-[#0F766E] hover:bg-[#0D655E]'
                                        : 'bg-slate-200 hover:bg-slate-300'
                                    } ${
                                      isCurSelected ? 'ring-1 ring-slate-800' : ''
                                    } ${
                                      isToday ? 'border border-[#0F766E]' : ''
                                    }`}
                                    title={`${dateStr}: ${isDone ? 'Completed' : 'Missed'} (Click to toggle)`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Metadata Footer: Duration, timeOfDay, best streak */}
                        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                          {habit.bestStreak > 0 && (
                            <span className="text-slate-500">
                              Best Record: <strong className="text-amber-800 font-semibold">{habit.bestStreak} days</strong>
                            </span>
                          )}

                          {habit.targetDurationMinutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Habit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`habit-delete-${habit.id}`}
                          onClick={() => onDeleteHabit(habit.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
