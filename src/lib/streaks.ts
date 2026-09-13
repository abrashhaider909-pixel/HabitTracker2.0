import { Habit } from '../types';

/**
 * Accurately calculates both the current consecutive streak and best streak
 * for an array of completed ISO date strings (YYYY-MM-DD).
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
  const uniqueDates = Array.from(new Set(completedDates)).sort();
  const dateSet = new Set(uniqueDates);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const isCompletedToday = dateSet.has(todayStr);

  // 1. Calculate current streak:
  // Starts from today (if done) or yesterday (if done), and steps backward day-by-day
  let currentStreak = 0;
  let cursor = new Date(today);

  if (isCompletedToday) {
    while (true) {
      const dStr = cursor.toISOString().split('T')[0];
      if (dateSet.has(dStr)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (dateSet.has(yesterdayStr)) {
    // Completed yesterday; streak is alive pending today's checkoff
    cursor = new Date(yesterday);
    while (true) {
      const dStr = cursor.toISOString().split('T')[0];
      if (dateSet.has(dStr)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  // 2. Calculate best streak across all recorded history:
  let bestStreak = 0;
  let tempStreak = 0;
  let prevTime: number | null = null;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (const dStr of uniqueDates) {
    const curTime = new Date(dStr + 'T00:00:00').getTime();
    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const dayDiff = Math.round((curTime - prevTime) / ONE_DAY_MS);
      if (dayDiff === 1) {
        tempStreak++;
      } else if (dayDiff > 1) {
        tempStreak = 1;
      }
    }
    prevTime = curTime;
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
 * Updates a habit's completedDates array for a given date, recalculating current and best streak.
 */
export function toggleHabitCompletion(
  habit: Habit,
  targetDate: string
): Habit {
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
