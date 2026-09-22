import { Habit } from '../types';
import { getTodayDateStr, addDays } from './dateUtils';

/**
 * Accurately calculates both the current consecutive streak and best streak
 * for an array of completed local ISO date strings (YYYY-MM-DD).
 * Uses timezone-safe calendar arithmetic.
 */
export function calculateHabitStreak(completedDates: string[]): {
  currentStreak: number;
  bestStreak: number;
  isCompletedToday: boolean;
} {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, isCompletedToday: false };
  }

  // Deduplicate and sort dates ascending
  const uniqueDates = Array.from(new Set(completedDates)).filter(Boolean).sort();
  const dateSet = new Set(uniqueDates);

  const todayStr = getTodayDateStr();
  const yesterdayStr = addDays(todayStr, -1);

  const isCompletedToday = dateSet.has(todayStr);

  // 1. Calculate current streak:
  // Starts from today (if completed) or yesterday (if completed, pending today's checkoff)
  let currentStreak = 0;
  let cursor: string | null = isCompletedToday
    ? todayStr
    : dateSet.has(yesterdayStr)
    ? yesterdayStr
    : null;

  if (cursor) {
    while (cursor && dateSet.has(cursor)) {
      currentStreak++;
      cursor = addDays(cursor, -1);
    }
  }

  // 2. Calculate best streak across all recorded history:
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDateStr: string | null = null;

  for (const dStr of uniqueDates) {
    if (!prevDateStr) {
      tempStreak = 1;
    } else {
      const expectedNext = addDays(prevDateStr, 1);
      if (dStr === expectedNext) {
        tempStreak++;
      } else if (dStr > expectedNext) {
        tempStreak = 1;
      }
    }
    prevDateStr = dStr;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  return {
    currentStreak,
    bestStreak,
    isCompletedToday,
  };
}

/**
 * Checks if a habit or task is completed for a specific date or in general.
 */
export function isHabitCompleted(habit: Habit, targetDate: string): boolean {
  if (habit.isDaily) {
    return habit.completedDates.includes(targetDate);
  }
  // For one-time tasks: completed if any completed date exists
  return habit.completedDates.length > 0;
}

/**
 * Updates a habit's completedDates array for a given date, recalculating current and best streak.
 * For one-time tasks, toggles completion between completed (with targetDate) and incomplete.
 */
export function toggleHabitCompletion(
  habit: Habit,
  targetDate: string
): Habit {
  if (!habit.isDaily) {
    // One-time task logic:
    const currentlyDone = habit.completedDates.length > 0;
    const updatedDates = currentlyDone ? [] : [targetDate];
    return {
      ...habit,
      completedDates: updatedDates,
      streak: currentlyDone ? 0 : 1,
      bestStreak: currentlyDone ? habit.bestStreak : Math.max(habit.bestStreak, 1),
    };
  }

  // Daily recurring habit logic:
  const isDone = habit.completedDates.includes(targetDate);
  const updatedDates = isDone
    ? habit.completedDates.filter((d) => d !== targetDate)
    : [...habit.completedDates, targetDate];

  const stats = calculateHabitStreak(updatedDates);

  return {
    ...habit,
    completedDates: updatedDates,
    streak: stats.currentStreak,
    bestStreak: Math.max(habit.bestStreak, stats.bestStreak),
  };
}
