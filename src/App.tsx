import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { HabitsTab } from './components/HabitsTab';
import { MoneyTab } from './components/MoneyTab';
import { AIEvalTab } from './components/AIEvalTab';
import { CareerTab } from './components/CareerTab';
import { LoginPage } from './components/LoginPage';
import { HabitModal } from './components/HabitModal';
import { TransactionModal } from './components/TransactionModal';
import { AICoachModal } from './components/AICoachModal';
import { NotificationModal } from './components/NotificationModal';
import { ProfileModal } from './components/ProfileModal';
import { 
  Habit, 
  Transaction, 
  CareerMilestone, 
  AIEvaluationResult, 
  LifeDimension,
  AuthUser,
  NotificationSettings
} from './types';
import { 
  getLocalHabits, 
  saveLocalHabits, 
  getLocalTransactions, 
  saveLocalTransactions, 
  getLocalEvaluations, 
  saveLocalEvaluations, 
  getLocalCareerMilestones, 
  saveLocalCareerMilestones, 
  isSupabaseConfigured,
  fetchRemoteUserData,
  upsertHabitToSupabase,
  deleteHabitFromSupabase,
  upsertTransactionToSupabase,
  deleteTransactionFromSupabase
} from './lib/supabase';
import { 
  getSavedAuthUser, 
  saveAuthUser,
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
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const getTodayISO = () => getTodayDateStr();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [activeTab, setActiveTab] = useState<string>('habits');

  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(() => getSavedAuthUser());
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  // Push Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => getStoredNotificationSettings());
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const lastTriggeredMinuteRef = useRef<string>('');
  const lastLoadedUserIdRef = useRef<string | null>(null);

  // Core Data States (Scoped to active user for data privacy & persistence)
  const [habits, setHabits] = useState<Habit[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalHabits([], initialUser?.id);
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalTransactions([], initialUser?.id);
  });
  const [evaluations, setEvaluations] = useState<Record<string, AIEvaluationResult>>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalEvaluations({}, initialUser?.id);
  });
  const [careerMilestones, setCareerMilestones] = useState<CareerMilestone[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalCareerMilestones([], initialUser?.id);
  });

  // Modals
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string>('');

  // Toast Feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = useCallback((updated: Partial<AuthUser>) => {
    if (!user) return;
    const newUser: AuthUser = {
      ...user,
      ...updated,
    };
    setUser(newUser);
    saveAuthUser(newUser);
    showToast('Profile updated successfully!', 'success');
  }, [user]);

  // Initialize Auth & listen to auth state changes across tabs/refreshes
  useEffect(() => {
    let mounted = true;
    initializeAuth()
      .then((authUser) => {
        if (mounted) {
          setUser(authUser);
          setIsAuthInitializing(false);
        }
      })
      .catch((err) => {
        console.warn('Auth initialization notice:', err);
        if (mounted) {
          setIsAuthInitializing(false);
        }
      });

    const unsubscribe = onAuthStateChange((updatedUser) => {
      if (mounted) {
        setUser(updatedUser);
        setIsAuthInitializing(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Reload user data when active user account changes or on login
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      lastLoadedUserIdRef.current = null;
      return;
    }

    const currentUserId = user.id;
    if (lastLoadedUserIdRef.current === currentUserId) {
      return;
    }
    lastLoadedUserIdRef.current = currentUserId;

    const loadUserData = async () => {
      // 1. Load local cached data for this user
      const loadedHabits = getLocalHabits([], currentUserId);
      const loadedTransactions = getLocalTransactions([], currentUserId);

      const loadedEvals = getLocalEvaluations({}, currentUserId);
      const loadedMilestones = getLocalCareerMilestones([], currentUserId);

      if (cancelled) return;

      setHabits(loadedHabits);
      setTransactions(loadedTransactions);
      setEvaluations(loadedEvals);
      setCareerMilestones(loadedMilestones);

      // 2. Fetch live cloud data from Supabase scoped to this user
      if (isSupabaseConfigured()) {
        try {
          const remote = await fetchRemoteUserData(currentUserId, user.email);
          if (cancelled) return;

          // Safe habit merge: prioritize remote records if available; otherwise preserve local records and sync
          if (remote.habits && remote.habits.length > 0) {
            setHabits(remote.habits);
            saveLocalHabits(remote.habits, currentUserId);
          } else if (loadedHabits.length > 0) {
            setHabits(loadedHabits);
            for (const h of loadedHabits) {
              upsertHabitToSupabase(h, currentUserId).catch(() => {});
            }
          } else {
            // New account: clean empty private workspace
            setHabits([]);
            saveLocalHabits([], currentUserId);
          }

          // Safe transaction merge: prioritize remote records if available; otherwise reset to empty so dummy records never persist
          if (remote.transactions && remote.transactions.length > 0) {
            setTransactions(remote.transactions);
            saveLocalTransactions(remote.transactions, currentUserId);
          } else {
            setTransactions([]);
            saveLocalTransactions([], currentUserId);
          }
        } catch (error) {
          console.warn('Notice loading Supabase user data:', error);
        }
      }
    };

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Sync to local storage scoped to user
  useEffect(() => {
    if (user?.id) {
      saveLocalHabits(habits, user.id);
    }
  }, [habits, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveLocalTransactions(transactions, user.id);
    }
  }, [transactions, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveLocalEvaluations(evaluations, user.id);
    }
  }, [evaluations, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveLocalCareerMilestones(careerMilestones, user.id);
    }
  }, [careerMilestones, user?.id]);

  // Push Notification Background Scheduler (checks every 20 seconds)
  useEffect(() => {
    if (!notificationSettings.enabled || !user) return;

    const checkSchedules = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hours}:${minutes}`;
      const currentDayOfWeek = getTodayDayOfWeek();

      if (lastTriggeredMinuteRef.current === currentHHMM) {
        return;
      }

      const activeMatch = notificationSettings.schedules.find(
        (s) => s.enabled && s.time === currentHHMM && s.days.includes(currentDayOfWeek)
      );

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
  }, [notificationSettings, user]);

  const handleSaveNotificationSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    saveStoredNotificationSettings(newSettings);
    showToast('Push notification schedule updated');
  };

  // Habit Handlers
  const handleToggleHabit = useCallback((habitId: string) => {
    if (!user) return;
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id !== habitId) return h;
        return toggleHabitCompletion(h, selectedDate);
      });
      saveLocalHabits(updated, user.id);

      const toggled = updated.find((h) => h.id === habitId);
      if (toggled && isSupabaseConfigured()) {
        upsertHabitToSupabase(toggled, user.id).catch((err) => {
          console.warn('Background Supabase habit update notice:', err);
        });
      }
      return updated;
    });

    showToast('Routine status updated');
  }, [selectedDate, user]);

  const handleToggleHabitDate = useCallback((habitId: string, date: string) => {
    if (!user) return;
    setHabits((prev) => {
      const updated = prev.map((h) => {
        if (h.id !== habitId) return h;
        return toggleHabitCompletion(h, date);
      });
      saveLocalHabits(updated, user.id);

      const toggled = updated.find((h) => h.id === habitId);
      if (toggled && isSupabaseConfigured()) {
        upsertHabitToSupabase(toggled, user.id).catch((err) => {
          console.warn('Background Supabase habit update notice:', err);
        });
      }
      return updated;
    });

    showToast(`Logged status for ${date}`);
  }, [user]);

  const handleDeleteHabit = useCallback(async (habitId: string) => {
    if (!user) return;
    const target = habits.find((h) => h.id === habitId);
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== habitId);
      saveLocalHabits(updated, user.id);
      return updated;
    });

    if (isSupabaseConfigured()) {
      await deleteHabitFromSupabase(habitId, target?.title);
    }

    showToast('Habit deleted', 'info');
  }, [user, habits]);

  const handleSaveHabit = useCallback((habitData: Partial<Habit>) => {
    if (!user) return;
    if (editingHabit) {
      setHabits((prev) => {
        const updated = prev.map((h) => (h.id === editingHabit.id ? { ...h, ...habitData } as Habit : h));
        saveLocalHabits(updated, user.id);
        const saved = updated.find(h => h.id === editingHabit.id);
        if (saved && isSupabaseConfigured()) {
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
        saveLocalHabits(updated, user.id);
        if (isSupabaseConfigured()) {
          upsertHabitToSupabase(newHabit, user.id).catch(() => {});
        }
        return updated;
      });
      showToast('New habit target created');
    }
    setEditingHabit(null);
  }, [editingHabit, user]);

  // Transaction Handlers
  const handleAddTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const tempId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...txData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Immediate state update
    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      saveLocalTransactions(updated, user.id);
      return updated;
    });
    showToast(`Logged $${newTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${newTx.type}`);

    // Persist to Supabase
    if (isSupabaseConfigured()) {
      try {
        const res = await upsertTransactionToSupabase(newTx, user.id);
        if (res.success && res.insertedId && res.insertedId !== tempId) {
          setTransactions((prev) => {
            const updated = prev.map((t) => (t.id === tempId ? { ...t, id: String(res.insertedId) } : t));
            saveLocalTransactions(updated, user.id);
            return updated;
          });
        }
      } catch (err) {
        console.warn('Supabase transaction save notice:', err);
      }
    }
  }, [user]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    if (!user) return;
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveLocalTransactions(updated, user.id);
      return updated;
    });

    if (isSupabaseConfigured()) {
      await deleteTransactionFromSupabase(id, target?.description);
    }

    showToast('Transaction deleted', 'info');
  }, [user, transactions]);

  // Pull latest data from Supabase on demand
  const handleRefreshFromSupabase = useCallback(async () => {
    if (!user) return;
    setIsSyncingCloud(true);
    try {
      const remote = await fetchRemoteUserData(user.id, user.email);
      if (remote.transactions) {
        setTransactions(remote.transactions);
        saveLocalTransactions(remote.transactions, user.id);
      }
      if (remote.habits) {
        setHabits(remote.habits);
        saveLocalHabits(remote.habits, user.id);
      }
      showToast('Cloud synchronized successfully!', 'success');
    } catch (err: any) {
      showToast(`Sync notice: ${err.message || 'Check connection'}`, 'error');
    } finally {
      setIsSyncingCloud(false);
    }
  }, [user]);

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

  const handleLogout = async () => {
    await authSignOut();
    setUser(null);
    lastLoadedUserIdRef.current = null;
    showToast('Signed out of HabitPulse.', 'info');
  };

  const handleOpenCoachWithPrompt = (prompt?: string) => {
    setCoachInitialPrompt(prompt || '');
    setIsCoachModalOpen(true);
  };

  // 1. Initial Authentication Check Loading State
  if (isAuthInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Restoring secure session...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated User -> Dedicated Login / Account Creation Page
  if (!user) {
    return (
      <LoginPage 
        onAuthSuccess={(authUser) => {
          setUser(authUser);
          showToast(`Welcome to HabitPulse, ${authUser.displayName || 'friend'}!`);
        }} 
      />
    );
  }

  // 3. Authenticated User -> Main Life OS Application
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
        user={user}
        notificationSettings={notificationSettings}
        onLogout={handleLogout}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        onOpenHabitModal={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        onOpenCoachModal={() => handleOpenCoachWithPrompt()}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
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
            onRefreshSupabase={handleRefreshFromSupabase}
            isSyncingSupabase={isSyncingCloud}
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
            onAskCoachAboutTopic={(topic) => handleOpenCoachWithPrompt(`How should I prepare for and master "${topic}"?`)}
          />
        )}
      </main>

      {/* Modals */}
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

      <AICoachModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        habits={habits}
        transactions={transactions}
        careerMilestones={careerMilestones}
        initialPrompt={coachInitialPrompt}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        settings={notificationSettings}
        onSaveSettings={handleSaveNotificationSettings}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
