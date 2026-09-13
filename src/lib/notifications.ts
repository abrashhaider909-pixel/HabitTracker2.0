import { NotificationSchedule, NotificationSettings, DayOfWeek } from '../types';

const STORAGE_KEY_NOTIFICATIONS = 'habitpulse_notification_settings_v1';

export const DEFAULT_SCHEDULES: NotificationSchedule[] = [
  {
    id: 'sched-morning',
    time: '08:30',
    label: 'Morning Routine Kickoff',
    message: 'Start your day strong! Complete your morning habits and set your daily focus.',
    enabled: true,
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  },
  {
    id: 'sched-afternoon',
    time: '14:00',
    label: 'Midday Momentum Check',
    message: 'Check in on your daily tasks. Keep the momentum going for Education and Health!',
    enabled: true,
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  },
  {
    id: 'sched-evening',
    time: '21:00',
    label: 'Evening Reflection & 5D Review',
    message: 'Review your consistency! Check off remaining habits before midnight and request your 5D AI Life Judgement.',
    enabled: true,
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  },
];

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  schedules: DEFAULT_SCHEDULES,
};

export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...parsed,
        schedules: parsed.schedules || DEFAULT_SCHEDULES,
      };
    }
  } catch (e) {
    console.error('Failed to load notification settings', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveStoredNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings', e);
  }
}

// Browser Push Notification Permission
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission', e);
    return 'denied';
  }
}

// Synthesize pleasant chime using Web Audio API
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // First tone (523.25 Hz - C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.35);

    // Second harmonious tone (659.25 Hz - E5)
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain2.gain.setValueAtTime(0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.45);
      } catch {
        // ignore
      }
    }, 120);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

// Send push notification
export function sendPushNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (e) {
      console.warn('Native notification failed, using fallback', e);
      return false;
    }
  }
  return false;
}

// Convert day index to DayOfWeek
export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
}
