import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Wallet, 
  Sparkles, 
  Flame, 
  Bell, 
  User, 
  LogOut, 
  Plus, 
  Calendar as CalendarIcon,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  ListTodo,
  CalendarDays
} from 'lucide-react';
import { Habit, AuthUser, NotificationSettings, Transaction } from '../types';
import { BrandLogo } from './BrandLogo';
import { formatDisplayDate, getTodayDateStr } from '../lib/dateUtils';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: AuthUser;
  habits: Habit[];
  transactions: Transaction[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  notificationSettings: NotificationSettings;
  onLogout: () => void;
  onOpenNotificationModal: () => void;
  onOpenHabitModal: () => void;
  onOpenTransactionModal: () => void;
  onOpenCoachModal: () => void;
  onOpenProfileModal: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  user,
  habits,
  transactions,
  selectedDate,
  onDateChange,
  notificationSettings,
  onLogout,
  onOpenNotificationModal,
  onOpenHabitModal,
  onOpenTransactionModal,
  onOpenCoachModal,
  onOpenProfileModal,
}) => {
  if (!isOpen) return null;

  // Max streak
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  // Today's done
  const completedTodayCount = habits.filter(h => h.completedDates.includes(selectedDate)).length;
  const totalHabitsCount = habits.length;
  const completionPercentage = totalHabitsCount > 0 
    ? Math.round((completedTodayCount / totalHabitsCount) * 100) 
    : 0;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const isToday = selectedDate === getTodayDateStr();

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel from the side */}
      <div 
        className="relative w-80 max-w-[85vw] h-full bg-white border-r border-slate-200/90 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto no-scrollbar animate-in slide-in-from-left duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <BrandLogo size="md" showSubtitle={false} />
          <button
            id="side-drawer-close-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors active:scale-95 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="flex-1 p-4 sm:p-5 space-y-4">
          {/* User Account Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0F766E] to-teal-400 p-0.5 flex-shrink-0 shadow-xs">
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden font-bold text-sm text-[#0F766E]">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (user.displayName || user.email || 'U')[0].toUpperCase()
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate" title={user.displayName || user.email}>
                  {user.displayName || user.email.split('@')[0]}
                </p>
                <p className="text-[11px] text-slate-500 truncate" title={user.email}>
                  {user.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-700">Cloud Synced</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
              <button
                id="drawer-edit-profile-btn"
                onClick={() => {
                  onClose();
                  onOpenProfileModal();
                }}
                className="text-[11px] font-semibold text-slate-600 hover:text-[#0F766E] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                id="drawer-logout-btn"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Banner (Streak & Today's Progress) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                <span>Streak</span>
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/40" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-black text-amber-900 font-mono">{maxStreak}</span>
                <span className="text-[11px] text-amber-700 font-medium">days</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#0F766E] text-[10px] font-bold uppercase tracking-wider">
                <span>Today</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-black text-teal-900 font-mono">{completionPercentage}%</span>
                <span className="text-[11px] text-teal-700 font-medium">({completedTodayCount}/{totalHabitsCount})</span>
              </div>
            </div>
          </div>

          {/* Date Jump Control */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#0F766E]" />
                Selected Day:
              </span>
              <span className="font-bold text-slate-800 text-xs">
                {formatDisplayDate(selectedDate)}
              </span>
            </div>
            {!isToday && (
              <button
                onClick={() => {
                  onDateChange(getTodayDateStr());
                  onClose();
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                Jump to Today
              </button>
            )}
          </div>

          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
              All Life OS Sections
            </span>

            {/* Routines & Habits */}
            <button
              id="drawer-nav-habits"
              onClick={() => handleNavClick('habits')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'habits'
                  ? 'bg-teal-50 text-[#0F766E] border border-teal-200/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${activeTab === 'habits' ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                <span>Daily Routines &amp; Habits</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'habits' ? 'bg-[#0F766E] text-white' : 'bg-slate-200/70 text-slate-600'
              }`}>
                {habits.length}
              </span>
            </button>

            {/* Money & Personal Finance */}
            <button
              id="drawer-nav-money"
              onClick={() => handleNavClick('money')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'money'
                  ? 'bg-teal-50 text-[#0F766E] border border-teal-200/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className={`w-4 h-4 ${activeTab === 'money' ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                <span>Money &amp; Personal Finance</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'money' ? 'bg-[#0F766E] text-white' : 'bg-slate-200/70 text-slate-600'
              }`}>
                {transactions.length}
              </span>
            </button>

            {/* Action Items & List */}
            <button
              id="drawer-nav-list"
              onClick={() => handleNavClick('list')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-teal-50 text-[#0F766E] border border-teal-200/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ListTodo className={`w-4 h-4 ${activeTab === 'list' ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                <span>Action Lists &amp; Checklists</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Event & Reminder Planner */}
            <button
              id="drawer-nav-events"
              onClick={() => handleNavClick('events')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-teal-50 text-[#0F766E] border border-teal-200/80 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays className={`w-4 h-4 ${activeTab === 'events' ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                <span>Event &amp; Reminder Planner</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Assistant & Tools */}
          <div className="space-y-1 pt-2 border-t border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
              Productivity &amp; Coaching
            </span>

            {/* AI Coach Trigger */}
            <button
              id="drawer-ai-coach-btn"
              onClick={() => {
                onClose();
                onOpenCoachModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-[#0F766E] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>Ask AI Life Coach</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-100 text-[#0F766E]">
                PRO
              </span>
            </button>

            {/* Notification Reminders Trigger */}
            <button
              id="drawer-notifications-btn"
              onClick={() => {
                onClose();
                onOpenNotificationModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <span>Push Alerts &amp; Schedules</span>
              </div>
              {notificationSettings.enabled ? (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Off</span>
              )}
            </button>
          </div>

          {/* Quick Action Creation CTAs */}
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              Quick Loggers
            </span>

            <button
              id="drawer-add-habit-btn"
              onClick={() => {
                onClose();
                onOpenHabitModal();
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#0F766E] hover:bg-[#0D655E] text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Routine Target</span>
            </button>

            <button
              id="drawer-log-money-btn"
              onClick={() => {
                onClose();
                onOpenTransactionModal();
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <Wallet className="w-4 h-4" />
              <span>Log Money Transaction</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>HabitPulse Life OS</span>
          </div>
          <span className="text-[10px] font-mono font-medium text-slate-400">v2.4 Standard</span>
        </div>
      </div>
    </div>
  );
};
