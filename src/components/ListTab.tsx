import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Tag, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ListTodo,
  Layers,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { ListItem } from '../types';

interface ListTabProps {
  items: ListItem[];
  onAddItem: (item: Omit<ListItem, 'id' | 'createdAt'>) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem?: (item: ListItem) => void;
}

const CATEGORIES = ['General', 'Work', 'Personal', 'Shopping', 'Study', 'Health', 'Errands'];

export const ListTab: React.FC<ListTabProps> = ({
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('General');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery) {
        const matchesQuery = 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesQuery) return false;
      }
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (statusFilter === 'pending' && item.completed) return false;
      if (statusFilter === 'completed' && !item.completed) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      return true;
    });
  }, [items, searchQuery, selectedCategory, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter(i => i.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, rate };
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddItem({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      category,
      completed: false,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setCategory('General');
    setIsAddingItem(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 text-[#0F766E] flex items-center justify-center font-bold">
              <ListTodo className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Action Items &amp; Lists
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep your errands, work sprints, and personal checklists structured with high clarity.
          </p>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex-1 sm:flex-none">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
            <span className="text-base font-black text-slate-900 font-mono">{stats.total}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-teal-50/80 border border-teal-200/80 text-center flex-1 sm:flex-none">
            <span className="block text-[10px] uppercase font-bold text-teal-700">Completed</span>
            <span className="text-base font-black text-[#0F766E] font-mono">{stats.completed}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-center flex-1 sm:flex-none">
            <span className="block text-[10px] uppercase font-bold text-amber-700">Pending</span>
            <span className="text-base font-black text-amber-900 font-mono">{stats.pending}</span>
          </div>

          <button
            onClick={() => setIsAddingItem(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ml-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Inline Create Form Modal / Accordion */}
      {isAddingItem && (
        <form 
          onSubmit={handleSubmit}
          className="bg-white border-2 border-[#0F766E]/30 rounded-2xl p-4 sm:p-6 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0F766E]" />
              New Checklist Item
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Finish client proposal deck, Buy groceries, Review PR #42"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent bg-slate-50/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add sub-points, links, or context..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent bg-slate-50/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-white cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                      priority === p
                        ? p === 'high' 
                          ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200' 
                          : p === 'medium' 
                          ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-200' 
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name or keywords..."
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-slate-50/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold text-[#0F766E]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-teal-50 border-teal-300 text-[#0F766E] font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-[#0F766E] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No items found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchQuery || selectedCategory !== 'All' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search keyword.'
                : 'Your checklist is currently empty. Add your first item to stay on track!'}
            </p>
            <button
              onClick={() => setIsAddingItem(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-xs hover:bg-[#0D655E] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Item</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group bg-white border rounded-xl p-3.5 sm:p-4 transition-all flex items-start sm:items-center justify-between gap-3 shadow-xs hover:shadow-md ${
                item.completed
                  ? 'border-slate-200 bg-slate-50/50 opacity-80'
                  : 'border-slate-200/90 hover:border-teal-200'
              }`}
            >
              {/* Checkbox and title */}
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleItem(item.id)}
                  className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-lg flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                    item.completed
                      ? 'bg-[#0F766E] text-white'
                      : 'border-2 border-slate-300 hover:border-[#0F766E] bg-white'
                  }`}
                  aria-label={item.completed ? 'Mark pending' : 'Mark completed'}
                >
                  {item.completed && <CheckSquare className="w-3.5 h-3.5" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-xs sm:text-sm font-bold transition-all ${
                        item.completed
                          ? 'line-through text-slate-400 font-normal'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </p>

                    {/* Priority badge */}
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-md ${
                        item.priority === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          : item.priority === 'medium'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.priority}
                    </span>

                    {/* Category badge */}
                    <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {item.category}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Due Date Indicator */}
                  {item.dueDate && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due: {item.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
