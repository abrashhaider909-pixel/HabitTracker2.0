import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, BookOpen, HeartHandshake, SunMedium, Activity, Briefcase, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-base font-bold text-white tracking-tight">
            {editingHabit ? 'Edit Routine Target' : 'Create Routine Target'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Habit / Task Name *
            </label>
            <input
              id="habit-title-input"
              type="text"
              required
              placeholder="e.g. Solve 2 LeetCode problems or 45-min gym workout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Micro-habits (Optional)
            </label>
            <textarea
              id="habit-desc-input"
              rows={2}
              placeholder="e.g. Focus on Graph algorithms, hydrate, and maintain posture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Category Selector (5 Dimensions) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency (Daily Habit vs One-Time Task) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Frequency
              </label>
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setIsDaily(true)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    isDaily ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daily Habit
                </button>
                <button
                  type="button"
                  onClick={() => setIsDaily(false)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    !isDaily ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  One-Time Task
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                id="habit-priority-select"
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preferred Time
              </label>
              <select
                id="habit-time-select"
                value={timeOfDay}
                onChange={(e: any) => setTimeOfDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-habit-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              {editingHabit ? 'Save Changes' : 'Create Routine Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
