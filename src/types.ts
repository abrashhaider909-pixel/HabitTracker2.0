export type LifeDimension = 'education' | 'social' | 'religion' | 'health' | 'career';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: LifeDimension;
  isDaily: boolean; // true = daily recurring habit, false = one-time task
  completedDates: string[]; // array of ISO YYYY-MM-DD
  targetDurationMinutes?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  priority: 'high' | 'medium' | 'low';
  streak: number;
  bestStreak: number;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense' | 'savings';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  createdAt: string;
}

export interface DimensionEvaluation {
  name: string;
  score: number;
  feedback: string;
  status: 'optimal' | 'needs_attention' | 'warning';
}

export interface AIEvaluationResult {
  id: string;
  date: string;
  overallScore: number;
  grade: 'S' | 'A+' | 'A' | 'B' | 'C' | 'D';
  verdict: string;
  dimensions: DimensionEvaluation[];
  actionItems: string[];
  stoicQuote: string;
  aiGenerated: boolean;
  note?: string;
  createdAt: string;
}

export type CareerPillar = 'dsa' | 'system_design' | 'fullstack' | 'cloud_devops';
export type EngineeringLevel = 'junior' | 'mid' | 'senior' | 'lead';

export interface CareerMilestone {
  id: string;
  pillar: CareerPillar;
  level: EngineeringLevel;
  title: string;
  description: string;
  topics: string[];
  completed: boolean;
  completedAt?: string;
  targetCount?: number;
  currentCount?: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface NotificationSchedule {
  id: string;
  time: string; // "08:30"
  label: string;
  message: string;
  enabled: boolean;
  days: DayOfWeek[];
}

export interface NotificationSettings {
  enabled: boolean;
  schedules: NotificationSchedule[];
  soundEnabled: boolean;
  lastNotifiedAt?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  isGuest?: boolean;
  createdAt?: string;
}

export interface LifeOSState {
  habits: Habit[];
  transactions: Transaction[];
  evaluations: Record<string, AIEvaluationResult>; // key = date (YYYY-MM-DD)
  careerMilestones: CareerMilestone[];
  supabaseConfig: SupabaseConfig;
  selectedDate: string; // YYYY-MM-DD
  user: AuthUser | null;
  notificationSettings: NotificationSettings;
}

