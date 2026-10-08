import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Clock, 
  Check, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Sparkles,
  Send,
  Calendar
} from 'lucide-react';
import { NotificationSettings, NotificationSchedule, DayOfWeek } from '../types';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  playNotificationChime, 
  sendPushNotification 
} from '../lib/notifications';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (settings: NotificationSettings) => void;
  onTriggerTestToast: (title: string, message: string) => void;
}

const ALL_DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'S' },
];

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTriggerTestToast,
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    const perm = await requestNotificationPermission();
    setBrowserPermission(perm);
    setIsRequestingPermission(false);
  };

  const handleToggleMaster = () => {
    const updated = { ...localSettings, enabled: !localSettings.enabled };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...localSettings, soundEnabled: !localSettings.soundEnabled };
    setLocalSettings(updated);
    onSaveSettings(updated);
    if (updated.soundEnabled) {
      playNotificationChime();
    }
  };

  const handleTimeChange = (id: string, newTime: string) => {
    const updatedSchedules = localSettings.schedules.map(s => 
      s.id === id ? { ...s, time: newTime } : s
    );
    const updated = { ...localSettings, schedules: updatedSchedules };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleToggleSchedule = (id: string) => {
    const updatedSchedules = localSettings.schedules.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    const updated = { ...localSettings, schedules: updatedSchedules };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleToggleDay = (schedId: string, day: DayOfWeek) => {
    const updatedSchedules = localSettings.schedules.map(s => {
      if (s.id !== schedId) return s;
      const exists = s.days.includes(day);
      const newDays = exists ? s.days.filter(d => d !== day) : [...s.days, day];
      return { ...s, days: newDays.length > 0 ? newDays : [day] }; // At least one day
    });
    const updated = { ...localSettings, schedules: updatedSchedules };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleDeleteSchedule = (id: string) => {
    const updatedSchedules = localSettings.schedules.filter(s => s.id !== id);
    const updated = { ...localSettings, schedules: updatedSchedules };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleAddSchedule = () => {
    const newId = `sched-${Date.now()}`;
    const newSchedule: NotificationSchedule = {
      id: newId,
      time: '18:00',
      label: 'Evening Wrap-up & Finance',
      message: 'Log today\'s completed habits, review spending, and prepare for tomorrow.',
      enabled: true,
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    };
    const updated = { ...localSettings, schedules: [...localSettings.schedules, newSchedule] };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleSendTestNotification = () => {
    if (localSettings.soundEnabled) {
      playNotificationChime();
    }
    sendPushNotification(
      'HabitPulse Alert Active',
      { body: 'Test notification triggered successfully. Stay locked into your daily disciplines!' }
    );
    onTriggerTestToast('HabitPulse Alert Active', 'Push notification verified successfully!');
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Daily Push Notifications & Reminders
              </h3>
              <p className="text-xs text-slate-500">
                Customize daily reminder schedules to stay on track
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Permission Status Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full ${
                browserPermission === 'granted' 
                  ? 'bg-emerald-500 ring-4 ring-emerald-100' 
                  : browserPermission === 'denied'
                  ? 'bg-rose-500 ring-4 ring-rose-100'
                  : 'bg-amber-400 ring-4 ring-amber-100'
              }`} />
              <div>
                <span className="text-xs font-semibold text-slate-900 block">
                  Browser Permission: {browserPermission.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-500">
                  {browserPermission === 'granted' 
                    ? 'Push notifications are active and enabled' 
                    : browserPermission === 'denied'
                    ? 'Blocked by browser. Enable in site settings.'
                    : 'Permission needed for background alerts'}
                </span>
              </div>
            </div>

            {browserPermission !== 'granted' && (
              <button
                type="button"
                id="request-notification-permission-btn"
                onClick={handleRequestPermission}
                disabled={isRequestingPermission}
                className="px-3 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer shadow-xs"
              >
                {isRequestingPermission ? 'Prompting...' : 'Allow Alerts'}
              </button>
            )}
          </div>

          {/* Master Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0F766E]" />
                <span className="text-xs font-semibold text-slate-800">Daily Alerts</span>
              </div>
              <button
                type="button"
                id="toggle-master-notifications"
                onClick={handleToggleMaster}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                  localSettings.enabled ? 'bg-[#0F766E]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  localSettings.enabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {localSettings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-semibold text-slate-800">Chime Sound</span>
              </div>
              <button
                type="button"
                id="toggle-sound-notifications"
                onClick={handleToggleSound}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                  localSettings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  localSettings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Scheduled Times List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Scheduled Daily Reminders ({localSettings.schedules.length})
              </span>
              <button
                type="button"
                id="add-reminder-schedule-btn"
                onClick={handleAddSchedule}
                className="text-xs font-semibold text-[#0F766E] hover:text-[#0D655E] inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time</span>
              </button>
            </div>

            <div className="space-y-3">
              {localSettings.schedules.map((schedule) => (
                <div 
                  key={schedule.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    schedule.enabled 
                      ? 'bg-slate-50 border-slate-200/80' 
                      : 'bg-slate-50/40 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Time Input & Label */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex items-center">
                        <input
                          type="time"
                          value={schedule.time}
                          onChange={(e) => handleTimeChange(schedule.id, e.target.value)}
                          className="bg-white border border-slate-300 text-slate-900 font-mono text-sm font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-900 block truncate">
                          {schedule.label}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate">
                          {schedule.message}
                        </p>
                      </div>
                    </div>

                    {/* Enable Toggle & Delete */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSchedule(schedule.id)}
                        className={`w-8 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                          schedule.enabled ? 'bg-[#0F766E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                          schedule.enabled ? 'translate-x-3' : 'translate-x-0'
                        }`} />
                      </button>

                      {localSettings.schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Days of Week Selector */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Days:</span>
                    <div className="flex items-center gap-1">
                      {ALL_DAYS.map((d, index) => {
                        const isDaySelected = schedule.days.includes(d.id);
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleToggleDay(schedule.id, d.id)}
                            className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              isDaySelected
                                ? 'bg-[#0F766E] text-white shadow-xs'
                                : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Notification Trigger */}
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#0F766E] block">
                Test Reminder Chime & Banner
              </span>
              <span className="text-[11px] text-slate-600">
                Trigger a live notification immediately to verify audio and visual alerts
              </span>
            </div>
            <button
              type="button"
              id="send-test-notification-btn"
              onClick={handleSendTestNotification}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                testSent 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#0F766E] hover:bg-[#0D655E] text-white shadow-xs'
              }`}
            >
              {testSent ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Alert</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-98"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
