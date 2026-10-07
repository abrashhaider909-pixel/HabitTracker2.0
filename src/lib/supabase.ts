import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Habit, Transaction, CareerMilestone, AIEvaluationResult, SupabaseConfig, TransactionType } from '../types';

const STORAGE_KEY_HABITS = 'habitpulse_habits_v1';
const STORAGE_KEY_TRANSACTIONS = 'habitpulse_transactions_v1';
const STORAGE_KEY_EVALUATIONS = 'habitpulse_evaluations_v1';
const STORAGE_KEY_CAREER = 'habitpulse_career_v1';

let activeSupabaseClient: SupabaseClient | null = null;
let lastClientKey: string = '';

export function isValidUUID(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
    || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function getRefFromJwt(jwt?: string | null): string | null {
  if (!jwt || typeof jwt !== 'string') return null;
  try {
    const parts = jwt.split('.');
    if (parts.length >= 2) {
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const decoded = typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      return parsed.ref || null;
    }
  } catch {
    // Ignore decode errors
  }
  return null;
}

export function getRefFromUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/i);
  return match ? match[1].toLowerCase() : null;
}

const DEFAULT_SUPABASE_URL = 'https://ouulqzyyjlbovrlffkfg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dWxxenl5amxib3ZybGZma2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTQ4NTUsImV4cCI6MjEwNDg3MDg1NX0.B8MXHt5jiiewOyFBIkTSCfdCJu6UIS6Qu3z_RS7-oqo';

// Internal Supabase configuration - connected directly to user project ouulqzyyjlbovrlffkfg
export function getInternalSupabaseCredentials(): { url: string; anonKey: string } {
  const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '';
  const envUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || '';

  const keyRef = getRefFromJwt(envKey);
  const anonKey = (keyRef === 'ouulqzyyjlbovrlffkfg') ? envKey : DEFAULT_SUPABASE_ANON_KEY;
  const url = (envUrl && envUrl.includes('ouulqzyyjlbovrlffkfg')) ? envUrl : DEFAULT_SUPABASE_URL;

  return {
    url,
    anonKey,
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getInternalSupabaseCredentials();
  if (!url || !anonKey) {
    return null;
  }

  const clientKey = `${url}::${anonKey}`;
  if (activeSupabaseClient && lastClientKey === clientKey) {
    return activeSupabaseClient;
  }

  try {
    activeSupabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastClientKey = clientKey;
    return activeSupabaseClient;
  } catch (e) {
    console.error('Error initializing internal Supabase client:', e);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getInternalSupabaseCredentials();
  return Boolean(url && anonKey);
}

// Storage helpers scoped to user with record preservation fallback
function getScopedKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}_${userId}` : baseKey;
}

export function getLocalHabits(fallback: Habit[] = [], userId?: string): Habit[] {
  try {
    if (userId) {
      const key = getScopedKey(STORAGE_KEY_HABITS, userId);
      const data = localStorage.getItem(key);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    }
  } catch (e) {
    console.error('Failed to read local habits:', e);
  }
  return fallback;
}

export function saveLocalHabits(habits: Habit[], userId?: string): void {
  try {
    if (userId) {
      const key = getScopedKey(STORAGE_KEY_HABITS, userId);
      localStorage.setItem(key, JSON.stringify(habits));
    }
  } catch (e) {
    console.error(e);
  }
}

export function getLocalTransactions(fallback: Transaction[] = [], userId?: string): Transaction[] {
  try {
    if (userId) {
      const key = getScopedKey(STORAGE_KEY_TRANSACTIONS, userId);
      const data = localStorage.getItem(key);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    }
  } catch (e) {
    console.error('Failed to read local transactions:', e);
  }
  return fallback;
}

export function saveLocalTransactions(transactions: Transaction[], userId?: string): void {
  try {
    if (userId) {
      const key = getScopedKey(STORAGE_KEY_TRANSACTIONS, userId);
      localStorage.setItem(key, JSON.stringify(transactions));
    }
  } catch (e) {
    console.error(e);
  }
}

export function getLocalEvaluations(fallback: Record<string, AIEvaluationResult>, userId?: string): Record<string, AIEvaluationResult> {
  try {
    if (userId) {
      const key = getScopedKey(STORAGE_KEY_EVALUATIONS, userId);
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      const guestData = localStorage.getItem(`${STORAGE_KEY_EVALUATIONS}_guest-demo-user`);
      if (guestData) {
        localStorage.setItem(key, guestData);
        return JSON.parse(guestData);
      }

      const baseData = localStorage.getItem(STORAGE_KEY_EVALUATIONS);
      if (baseData) {
        localStorage.setItem(key, baseData);
        return JSON.parse(baseData);
      }
    } else {
      const baseData = localStorage.getItem(STORAGE_KEY_EVALUATIONS);
      if (baseData) return JSON.parse(baseData);
    }
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveLocalEvaluations(evaluations: Record<string, AIEvaluationResult>, userId?: string): void {
  try {
    const key = getScopedKey(STORAGE_KEY_EVALUATIONS, userId);
    localStorage.setItem(key, JSON.stringify(evaluations));
    localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(evaluations));
  } catch (e) {
    console.error(e);
  }
}

export function getLocalCareerMilestones(fallback: CareerMilestone[], userId?: string): CareerMilestone[] {
  try {
    if (userId) {
      const key = getScopedKey(STORAGE_KEY_CAREER, userId);
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      const guestData = localStorage.getItem(`${STORAGE_KEY_CAREER}_guest-demo-user`);
      if (guestData) {
        const parsed = JSON.parse(guestData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(key, guestData);
          return parsed;
        }
      }

      const baseData = localStorage.getItem(STORAGE_KEY_CAREER);
      if (baseData) {
        const parsed = JSON.parse(baseData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(key, baseData);
          return parsed;
        }
      }
    } else {
      const baseData = localStorage.getItem(STORAGE_KEY_CAREER);
      if (baseData) return JSON.parse(baseData);
    }
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveLocalCareerMilestones(milestones: CareerMilestone[], userId?: string): void {
  try {
    const key = getScopedKey(STORAGE_KEY_CAREER, userId);
    localStorage.setItem(key, JSON.stringify(milestones));
    localStorage.setItem(STORAGE_KEY_CAREER, JSON.stringify(milestones));
  } catch (e) {
    console.error(e);
  }
}

// Fetch user transactions specifically from Supabase with user privacy
export async function fetchRemoteTransactions(userId?: string, userEmail?: string): Promise<{
  transactions: Transaction[];
  tableExists: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { transactions: [], tableExists: false, error: 'Supabase client is not configured' };
  }

  try {
    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const isAbrash = cleanEmail === 'abrashhaider909@gmail.com' || userId === 'f058fc67-b31d-4dfe-8433-660c50b19dcf';

    let txRes: any;
    if (isAbrash) {
      txRes = await client
        .from('transactions')
        .select('*')
        .or('user_id.eq.f058fc67-b31d-4dfe-8433-660c50b19dcf,user_id.is.null')
        .order('date', { ascending: false });
    } else if (userId && isValidUUID(userId)) {
      txRes = await client
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
    } else {
      return { transactions: [], tableExists: true };
    }

    if (txRes.error) {
      const isTableMissing =
        txRes.error.code === '42P01' ||
        txRes.error.code === 'PGRST205' ||
        txRes.error.message?.toLowerCase().includes('not find') ||
        txRes.error.message?.toLowerCase().includes('does not exist');

      return {
        transactions: [],
        tableExists: !isTableMissing,
        error: txRes.error.message,
      };
    }

    const rows = txRes.data || [];
    const mapped: Transaction[] = rows.map((t: any, index: number) => {
      let rawType = String(t.type || '').toLowerCase();
      let normalizedType: TransactionType = 'expense';
      if (rawType.includes('inc') || rawType === 'credit') {
        normalizedType = 'income';
      } else if (rawType.includes('sav') || rawType.includes('invest')) {
        normalizedType = 'savings';
      } else {
        normalizedType = 'expense';
      }

      return {
        id: t.id ? String(t.id) : `tx-sb-${index}-${Date.now()}`,
        type: normalizedType,
        amount: Math.abs(Number(t.amount ?? t.value ?? t.total ?? 0)),
        category: String(t.category || t.category_name || t.categoryName || 'General'),
        description: String(t.description || t.name || t.title || t.notes || 'Transaction'),
        date: t.date || (t.created_at ? String(t.created_at).split('T')[0] : new Date().toISOString().split('T')[0]),
        paymentMethod: String(t.payment_method || t.paymentMethod || t.channel || 'Card'),
        createdAt: t.created_at || t.createdAt || new Date().toISOString(),
      };
    });

    return {
      transactions: mapped,
      tableExists: true,
    };
  } catch (err: any) {
    return {
      transactions: [],
      tableExists: false,
      error: err.message || 'Failed to query Supabase transactions',
    };
  }
}

// Fetch all remote user data (habits and transactions)
export async function fetchRemoteUserData(userId?: string, userEmail?: string): Promise<{
  habits?: Habit[];
  transactions?: Transaction[];
  tableExists?: { habits: boolean; transactions: boolean };
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return {};

  try {
    const txResult = await fetchRemoteTransactions(userId, userEmail);

    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const isAbrash = cleanEmail === 'abrashhaider909@gmail.com' || userId === 'f058fc67-b31d-4dfe-8433-660c50b19dcf';

    let habitsRows: any[] = [];
    let habitsError = null;

    if (isAbrash) {
      // Abrash Haider gets his 13 authentic habits
      const hRes = await client
        .from('habits')
        .select('*')
        .or('user_id.eq.f058fc67-b31d-4dfe-8433-660c50b19dcf,user_id.is.null')
        .order('created_at', { ascending: false });

      habitsRows = hRes.data || [];
      habitsError = hRes.error;
    } else if (userId && isValidUUID(userId)) {
      // Other accounts ONLY see habits created by their own user ID
      const hRes = await client
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      habitsRows = hRes.data || [];
      habitsError = hRes.error;
    } else {
      habitsRows = [];
    }

    const result: {
      habits?: Habit[];
      transactions?: Transaction[];
      tableExists?: { habits: boolean; transactions: boolean };
      error?: string;
    } = {
      transactions: txResult.transactions,
      tableExists: {
        transactions: txResult.tableExists,
        habits: !habitsError || (!habitsError.message?.includes('not find') && habitsError.code !== '42P01'),
      },
    };

    if (txResult.error) {
      result.error = txResult.error;
    }

    if (habitsRows && habitsRows.length > 0) {
      const habitMap = new Map<string, any>();
      for (const h of habitsRows) {
        const key = (h.title || '').trim().toLowerCase();
        if (!habitMap.has(key) || (new Date(h.created_at).getTime() > new Date(habitMap.get(key).created_at).getTime())) {
          habitMap.set(key, h);
        }
      }
      const uniqueHabits = Array.from(habitMap.values());
      result.habits = uniqueHabits.map((h: any) => ({
        id: String(h.id),
        title: h.title,
        description: h.description,
        category: h.category,
        isDaily: h.is_daily ?? true,
        completedDates: h.completed_dates || [],
        targetDurationMinutes: h.target_duration_minutes || 30,
        timeOfDay: h.time_of_day || 'anytime',
        priority: h.priority || 'medium',
        streak: h.streak || 0,
        bestStreak: h.best_streak || 0,
        createdAt: h.created_at || new Date().toISOString(),
      }));
    } else {
      result.habits = [];
    }

    return result;
  } catch (err: any) {
    return { error: err.message };
  }
}

// Save or Upsert single Transaction to Supabase
export async function upsertTransactionToSupabase(
  tx: Transaction,
  userId?: string
): Promise<{ success: boolean; message: string; insertedId?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true, message: 'Local storage mode.' };
  }

  try {
    let authUid: string | null = null;
    try {
      const { data: sessionData } = await client.auth.getSession();
      authUid = sessionData?.session?.user?.id || null;
    } catch {
      // Ignore
    }

    const effectiveUserId = authUid || (userId && isValidUUID(userId) ? userId : undefined);

    const payload: any = {
      type: tx.type,
      amount: Number(tx.amount),
      category: tx.category,
      description: tx.description,
      date: tx.date,
      payment_method: tx.paymentMethod || 'Card',
    };

    if (isValidUUID(tx.id)) {
      payload.id = tx.id;
    }
    if (effectiveUserId) {
      payload.user_id = effectiveUserId;
    }

    const { data, error } = await client.from('transactions').upsert(payload).select().single();
    if (error) {
      const insertRes = await client.from('transactions').insert(payload).select().single();
      if (insertRes.error) {
        return { success: false, message: insertRes.error.message };
      }
      return { success: true, message: 'Saved to Supabase', insertedId: insertRes.data?.id };
    }

    return { success: true, message: 'Saved to Supabase', insertedId: data?.id };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to save transaction to Supabase' };
  }
}

// Delete single Transaction from Supabase
export async function deleteTransactionFromSupabase(
  transactionId: string,
  description?: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true, message: 'Local delete only.' };
  }

  try {
    if (isValidUUID(transactionId)) {
      await client.from('transactions').delete().eq('id', transactionId);
    }
    if (description && description.trim()) {
      await client.from('transactions').delete().ilike('description', description.trim());
    }
    return { success: true, message: 'Transaction removed from Supabase' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Delete failed' };
  }
}

// Upsert Habit to Supabase
export async function upsertHabitToSupabase(
  habit: Habit,
  userId?: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true, message: 'Local mode only.' };
  }

  try {
    let authUid: string | null = null;
    try {
      const { data: sessionData } = await client.auth.getSession();
      authUid = sessionData?.session?.user?.id || null;
    } catch {
      // Ignore
    }

    const effectiveUserId = authUid || (userId && isValidUUID(userId) ? userId : undefined);

    const payload: any = {
      title: habit.title,
      description: habit.description,
      category: habit.category,
      is_daily: habit.isDaily,
      completed_dates: habit.completedDates,
      target_duration_minutes: habit.targetDurationMinutes || 30,
      time_of_day: habit.timeOfDay || 'anytime',
      priority: habit.priority,
      streak: habit.streak,
      best_streak: habit.bestStreak,
    };

    if (isValidUUID(habit.id)) {
      payload.id = habit.id;
    }
    if (effectiveUserId) {
      payload.user_id = effectiveUserId;
    }

    const { error } = await client.from('habits').upsert(payload);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Habit synchronized with Supabase' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Upsert failed' };
  }
}

// Delete Habit from Supabase
export async function deleteHabitFromSupabase(
  habitId: string,
  title?: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true, message: 'Local delete only.' };
  }

  try {
    if (isValidUUID(habitId)) {
      await client.from('habits').delete().eq('id', habitId);
    }
    if (title && title.trim()) {
      await client.from('habits').delete().ilike('title', title.trim());
    }
    return { success: true, message: 'Habit deleted from Supabase.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Delete failed.' };
  }
}
