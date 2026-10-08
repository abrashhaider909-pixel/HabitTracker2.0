import React from 'react';
import { 
  CheckCircle2, 
  Wallet, 
  ListTodo, 
  CalendarDays, 
  Plus
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 pt-1 pb-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Habits Tab */}
        <button
          id="mobile-nav-habits"
          onClick={() => setActiveTab('habits')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'habits'
              ? 'text-[#0F766E] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <CheckCircle2 className={`w-5 h-5 mb-0.5 ${activeTab === 'habits' ? 'stroke-[2.5]' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight">Routines</span>
          {activeTab === 'habits' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] mt-0.5" />
          )}
        </button>

        {/* Money Tab */}
        <button
          id="mobile-nav-money"
          onClick={() => setActiveTab('money')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'money'
              ? 'text-[#0F766E] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Wallet className={`w-5 h-5 mb-0.5 ${activeTab === 'money' ? 'stroke-[2.5]' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight">Money</span>
          {activeTab === 'money' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] mt-0.5" />
          )}
        </button>

        {/* Center Quick Add Action Button */}
        <div className="flex items-center justify-center -mt-6">
          <button
            id="mobile-nav-quick-add"
            onClick={onOpenQuickAdd}
            className="w-13 h-13 rounded-2xl bg-[#0F766E] hover:bg-[#0D655E] text-white flex items-center justify-center shadow-lg shadow-teal-900/20 ring-4 ring-white active:scale-90 transition-all cursor-pointer"
            title="Quick Action Menu"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* List Tab */}
        <button
          id="mobile-nav-list"
          onClick={() => setActiveTab('list')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'list'
              ? 'text-[#0F766E] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ListTodo className={`w-5 h-5 mb-0.5 ${activeTab === 'list' ? 'stroke-[2.5]' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight">List</span>
          {activeTab === 'list' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] mt-0.5" />
          )}
        </button>

        {/* Event Planner Tab */}
        <button
          id="mobile-nav-events"
          onClick={() => setActiveTab('events')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'events'
              ? 'text-[#0F766E] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <CalendarDays className={`w-5 h-5 mb-0.5 ${activeTab === 'events' ? 'stroke-[2.5]' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight">Planner</span>
          {activeTab === 'events' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
