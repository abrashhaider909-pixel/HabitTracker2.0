import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { HabitsTab } from './components/HabitsTab';
import { MoneyTab } from './components/MoneyTab';
import { ListTab } from './components/ListTab';
import { EventPlannerTab } from './components/EventPlannerTab';
import { LoginPage } from './components/LoginPage';
import { HabitModal } from './components/HabitModal';
import { TransactionModal } from './components/TransactionModal';
import { AICoachModal } from './components/AICoachModal';
import { NotificationModal } from './components/NotificationModal';
import { ProfileModal } from './components/ProfileModal';
import { MobileNav } from './components/MobileNav';
import { QuickActionModal } from './components/QuickActionModal';
import { SideDrawer } from './components/SideDrawer';
import { 
  Habit, 
  Transaction, 
  CareerMilestone, 
  AuthUser,
  NotificationSettings,
  ListItem,
  PlannedEvent
} from './types';
import { 
  getLocalHabits, 
  saveLocalHabits, 
  getLocalTransactions, 
  saveLocalTransactions, 
  getLocalListItems,
  saveLocalListItems,
  getLocalPlannedEvents,
  saveLocalPlannedEvents,
  getLocalCareerMilestones,
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

  // Core Data States (Scoped to active user)
  const [habits, setHabits] = useState<Habit[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalHabits([], initialUser?.id);
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalTransactions([], initialUser?.id);
  });
  const [listItems, setListItems] = useState<ListItem[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalListItems([], initialUser?.id);
  });
  const [plannedEvents, setPlannedEvents] = useState<PlannedEvent[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalPlannedEvents([], initialUser?.id);
  });
  const [careerMilestones] = useState<CareerMilestone[]>(() => {
    const initialUser = getSavedAuthUser();
    return getLocalCareerMilestones([], initialUser?.id);
  });

  // Modals
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string>('');

  // Toast Feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
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
      const loadedList = getLocalListItems([], currentUserId);
      const loadedEvents = getLocalPlannedEvents([], currentUserId);

      if (cancelled) return;

      setHabits(loadedHabits);
      setTransactions(loadedTransactions);
      setListItems(loadedList);
      setPlannedEvents(loadedEvents);

      // 2. Fetch live cloud data from Supabase scoped to this user
      if (isSupabaseConfigured()) {
        try {
          const remote = await fetchRemoteUserData(currentUserId, user.email);
          if (cancelled) return;

          if (remote.habits && remote.habits.length > 0) {
            setHabits(remote.habits);
            saveLocalHabits(remote.habits, currentUserId);
          } else if (loadedHabits.length > 0) {
            setHabits(loadedHabits);
            for (const h of loadedHabits) {
              upsertHabitToSupabase(h, currentUserId).catch(() => {});
            }
          } else {
            setHabits([]);
            saveLocalHabits([], currentUserId);
          }

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

  // Sync state changes to local storage scoped to user
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
      saveLocalListItems(listItems, user.id);
    }
  }, [listItems, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveLocalPlannedEvents(plannedEvents, user.id);
    }
  }, [plannedEvents, user?.id]);

  // Push Notification & Scheduled Event Reminders Background Scheduler (every 15s)
  useEffect(() => {
    if (!user) return;

    const checkSchedules = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hours}:${minutes}`;
      const todayISO = getTodayDateStr();
      const currentDayOfWeek = getTodayDayOfWeek();

      // Check general habit reminder schedules
      if (notificationSettings.enabled && lastTriggeredMinuteRef.current !== currentHHMM) {
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
      }

      // Check event planner reminders for today
      plannedEvents.forEach((ev) => {
        if (!ev.enableNotification || ev.status === 'completed' || ev.date !== todayISO) return;
        if (!ev.time) return;

        // Calculate time in minutes from midnight
        const [evH, evM] = ev.time.split(':').map(Number);
        const eventTotalMins = evH * 60 + evM;
        const currentTotalMins = now.getHours() * 60 + now.getMinutes();

        ev.reminders.forEach((reminder) => {
          if (reminder.sent) return;
          const targetTriggerMins = eventTotalMins - reminder.minutesBefore;

          // If current time reaches target minute
          if (currentTotalMins >= targetTriggerMins && currentTotalMins <= targetTriggerMins + 2) {
            reminder.sent = true;
            sendPushNotification(`Event Reminder: ${ev.title} 🔔`, {
              body: `Starting at ${ev.time} (${reminder.label})! ${ev.description || ''}`,
            });
            playNotificationChime();
            showToast(`📅 Event: ${ev.title} at ${ev.time}`, 'info');
            saveLocalPlannedEvents(plannedEvents, user.id);
          }
        });
      });
    };

    checkSchedules();
    const interval = setInterval(checkSchedules, 15000);
    return () => clearInterval(interval);
  }, [notificationSettings, plannedEvents, user]);

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
          console.warn('Background Supabase habit date update notice:', err);
        });
      }
      return updated;
    });
  }, [user]);

  const handleSaveHabit = useCallback((habitData: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'createdAt' | 'completedDates'> & { id?: string }) => {
    if (!user) return;
    if (habitData.id) {
      setHabits((prev) => {
        const updated = prev.map((h) => {
          if (h.id !== habitData.id) return h;
          const merged: Habit = {
            ...h,
            ...habitData,
            category: habitData.category,
            priority: habitData.priority,
            isDaily: habitData.isDaily,
            timeOfDay: habitData.timeOfDay,
            targetDurationMinutes: habitData.targetDurationMinutes,
          };
          if (isSupabaseConfigured()) {
            upsertHabitToSupabase(merged, user.id).catch(() => {});
          }
          return merged;
        });
        saveLocalHabits(updated, user.id);
        return updated;
      });
      showToast('Habit updated successfully');
    } else {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        title: habitData.title,
        description: habitData.description,
        category: habitData.category,
        isDaily: habitData.isDaily,
        completedDates: [],
        targetDurationMinutes: habitData.targetDurationMinutes,
        timeOfDay: habitData.timeOfDay,
        priority: habitData.priority,
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
      showToast('New habit created!');
    }
    setIsHabitModalOpen(false);
    setEditingHabit(null);
  }, [user]);

  const handleDeleteHabit = useCallback((habitId: string) => {
    if (!user) return;
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== habitId);
      saveLocalHabits(updated, user.id);
      if (isSupabaseConfigured()) {
        deleteHabitFromSupabase(habitId, user.id).catch(() => {});
      }
      return updated;
    });
    showToast('Habit removed', 'info');
  }, [user]);

  // Transaction Handlers
  const handleAddTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      saveLocalTransactions(updated, user.id);
      if (isSupabaseConfigured()) {
        upsertTransactionToSupabase(newTx, user.id).catch(() => {});
      }
      return updated;
    });

    setIsTransactionModalOpen(false);
    showToast('Transaction logged successfully');
  }, [user]);

  const handleDeleteTransaction = useCallback((txId: string) => {
    if (!user) return;
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== txId);
      saveLocalTransactions(updated, user.id);
      if (isSupabaseConfigured()) {
        deleteTransactionFromSupabase(txId, user.id).catch(() => {});
      }
      return updated;
    });
    showToast('Transaction removed', 'info');
  }, [user]);

  const handleRefreshFromSupabase = useCallback(async () => {
    if (!user) return;
    setIsSyncingCloud(true);
    try {
      const remote = await fetchRemoteUserData(user.id, user.email);
      if (remote.habits) {
        setHabits(remote.habits);
        saveLocalHabits(remote.habits, user.id);
      }
      if (remote.transactions) {
        setTransactions(remote.transactions);
        saveLocalTransactions(remote.transactions, user.id);
      }
      showToast('Cloud data synced successfully!');
    } catch (err: any) {
      showToast(`Cloud sync notice: ${err.message || 'Offline fallback active'}`, 'info');
    } finally {
      setIsSyncingCloud(false);
    }
  }, [user]);

  // List Handlers
  const handleAddListItem = useCallback((itemData: Omit<ListItem, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newItem: ListItem = {
      ...itemData,
      id: `list-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setListItems((prev) => {
      const updated = [newItem, ...prev];
      saveLocalListItems(updated, user.id);
      return updated;
    });
    showToast('Checklist item added!');
  }, [user]);

  const handleToggleListItem = useCallback((id: string) => {
    if (!user) return;
    setListItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : undefined,
        };
      });
      saveLocalListItems(updated, user.id);
      return updated;
    });
    showToast('Item status updated');
  }, [user]);

  const handleDeleteListItem = useCallback((id: string) => {
    if (!user) return;
    setListItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveLocalListItems(updated, user.id);
      return updated;
    });
    showToast('Item removed', 'info');
  }, [user]);

  // Planned Event Handlers
  const handleAddEvent = useCallback((eventData: Omit<PlannedEvent, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newEvent: PlannedEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlannedEvents((prev) => {
      const updated = [newEvent, ...prev];
      saveLocalPlannedEvents(updated, user.id);
      return updated;
    });
    showToast(`Event planned for ${newEvent.dayOfWeek}, ${newEvent.month}!`);
  }, [user]);

  const handleDeleteEvent = useCallback((id: string) => {
    if (!user) return;
    setPlannedEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveLocalPlannedEvents(updated, user.id);
      return updated;
    });
    showToast('Event removed', 'info');
  }, [user]);

  const handleToggleEventStatus = useCallback((id: string) => {
    if (!user) return;
    setPlannedEvents((prev) => {
      const updated = prev.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          status: (e.status === 'completed' ? 'upcoming' : 'completed') as PlannedEvent['status'],
        };
      });
      saveLocalPlannedEvents(updated, user.id);
      return updated;
    });
    showToast('Event status updated');
  }, [user]);

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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0F766E] flex items-center justify-center shadow-lg shadow-teal-900/10">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
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

  // 3. Authenticated User -> Main Application
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-xl shadow-slate-200/50 text-xs font-semibold">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#0F766E]" />
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
        onOpenSideDrawer={() => setIsSideDrawerOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8">
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
            onOpenEventPlanner={() => setActiveTab('events')}
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

        {activeTab === 'list' && (
          <ListTab
            items={listItems}
            onAddItem={handleAddListItem}
            onToggleItem={handleToggleListItem}
            onDeleteItem={handleDeleteListItem}
          />
        )}

        {activeTab === 'events' && (
          <EventPlannerTab
            events={plannedEvents}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onToggleEventStatus={handleToggleEventStatus}
          />
        )}
      </main>

      {/* Mobile Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickActionOpen(true)}
      />

      {/* Quick Action Bottom Sheet / Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onOpenHabitModal={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        onOpenListTab={() => setActiveTab('list')}
        onOpenEventsTab={() => setActiveTab('events')}
        onOpenSideDrawer={() => setIsSideDrawerOpen(true)}
      />

      {/* 3-Bars Side Navigation Drawer */}
      <SideDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        habits={habits}
        transactions={transactions}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
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
      />

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
