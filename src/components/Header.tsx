import React from 'react';
import { 
  CheckCircle2, 
  Database, 
  Sparkles, 
  Plus, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Wallet,
  Bell,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Habit, SupabaseConfig, AuthUser, NotificationSettings } from '../types';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  habits: Habit[];
  supabaseConfig: SupabaseConfig;
  user: AuthUser | null;
  notificationSettings: NotificationSettings;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenNotificationModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenHabitModal: () => void;
  onOpenTransactionModal: () => void;
  onOpenCoachModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  habits,
  supabaseConfig,
  user,
  notificationSettings,
  onOpenAuthModal,
  onLogout,
  onOpenNotificationModal,
  onOpenSupabaseModal,
  onOpenHabitModal,
  onOpenTransactionModal,
  onOpenCoachModal,
  activeTab,
  setActiveTab,
}) => {
  // Format selected date
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const shiftDate = (deltaDays: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + deltaDays);
    const newStr = current.toISOString().split('T')[0];
    onDateChange(newStr);
  };

  const jumpToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  // Completion calculation for selected date
  const dailyHabits = habits.filter(h => h.isDaily);
  const completedTodayCount = habits.filter(h => h.completedDates.includes(selectedDate)).length;
  const totalHabitsCount = habits.length;
  const completionPercentage = totalHabitsCount > 0 
    ? Math.round((completedTodayCount / totalHabitsCount) * 100) 
    : 0;

  // Max streak among habits
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      {/* Top Banner / Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">HabitPulse</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Life OS SaaS
                </span>
              </div>
              <p className="text-xs text-slate-400">Routines • Wealth • 5D Judgement • SWE Growth</p>
            </div>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner self-start md:self-auto">
            <button
              id="header-prev-day-btn"
              onClick={() => shiftDate(-1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs sm:text-sm font-semibold text-slate-200">{formattedDate}</span>
              {isToday && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Today
                </span>
              )}
            </div>

            <button
              id="header-next-day-btn"
              onClick={() => shiftDate(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                id="header-jump-today-btn"
                onClick={jumpToToday}
                className="ml-2 text-xs font-semibold px-2 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                Today
              </button>
            )}
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Streak Counter */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse" />
              <span>{maxStreak} Day Streak</span>
            </div>

            {/* Daily Execution % */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Execution:</span>
              <span className="font-bold text-emerald-400">{completionPercentage}%</span>
              <span className="text-slate-500 text-[11px]">({completedTodayCount}/{totalHabitsCount})</span>
            </div>

            {/* Notification Reminders Trigger */}
            <button
              id="header-notifications-btn"
              onClick={onOpenNotificationModal}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                notificationSettings.enabled
                  ? 'bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-slate-800'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Push Notification Settings & Schedules"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alerts</span>
              {notificationSettings.enabled && (
                <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
              )}
            </button>

            {/* Supabase Status Pill */}
            <button
              id="header-supabase-btn"
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
              title="Supabase Database Status & Schema"
            >
              <Database className={`w-3.5 h-3.5 ${supabaseConfig.isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{supabaseConfig.isConnected ? 'Supabase Sync' : 'SQL DB'}</span>
              <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-slate-500'}`} />
            </button>

            {/* User Auth Account Badge / Trigger */}
            {user && !user.isGuest ? (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl pl-2.5 pr-1 py-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 mr-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[100px] truncate font-medium" title={user.email}>
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                </div>
                <button
                  id="header-logout-btn"
                  onClick={onLogout}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="header-auth-btn"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/20 hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* AI Coach Trigger */}
            <button
              id="header-ai-coach-btn"
              onClick={onOpenCoachModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Coach</span>
            </button>

            {/* Quick Actions Dropdown / Buttons */}
            <button
              id="header-add-habit-btn"
              onClick={onOpenHabitModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Habit</span>
            </button>

            <button
              id="header-add-expense-btn"
              onClick={onOpenTransactionModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Money</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'habits', label: 'Daily Routines & Habits', count: totalHabitsCount },
            { id: 'money', label: 'Track My Money', badge: '$' },
            { id: 'ai-eval', label: '5D AI Life Judgement', badge: 'AI' },
            { id: 'career', label: 'SWE Career Growth', badge: 'Roadmap' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    tab.id === 'ai-eval' 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : tab.id === 'money'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
