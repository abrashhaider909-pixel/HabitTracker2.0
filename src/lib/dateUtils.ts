/**
 * Date utility functions for HabitPulse.
 * Avoids UTC timezone conversion shifts by operating purely on local date components.
 */

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getTodayDateStr(): string {
  return formatLocalDate(new Date());
}

export function addDays(dateStr: string, deltaDays: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + deltaDays);
  return formatLocalDate(d);
}

export function formatDisplayDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getTodayDayOfWeek(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}
