import React, { useRef } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Wallet,
  Bell,
  LogOut,
  Menu,
  ListTodo,
  CalendarDays
} from 'lucide-react';
import { Habit, AuthUser, NotificationSettings } from '../types';
import { formatDisplayDate, getTodayDateStr, addDays } from '../lib/dateUtils';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  habits: Habit[];
  user: AuthUser;
  notificationSettings: NotificationSettings;
  onLogout: () => void;
  onOpenNotificationModal: () => void;
  onOpenHabitModal: () => void;
  onOpenTransactionModal: () => void;
  onOpenCoachModal: () => void;
  onOpenProfileModal: () => void;
  onOpenSideDrawer: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  habits,
  user,
  notificationSettings,
  onLogout,
  onOpenNotificationModal,
  onOpenHabitModal,
  onOpenTransactionModal,
  onOpenCoachModal,
  onOpenProfileModal,
  onOpenSideDrawer,
  activeTab,
  setActiveTab,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Format selected date
  const formattedDate = formatDisplayDate(selectedDate);
  const isToday = selectedDate === getTodayDateStr();

  const shiftDate = (deltaDays: number) => {
    onDateChange(addDays(selectedDate, deltaDays));
  };

  const jumpToToday = () => {
    onDateChange(getTodayDateStr());
  };

  // Completion calculation for selected date
  const completedTodayCount = habits.filter(h => h.completedDates.includes(selectedDate)).length;
  const totalHabitsCount = habits.length;
  const completionPercentage = totalHabitsCount > 0 
    ? Math.round((completedTodayCount / totalHabitsCount) * 100) 
    : 0;

  // Max streak among habits
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: 3-Bars Hamburger Button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* The 3-Bars Mobile & PC Menu Button */}
            <button
              id="header-sidebar-toggle-btn"
              onClick={onOpenSideDrawer}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs group"
              title="Open Navigation Menu (Three Bars)"
              aria-label="Open side navigation menu"
            >
              <Menu className="w-5 h-5 text-slate-700 group-hover:text-[#0F766E] transition-colors" />
            </button>

            <BrandLogo size="md" showSubtitle={true} />
          </div>

          {/* Desktop Center Date Navigator */}
          <div className="hidden lg:flex items-center bg-slate-100/90 border border-slate-200/80 rounded-xl p-0.5 shadow-xs">
            <button
              id="header-prev-day-btn"
              onClick={() => shiftDate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white active:scale-95 transition-all cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div 
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1 cursor-pointer group"
              title="Click to jump to date"
            >
              <CalendarIcon className="w-4 h-4 text-[#0F766E] group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                {formattedDate}
              </span>
              {isToday && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200/80">
                  Today
                </span>
              )}
              {/* Hidden native date input for calendar jump */}
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="sr-only"
              />
            </div>

            <button
              id="header-next-day-btn"
              onClick={() => shiftDate(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white active:scale-95 transition-all cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                id="header-jump-today-btn"
                onClick={jumpToToday}
                className="ml-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Today
              </button>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Streak Counter */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold"
              title="Current streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
              <span>{maxStreak}d</span>
              <span className="hidden sm:inline font-normal text-amber-700">streak</span>
            </div>

            {/* Desktop Execution % */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-xs font-medium text-teal-900">
              <span className="text-teal-700">Done:</span>
              <span className="font-bold text-[#0F766E]">{completionPercentage}%</span>
              <span className="text-teal-600 text-[11px]">({completedTodayCount}/{totalHabitsCount})</span>
            </div>

            {/* Notification Reminders Trigger */}
            <button
              id="header-notifications-btn"
              onClick={onOpenNotificationModal}
              className={`p-2 rounded-xl text-xs font-medium border transition-colors relative cursor-pointer ${
                notificationSettings.enabled
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Push Notification Settings"
            >
              <Bell className="w-4 h-4" />
              {notificationSettings.enabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {/* AI Coach Trigger */}
            <button
              id="header-ai-coach-btn"
              onClick={onOpenCoachModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 border border-teal-200/80 text-[#0F766E] hover:bg-teal-100/70 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="hidden md:inline">AI Coach</span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/80 rounded-xl pl-1.5 pr-1 py-1">
              <button
                id="header-profile-btn"
                onClick={onOpenProfileModal}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 transition-colors cursor-pointer group"
                title="Edit Profile"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-[#0F766E] border border-teal-200 flex items-center justify-center font-bold text-xs overflow-hidden">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (user.displayName || user.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <span className="max-w-[80px] sm:max-w-[100px] truncate font-medium text-slate-800 hidden xs:inline" title={user.email}>
                  {user.displayName || user.email.split('@')[0]}
                </span>
              </button>

              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                id="header-add-habit-btn"
                onClick={onOpenHabitModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0F766E] hover:bg-[#0D655E] active:scale-95 text-white transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Habit</span>
              </button>

              <button
                id="header-log-money-btn"
                onClick={onOpenTransactionModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 active:scale-95 text-white transition-all shadow-xs cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Log Money</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Date Bar (Visible only on < lg screens) */}
        <div className="flex lg:hidden mt-2 items-center justify-between bg-slate-100/90 border border-slate-200/80 rounded-xl p-1 shadow-xs">
          <button
            id="mobile-header-prev-day-btn"
            onClick={() => shiftDate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div 
            onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
            className="flex items-center gap-2 px-2 cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#0F766E]" />
            <span className="text-xs font-semibold text-slate-800">
              {formattedDate}
            </span>
            {isToday && (
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200/80">
                Today
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isToday && (
              <button
                id="mobile-header-jump-today-btn"
                onClick={jumpToToday}
                className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#0F766E] text-white active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Today
              </button>
            )}

            <button
              id="mobile-header-next-day-btn"
              onClick={() => shiftDate(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white active:scale-95 transition-all cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs Bar - Sophisticated Segmented Control */}
        <div className="hidden md:flex mt-2.5 pt-2 border-t border-slate-200/80 items-center justify-between text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200/80 rounded-xl">
            <button
              id="tab-habits"
              onClick={() => setActiveTab('habits')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer font-medium ${
                activeTab === 'habits'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold text-[#0F766E]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${activeTab === 'habits' ? 'text-[#0F766E]' : 'text-slate-400'}`} />
              <span>Daily Routines</span>
            </button>

            <button
              id="tab-money"
              onClick={() => setActiveTab('money')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer font-medium ${
                activeTab === 'money'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold text-[#0F766E]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Wallet className={`w-4 h-4 ${activeTab === 'money' ? 'text-[#0F766E]' : 'text-slate-400'}`} />
              <span>Personal Finance</span>
            </button>

            <button
              id="tab-list"
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer font-medium ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold text-[#0F766E]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ListTodo className={`w-4 h-4 ${activeTab === 'list' ? 'text-[#0F766E]' : 'text-slate-400'}`} />
              <span>List</span>
            </button>

            <button
              id="tab-events"
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer font-medium ${
                activeTab === 'events'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold text-[#0F766E]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CalendarDays className={`w-4 h-4 ${activeTab === 'events' ? 'text-[#0F766E]' : 'text-slate-400'}`} />
              <span>Event Planner</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <span>{habits.length} routines</span>
            <span className="text-slate-300">·</span>
            <span className="text-[#0F766E] font-semibold">{completionPercentage}% done</span>
          </div>
        </div>
      </div>
    </header>
  );
};
