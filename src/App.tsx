import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { HabitsTab } from './components/HabitsTab';
import { MoneyTab } from './components/MoneyTab';
import { AIEvalTab } from './components/AIEvalTab';
import { CareerTab } from './components/CareerTab';
import { SupabaseModal } from './components/SupabaseModal';
import { HabitModal } from './components/HabitModal';
import { TransactionModal } from './components/TransactionModal';
import { AICoachModal } from './components/AICoachModal';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { 
  Habit, 
  Transaction, 
  CareerMilestone, 
  AIEvaluationResult, 
  SupabaseConfig, 
  LifeDimension,
  AuthUser,
  NotificationSettings
} from './types';
import { 
  INITIAL_HABITS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_CAREER_MILESTONES, 
  INITIAL_EVALUATION 
} from './lib/initialData';
import { 
  getLocalHabits, 
  saveLocalHabits, 
  getLocalTransactions, 
  saveLocalTransactions, 
  getLocalEvaluations, 
  saveLocalEvaluations, 
  getLocalCareerMilestones, 
  saveLocalCareerMilestones, 
  getSavedSupabaseConfig, 
  saveSupabaseConfig,
  isSupabaseConfigured,
  fetchRemoteUserData,
  upsertHabitToSupabase,
  deleteHabitFromSupabase,
  deleteTransactionFromSupabase,
  syncAllToSupabase
} from './lib/supabase';
import { 
  getSavedAuthUser, 
  initializeAuth, 
  signOut as authSignOut, 
  onAuthStateChange 
} from './lib/auth';
import { 
  getStoredNotificationSettings, 
  saveStoredNotificationSettings, 
  sendPushNotification, 
  playNotificationChime, 
  getTodayDayOfWeek 
} from './lib/notifications';
import { calculateHabitStreak, toggleHabitCompletion, isHabitCompleted } from './lib/streaks';
import { getTodayDateStr } from './lib/dateUtils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const getTodayISO = () => getTodayDateStr();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [activeTab, setActiveTab] = useState<string>('habits');

  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(() => getSavedAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Push Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => getStoredNotificationSettings());
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const lastTriggeredMinuteRef = useRef<string>('');
  const lastLoadedUserIdRef = useRef<string | null>(getSavedAuthUser()?.id || 'guest-demo-user');

  // Core Data States (Scoped to active user for data privacy & persistence)
  const [habits, setHabits] = useState<Habit[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalHabits(INITIAL_HABITS, initialUser?.id);
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalTransactions(INITIAL_TRANSACTIONS, initialUser?.id);
  });
  const [evaluations, setEvaluations] = useState<Record<string, AIEvaluationResult>>(() => {
    const initialUser = getSavedAuthUser();
    const today = getTodayDateStr();
    const loaded = getLocalEvaluations({ [today]: INITIAL_EVALUATION }, initialUser?.id);
    if (!loaded[today]) {
      loaded[today] = { ...INITIAL_EVALUATION, date: today };
    }
    return loaded;
  });
  const [careerMilestones, setCareerMilestones] = useState<CareerMilestone[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalCareerMilestones(INITIAL_CAREER_MILESTONES, initialUser?.id);
  });
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() => getSavedSupabaseConfig());

  // Modals
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string>('');

  // Toast Feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initialize Auth & listen to auth state changes
  useEffect(() => {
    let mounted = true;
    initializeAuth().then((authUser) => {
      if (mounted && authUser) {
        setUser(authUser);
      }
    });

    const unsubscribe = onAuthStateChange((updatedUser) => {
      if (mounted) {
        setUser(updatedUser);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Reload user data when active user account changes
  useEffect(() => {
    let cancelled = false;
    const currentUserId = user?.id || 'guest-demo-user';

    // Only reload if the user identity has actually switched to a different account
    if (lastLoadedUserIdRef.current === currentUserId && user?.isGuest) {
      return;
    }
    lastLoadedUserIdRef.current = currentUserId;

    const loadUserData = async () => {
      const userId = user?.id;

      console.log("HABITPULSE DEBUG - App user:", {
        id: user?.id,
        email: user?.email,
        isGuest: user?.isGuest
      });

      // Load local data first
      const loadedHabits = getLocalHabits(INITIAL_HABITS, userId);
      const loadedTransactions = getLocalTransactions(INITIAL_TRANSACTIONS, userId);

      const today = getTodayISO();
      const loadedEvals = getLocalEvaluations(
        { [today]: INITIAL_EVALUATION },
        userId
      );

      if (!loadedEvals[today]) {
        loadedEvals[today] = {
          ...INITIAL_EVALUATION,
          date: today,
        };
      }

      const loadedMilestones = getLocalCareerMilestones(
        INITIAL_CAREER_MILESTONES,
        userId
      );

      if (cancelled) return;

      setHabits(loadedHabits);
      setTransactions(loadedTransactions);
      setEvaluations(loadedEvals);
      setCareerMilestones(loadedMilestones);

      // Load cloud data for logged-in users when Supabase is configured
      if (userId && !user?.isGuest && isSupabaseConfigured()) {
        try {
          const remote = await fetchRemoteUserData(userId);

          if (cancelled) return;

          if (remote.error) {
            console.warn('Could not load Supabase data:', remote.error);
            return;
          }

          if (remote.habits) {
            setHabits(remote.habits);
            saveLocalHabits(remote.habits, userId);
          }

          if (remote.transactions) {
            setTransactions(remote.transactions);
            saveLocalTransactions(remote.transactions, userId);
          }

          console.log('Supabase data loaded successfully:', {
            habits: remote.habits?.length ?? 0,
            transactions: remote.transactions?.length ?? 0,
          });
        } catch (error) {
          console.warn('Notice loading Supabase data:', error);
        }
      }
    };

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  // Sync to local storage scoped to user
  useEffect(() => {
    saveLocalHabits(habits, user?.id);
  }, [habits, user?.id]);

  useEffect(() => {
    saveLocalTransactions(transactions, user?.id);
  }, [transactions, user?.id]);

  useEffect(() => {
    saveLocalEvaluations(evaluations, user?.id);
  }, [evaluations, user?.id]);

  useEffect(() => {
    saveLocalCareerMilestones(careerMilestones, user?.id);
  }, [careerMilestones, user?.id]);

  // Push Notification Background Scheduler (checks every 20 seconds)
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    const checkSchedules = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hours}:${minutes}`;
      const currentDayOfWeek = getTodayDayOfWeek();

      if (lastTriggeredMinuteRef.current === currentHHMM) {
        return;
      }

      const activeMatch = notificationSettings.schedules.find((s) => {
        return s.enabled && s.time === currentHHMM && s.days.includes(currentDayOfWeek);
      });

      if (activeMatch) {
        lastTriggeredMinuteRef.current = currentHHMM;

        sendPushNotification(activeMatch.label, {
          body: activeMatch.message,
          icon: '/favicon.ico',
        });

        if (notificationSettings.soundEnabled) {
          playNotificationChime();
        }

        showToast(`🔔 ${activeMatch.label}: ${activeMatch.message}`, 'info');
      }
    };

    checkSchedules();
    const interval = setInterval(checkSchedules, 20000);
    return () => clearInterval(interval);
  }, [notificationSettings]);

  const handleSaveNotificationSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    saveStoredNotificationSettings(newSettings);
    showToast('Push notification schedule updated');
  };

  // Habit Handlers with mathematically exact streak recalculation
  const handleToggleHabit = useCallback((habitId: string) => {
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id !== habitId) return h;
        return toggleHabitCompletion(h, selectedDate);
      });
      // Synchronous immediate disk write
      saveLocalHabits(updated, user?.id);

      const toggled = updated.find((h) => h.id === habitId);
      if (toggled && user?.id && !user?.isGuest && isSupabaseConfigured()) {
        upsertHabitToSupabase(toggled, user.id).catch((err) => {
          console.warn('Background Supabase habit update notice:', err);
        });
      }
      return updated;
    });

    showToast('Routine status updated');
  }, [selectedDate, user?.id, user?.isGuest]);

  // Toggle habit for any date (e.g. from 30-Day consistency heatmap or sparklines)
  const handleToggleHabitDate = useCallback((habitId: string, date: string) => {
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id !== habitId) return h;
        return toggleHabitCompletion(h, date);
      });
      // Synchronous immediate disk write
      saveLocalHabits(updated, user?.id);

      const toggled = updated.find((h) => h.id === habitId);
      if (toggled && user?.id && !user?.isGuest && isSupabaseConfigured()) {
        upsertHabitToSupabase(toggled, user.id).catch((err) => {
          console.warn('Background Supabase habit update notice:', err);
        });
      }
      return updated;
    });

    showToast(`Logged status for ${date}`);
  }, [user?.id, user?.isGuest]);

  const handleDeleteHabit = useCallback(async (habitId: string) => {
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== habitId);
      saveLocalHabits(updated, user?.id);
      return updated;
    });

    const currentUserId = user?.id;

    if (currentUserId && !user?.isGuest && isSupabaseConfigured()) {
      const result = await deleteHabitFromSupabase(habitId, currentUserId);

      if (!result.success) {
        console.warn('Failed to delete habit from Supabase:', result.message);
        showToast('Habit removed locally, but Supabase deletion failed.', 'error');
        return;
      }
    }

    showToast('Habit deleted', 'info');
  }, [user?.id, user?.isGuest]);

  const handleSaveHabit = useCallback((habitData: Partial<Habit>) => {
    if (editingHabit) {
      setHabits((prev) => {
        const updated = prev.map((h) => (h.id === editingHabit.id ? { ...h, ...habitData } as Habit : h));
        saveLocalHabits(updated, user?.id);
        const saved = updated.find(h => h.id === editingHabit.id);
        if (saved && user?.id && !user?.isGuest && isSupabaseConfigured()) {
          upsertHabitToSupabase(saved, user.id).catch(() => {});
        }
        return updated;
      });
      showToast('Habit updated');
    } else {
      const newHabit: Habit = {
        id: `h-${Date.now()}`,
        title: habitData.title || 'Untitled Habit',
        description: habitData.description,
        category: habitData.category || 'education',
        isDaily: habitData.isDaily ?? true,
        completedDates: [],
        targetDurationMinutes: habitData.targetDurationMinutes || 30,
        timeOfDay: habitData.timeOfDay || 'morning',
        priority: habitData.priority || 'medium',
        streak: 0,
        bestStreak: 0,
        createdAt: new Date().toISOString(),
      };
      setHabits((prev) => {
        const updated = [newHabit, ...prev];
        saveLocalHabits(updated, user?.id);
        if (user?.id && !user?.isGuest && isSupabaseConfigured()) {
          upsertHabitToSupabase(newHabit, user.id).catch(() => {});
        }
        return updated;
      });
      showToast('New habit target created');
    }
    setEditingHabit(null);
  }, [editingHabit, user?.id, user?.isGuest]);

  // Transaction Handlers
  const handleAddTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      saveLocalTransactions(updated, user?.id);
      return updated;
    });
    showToast(`Logged $${newTx.amount} ${newTx.type}`);
  }, [user?.id]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveLocalTransactions(updated, user?.id);
      return updated;
    });

    const currentUserId = user?.id;

    if (currentUserId && !user?.isGuest && isSupabaseConfigured()) {
      const result = await deleteTransactionFromSupabase(id, currentUserId);

      if (!result.success) {
        console.warn('Failed to delete transaction from Supabase:', result.message);
        showToast('Transaction removed locally, but Supabase deletion failed.', 'error');
        return;
      }
    }

    showToast('Transaction deleted', 'info');
  }, [user?.id, user?.isGuest]);

  // Career Milestone Handlers
  const handleToggleMilestone = useCallback((id: string) => {
    setCareerMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextCompleted = !m.completed;
        return {
          ...m,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString().split('T')[0] : undefined,
        };
      })
    );
    showToast('Career milestone updated');
  }, []);

  const handleIncrementMilestoneCount = useCallback((id: string) => {
    setCareerMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const current = (m.currentCount || 0) + 1;
        const target = m.targetCount || 1;
        const isNowCompleted = current >= target;
        return {
          ...m,
          currentCount: current,
          completed: isNowCompleted || m.completed,
          completedAt: isNowCompleted ? new Date().toISOString().split('T')[0] : m.completedAt,
        };
      })
    );
    showToast('Progress incremented (+1)');
  }, []);

  // AI 5-Dimension Routine Evaluation Call
  const handleRunEvaluation = async (userNotes?: string) => {
    setIsEvaluating(true);
    try {
      // Calculate category metric weights
      const dims: LifeDimension[] = ['education', 'religion', 'health', 'social', 'career'];
      const metrics: Record<string, number> = {};

      dims.forEach((d) => {
        const matching = habits.filter((h) => h.category === d);
        if (matching.length === 0) {
          metrics[d] = 50;
        } else {
          const done = matching.filter((h) => isHabitCompleted(h, selectedDate)).length;
          metrics[d] = Math.round((done / matching.length) * 100);
        }
      });

      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalSavings = transactions
        .filter((t) => t.type === 'savings')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const payload = {
        date: selectedDate,
        habits: habits.map((h) => ({
          title: h.title,
          category: h.category,
          completed: isHabitCompleted(h, selectedDate),
          streak: h.streak,
        })),
        metrics,
        financialSummary: {
          totalIncome,
          totalExpenses,
          totalSavings,
          savingsRate: totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0,
        },
        careerProgress: {
          masteredCount: careerMilestones.filter((m) => m.completed).length,
          totalMilestones: careerMilestones.length,
        },
        userNotes: userNotes || '',
      };

      const response = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        const newEval: AIEvaluationResult = {
          ...resJson.data,
          id: `eval-${Date.now()}`,
          date: selectedDate,
          createdAt: new Date().toISOString(),
        };

        setEvaluations((prev) => ({
          ...prev,
          [selectedDate]: newEval,
        }));
        showToast('5D Life Judgement generated successfully!');
      } else {
        throw new Error(resJson.error || 'Evaluation endpoint error');
      }
    } catch (err: any) {
      console.error('Evaluation error:', err);
      showToast(`Evaluation notice: ${err.message || 'Check server logs'}`, 'info');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveSupabaseConfig = async (cfg: SupabaseConfig) => {
    setSupabaseConfigState(cfg);
    saveSupabaseConfig(cfg);
    if (cfg.isConnected && cfg.url && cfg.anonKey) {
      await syncAllToSupabase(habits, transactions, careerMilestones, user?.id);
      showToast('Synced all data to Supabase!');
    } else {
      showToast(cfg.isConnected ? 'Supabase cloud configuration saved!' : 'Config updated');
    }
  };

  const handleLogout = async () => {
    await authSignOut();
    setUser(null);
    showToast('Signed out. Switched to guest workspace.', 'info');
  };

  const handleOpenCoachWithPrompt = (prompt?: string) => {
    setCoachInitialPrompt(prompt || '');
    setIsCoachModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-white shadow-xl shadow-black/60 text-xs font-semibold">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-indigo-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Persistent Navigation Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        habits={habits}
        supabaseConfig={supabaseConfig}
        user={user}
        notificationSettings={notificationSettings}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenHabitModal={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        onOpenCoachModal={() => handleOpenCoachWithPrompt()}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'habits' && (
          <HabitsTab
            habits={habits}
            selectedDate={selectedDate}
            onToggleHabit={handleToggleHabit}
            onToggleHabitDate={handleToggleHabitDate}
            onSelectDate={setSelectedDate}
            onDeleteHabit={handleDeleteHabit}
            onEditHabit={(h) => {
              setEditingHabit(h);
              setIsHabitModalOpen(true);
            }}
            onOpenAddModal={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
            onEvaluateDay={() => {
              setActiveTab('ai-eval');
              handleRunEvaluation();
            }}
          />
        )}

        {activeTab === 'money' && (
          <MoneyTab
            transactions={transactions}
            onAddTransaction={() => setIsTransactionModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'ai-eval' && (
          <AIEvalTab
            evaluation={evaluations[selectedDate] || null}
            evaluationsHistory={evaluations}
            selectedDate={selectedDate}
            habits={habits}
            onSelectDate={setSelectedDate}
            onRunEvaluation={handleRunEvaluation}
            isLoading={isEvaluating}
          />
        )}

        {activeTab === 'career' && (
          <CareerTab
            milestones={careerMilestones}
            onToggleMilestone={handleToggleMilestone}
            onIncrementCount={handleIncrementMilestoneCount}
            onOpenCoachModal={handleOpenCoachWithPrompt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">HabitPulse SaaS</span>
            <span>•</span>
            <span>All-In-One Habit Tracker & Life OS</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>5 Life Dimensions</span>
            <span>•</span>
            <span>Push Notifications</span>
            <span>•</span>
            <span>Supabase Auth & Sync</span>
            <span>•</span>
            <span>30-Day Consistency Visualizer</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        onAuthSuccess={(authUser) => {
          setUser(authUser);
          showToast(`Welcome, ${authUser.displayName || authUser.email}!`);
        }}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        settings={notificationSettings}
        onSaveSettings={handleSaveNotificationSettings}
      />

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleAddTransaction}
        defaultDate={selectedDate}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onSaveConfig={handleSaveSupabaseConfig}
        habits={habits}
        transactions={transactions}
        careerMilestones={careerMilestones}
      />

      <AICoachModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        initialPrompt={coachInitialPrompt}
        habits={habits}
        transactions={transactions}
        careerMilestones={careerMilestones}
      />
    </div>
  );
}









