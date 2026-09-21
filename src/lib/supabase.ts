import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Habit, Transaction, CareerMilestone, AIEvaluationResult, SupabaseConfig } from '../types';

const STORAGE_KEY_CONFIG = 'habitpulse_supabase_config';
const STORAGE_KEY_HABITS = 'habitpulse_habits_v1';
const STORAGE_KEY_TRANSACTIONS = 'habitpulse_transactions_v1';
const STORAGE_KEY_EVALUATIONS = 'habitpulse_evaluations_v1';
const STORAGE_KEY_CAREER = 'habitpulse_career_v1';

let activeSupabaseClient: SupabaseClient | null = null;

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse saved Supabase config', e);
  }
  return {
    url: '',
    anonKey: '',
    isConnected: false,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    if (config.url && config.anonKey) {
      activeSupabaseClient = createClient(config.url, config.anonKey);
    } else {
      activeSupabaseClient = null;
    }
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (activeSupabaseClient) return activeSupabaseClient;
  const config = getSavedSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      activeSupabaseClient = createClient(config.url, config.anonKey);
      return activeSupabaseClient;
    } catch (e) {
      console.error('Error creating Supabase client:', e);
    }
  }
  return null;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'URL must begin with https://' };
    }
    const client = createClient(url, anonKey);
    // Ping habits or query table
    const { error } = await client.from('habits').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, it's still connected to Supabase project
      if (error.code === '42P01' || error.message.includes('relation "public.habits" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! Run the provided SQL Schema in your SQL Editor to create tables.',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected and verified database access!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Supabase' };
  }
}

// Local Storage helpers for seamless offline/local use with user isolation
function getScopedKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}_${userId}` : baseKey;
}

export function getLocalHabits(fallback: Habit[], userId?: string): Habit[] {
  try {
    const key = getScopedKey(STORAGE_KEY_HABITS, userId);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    // Fallback to base key if scoped not found yet
    if (userId) {
      const baseData = localStorage.getItem(STORAGE_KEY_HABITS);
      if (baseData) return JSON.parse(baseData);
    }
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveLocalHabits(habits: Habit[], userId?: string): void {
  try {
    const key = getScopedKey(STORAGE_KEY_HABITS, userId);
    localStorage.setItem(key, JSON.stringify(habits));
  } catch (e) {
    console.error(e);
  }
}

export function getLocalTransactions(fallback: Transaction[], userId?: string): Transaction[] {
  try {
    const key = getScopedKey(STORAGE_KEY_TRANSACTIONS, userId);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    if (userId) {
      const baseData = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (baseData) return JSON.parse(baseData);
    }
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

export function saveLocalTransactions(transactions: Transaction[], userId?: string): void {
  try {
    const key = getScopedKey(STORAGE_KEY_TRANSACTIONS, userId);
    localStorage.setItem(key, JSON.stringify(transactions));
  } catch (e) {
    console.error(e);
  }
}

export function getLocalEvaluations(fallback: Record<string, AIEvaluationResult>, userId?: string): Record<string, AIEvaluationResult> {
  try {
    const key = getScopedKey(STORAGE_KEY_EVALUATIONS, userId);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    if (userId) {
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
  } catch (e) {
    console.error(e);
  }
}

export function getLocalCareerMilestones(fallback: CareerMilestone[], userId?: string): CareerMilestone[] {
  try {
    const key = getScopedKey(STORAGE_KEY_CAREER, userId);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    if (userId) {
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
  } catch (e) {
    console.error(e);
  }
}

// Fetch user habits from Supabase if connected
export async function fetchRemoteUserData(userId: string): Promise<{
  habits?: Habit[];
  transactions?: Transaction[];
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { error: 'Supabase client not configured' };

  try {
    const [habitsRes, txRes] = await Promise.all([
      client.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      client.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    ]);

    const result: { habits?: Habit[]; transactions?: Transaction[] } = {};

    if (habitsRes.data && habitsRes.data.length > 0) {
      result.habits = habitsRes.data.map(h => ({
        id: h.id,
        title: h.title,
        description: h.description,
        category: h.category,
        isDaily: h.is_daily,
        completedDates: h.completed_dates || [],
        targetDurationMinutes: h.target_duration_minutes,
        timeOfDay: h.time_of_day,
        priority: h.priority,
        streak: h.streak || 0,
        bestStreak: h.best_streak || 0,
        createdAt: h.created_at,
      }));
    }

    if (txRes.data && txRes.data.length > 0) {
      result.transactions = txRes.data.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        category: t.category,
        description: t.description,
        date: t.date,
        paymentMethod: t.payment_method,
        createdAt: t.created_at,
      }));
    }

    return result;
  } catch (err: any) {
    return { error: err.message };
  }
}


export async function deleteHabitFromSupabase(
  habitId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      success: false,
      message: 'Supabase client is not configured.',
    };
  }

  if (!habitId || !userId) {
    return {
      success: false,
      message: 'Habit ID and user ID are required.',
    };
  }

  try {
    const { error } = await client
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) {
      return {
        success: false,
        message: `Habit deletion failed: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Habit deleted from Supabase.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Habit deletion failed.',
    };
  }
}
// Sync all data to remote Supabase if connected

export async function deleteTransactionFromSupabase(
  transactionId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      success: false,
      message: 'Supabase client is not configured.',
    };
  }

  if (!transactionId || !userId) {
    return {
      success: false,
      message: 'Transaction ID and user ID are required.',
    };
  }

  try {
    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) {
      return {
        success: false,
        message: `Transaction deletion failed: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Transaction deleted from Supabase.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Transaction deletion failed.',
    };
  }
}
export async function syncAllToSupabase(
  habits: Habit[],
  transactions: Transaction[],
  careerMilestones: CareerMilestone[],
  userId?: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    // 1. Sync Habits
    const habitsPayload = habits.map(h => ({
      ...(h.id.includes('-') && h.id.length > 20 ? { id: h.id } : {}),
      user_id: userId && userId.includes('-') ? userId : undefined,
      title: h.title,
      description: h.description,
      category: h.category,
      is_daily: h.isDaily,
      completed_dates: h.completedDates,
      target_duration_minutes: h.targetDurationMinutes || 30,
      time_of_day: h.timeOfDay || 'anytime',
      priority: h.priority,
      streak: h.streak,
      best_streak: h.bestStreak,
    }));

    const { error: habitsError } = await client.from('habits').upsert(habitsPayload);
    if (habitsError) throw new Error(`Habits Sync Error: ${habitsError.message}`);

    // 2. Sync Transactions
    const txPayload = transactions.map(t => ({
      ...(t.id.includes('-') && t.id.length > 20 ? { id: t.id } : {}),
      user_id: userId && userId.includes('-') ? userId : undefined,
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
      payment_method: t.paymentMethod,
    }));

    const { error: txError } = await client.from('transactions').upsert(txPayload);
    if (txError) throw new Error(`Transactions Sync Error: ${txError.message}`);

    return {
      success: true,
      message: `Synchronized ${habits.length} habits and ${transactions.length} transactions to Supabase!`,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Sync failed' };
  }
}



