import React from 'react';
import { X, CheckCircle2, Wallet, Plus, Menu, ListTodo, CalendarDays } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHabitModal: () => void;
  onOpenTransactionModal: () => void;
  onOpenListTab: () => void;
  onOpenEventsTab: () => void;
  onOpenSideDrawer?: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onOpenHabitModal,
  onOpenTransactionModal,
  onOpenListTab,
  onOpenEventsTab,
  onOpenSideDrawer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-sm bg-white border border-slate-200/90 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenHabitModal();
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#0F766E] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F766E] group-hover:text-white transition-colors shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Create New Routine</span>
              <span className="text-[11px] text-slate-500">Add daily habit, health, or focus goal</span>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenTransactionModal();
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#0F766E] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F766E] group-hover:text-white transition-colors shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Log Financial Transaction</span>
              <span className="text-[11px] text-slate-500">Record income, expense, or savings</span>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenListTab();
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#0F766E] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F766E] group-hover:text-white transition-colors shadow-xs">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Open Action Lists</span>
              <span className="text-[11px] text-slate-500">Manage tasks, errands, and priority checklists</span>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenEventsTab();
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#0F766E] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F766E] group-hover:text-white transition-colors shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Plan Event &amp; Reminders</span>
              <span className="text-[11px] text-slate-500">Select month, date, day &amp; schedule alerts</span>
            </div>
          </button>

          {onOpenSideDrawer && (
            <button
              onClick={() => {
                onClose();
                onOpenSideDrawer();
              }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 transition-all text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:text-slate-900 transition-colors shadow-xs">
                <Menu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Open Side Drawer (3 Bars)</span>
                <span className="text-[11px] text-slate-500">Full side menu with all tabs and settings</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
