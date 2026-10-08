import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, BookOpen, HeartHandshake, SunMedium, Activity, Briefcase } from 'lucide-react';
import { Habit, LifeDimension } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  editingHabit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHabit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LifeDimension>('education');
  const [isDaily, setIsDaily] = useState(true);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(30);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category);
      setIsDaily(editingHabit.isDaily);
      setTargetDurationMinutes(editingHabit.targetDurationMinutes || 30);
      setTimeOfDay(editingHabit.timeOfDay || 'morning');
      setPriority(editingHabit.priority);
    } else {
      setTitle('');
      setDescription('');
      setCategory('education');
      setIsDaily(true);
      setTargetDurationMinutes(30);
      setTimeOfDay('morning');
      setPriority('medium');
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      isDaily,
      targetDurationMinutes: Number(targetDurationMinutes),
      timeOfDay,
      priority,
    });
    onClose();
  };

  const categories: { id: LifeDimension; label: string; icon: any }[] = [
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'religion', label: 'Religion', icon: SunMedium },
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'social', label: 'Social', icon: HeartHandshake },
    { id: 'career', label: 'Career', icon: Briefcase },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {editingHabit ? 'Edit Routine Target' : 'Create Routine Target'}
            </h3>
            <p className="text-xs text-slate-500">Configure parameters for daily discipline</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Habit / Task Name *
            </label>
            <input
              id="habit-title-input"
              type="text"
              required
              placeholder="e.g. Solve 2 LeetCode problems or 45-min gym workout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Micro-habits (Optional)
            </label>
            <textarea
              id="habit-desc-input"
              rows={2}
              placeholder="e.g. Focus on Graph algorithms, hydrate, and maintain posture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] resize-none transition-all"
            />
          </div>

          {/* Category Selector (5 Dimensions) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Life Dimension (Category)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] font-semibold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency (Daily Habit vs One-Time Task) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Frequency
              </label>
              <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setIsDaily(true)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    isDaily ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daily Habit
                </button>
                <button
                  type="button"
                  onClick={() => setIsDaily(false)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    !isDaily ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  One-Time Task
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                id="habit-priority-select"
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all cursor-pointer"
              >
                <option value="high">P1 High</option>
                <option value="medium">P2 Medium</option>
                <option value="low">P3 Low</option>
              </select>
            </div>
          </div>

          {/* Target duration & Time of Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Duration (Minutes)
              </label>
              <input
                id="habit-duration-input"
                type="number"
                min="5"
                max="480"
                step="5"
                value={targetDurationMinutes}
                onChange={(e) => setTargetDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0F766E] font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Time
              </label>
              <select
                id="habit-time-select"
                value={timeOfDay}
                onChange={(e: any) => setTimeOfDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0F766E] capitalize transition-all cursor-pointer"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-habit-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              {editingHabit ? 'Save Changes' : 'Create Routine Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
