import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  BellRing, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CalendarDays,
  Tag,
  X,
  Volume2,
  CalendarCheck2
} from 'lucide-react';
import { PlannedEvent, EventReminder } from '../types';
import { formatDisplayDate, getTodayDateStr } from '../lib/dateUtils';
import { sendPushNotification, playNotificationChime, requestNotificationPermission, getNotificationPermission } from '../lib/notifications';

interface EventPlannerTabProps {
  events: PlannedEvent[];
  onAddEvent: (event: Omit<PlannedEvent, 'id' | 'createdAt'>) => void;
  onDeleteEvent: (id: string) => void;
  onToggleEventStatus: (id: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CATEGORY_COLORS = {
  work: 'bg-blue-50 text-blue-700 border-blue-200',
  personal: 'bg-purple-50 text-purple-700 border-purple-200',
  health: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  celebration: 'bg-amber-50 text-amber-700 border-amber-200',
  reminder: 'bg-teal-50 text-[#0F766E] border-teal-200',
};

export const EventPlannerTab: React.FC<EventPlannerTabProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
  onToggleEventStatus,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(today.getMonth());
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(today.getDate());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(getNotificationPermission());

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventTime, setEventTime] = useState('10:00');
  const [category, setCategory] = useState<PlannedEvent['category']>('work');
  const [enableNotification, setEnableNotification] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState<number>(15); // 15 mins before

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  const firstDayOfWeekIndex = useMemo(() => {
    return new Date(currentYear, currentMonthIndex, 1).getDay();
  }, [currentYear, currentMonthIndex]);

  // Selected date ISO string (YYYY-MM-DD)
  const selectedDateISO = useMemo(() => {
    const m = String(currentMonthIndex + 1).padStart(2, '0');
    const d = String(selectedDayNumber).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  }, [currentYear, currentMonthIndex, selectedDayNumber]);

  // Selected date Day Name
  const selectedDayName = useMemo(() => {
    const d = new Date(currentYear, currentMonthIndex, selectedDayNumber);
    return DAY_NAMES[d.getDay()];
  }, [currentYear, currentMonthIndex, selectedDayNumber]);

  // Events filtered for the selected day
  const eventsForSelectedDay = useMemo(() => {
    return events.filter(e => e.date === selectedDateISO);
  }, [events, selectedDateISO]);

  // Month navigation
  const prevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonthIndex(now.getMonth());
    setSelectedDayNumber(now.getDate());
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      sendPushNotification('HabitPulse Event Reminders Activated! 🔔', {
        body: 'You will receive notifications for your scheduled events and meetings.',
      });
      playNotificationChime();
    }
  };

  const handleTestNotification = (event: PlannedEvent) => {
    playNotificationChime();
    sendPushNotification(`Reminder: ${event.title}`, {
      body: `Event scheduled for ${event.time || 'today'} (${event.dayOfWeek}, ${MONTH_NAMES[currentMonthIndex]} ${selectedDayNumber})`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const reminders: EventReminder[] = [];
    if (enableNotification) {
      reminders.push({
        id: `rem-${Date.now()}`,
        minutesBefore: reminderMinutes,
        label: `${reminderMinutes} minutes before`,
        sent: false,
      });
    }

    onAddEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      date: selectedDateISO,
      dayOfWeek: selectedDayName,
      month: `${MONTH_NAMES[currentMonthIndex]} ${currentYear}`,
      time: eventTime,
      category,
      enableNotification,
      reminders,
      status: 'upcoming',
    });

    // If notifications are active and permission is granted, notify user of scheduling
    if (enableNotification && permissionState === 'granted') {
      sendPushNotification(`Event Planned: ${title}`, {
        body: `Scheduled for ${selectedDayName}, ${MONTH_NAMES[currentMonthIndex]} ${selectedDayNumber} at ${eventTime}. Reminder active!`,
      });
      playNotificationChime();
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setEventTime('10:00');
    setCategory('work');
    setReminderMinutes(15);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 text-[#0F766E] flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Event &amp; Reminder Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Pick specific months, dates, and days to plan milestones and schedule timely push reminders.
          </p>
        </div>

        {/* Quick Actions & Permission Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {permissionState !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Notifications</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Reminders Live</span>
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ml-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Plan Event</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Calendar Selector (Left) & Day Agenda (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month & Date Calendar Picker (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* Month & Year Navigation Row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <select
                    value={currentMonthIndex}
                    onChange={(e) => setCurrentMonthIndex(Number(e.target.value))}
                    className="font-bold text-sm sm:text-base text-slate-900 bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0F766E] rounded-md px-1"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx}>{name}</option>
                    ))}
                  </select>

                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="font-bold text-sm sm:text-base text-slate-600 bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0F766E] rounded-md px-1"
                  >
                    {[2025, 2026, 2027, 2028].map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={jumpToToday}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-[11px] font-bold text-slate-400 py-1 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty padding cells for first day of week */}
              {Array.from({ length: firstDayOfWeekIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl opacity-0" />
              ))}

              {/* Month Day Numbers */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateISO = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = dayNum === selectedDayNumber;
                const isTodayDate = dateISO === getTodayDateStr();
                const dayEvents = events.filter(e => e.date === dateISO);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDayNumber(dayNum)}
                    className={`h-11 sm:h-13 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all cursor-pointer border relative group ${
                      isSelected
                        ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm font-bold scale-[1.02]'
                        : isTodayDate
                        ? 'bg-teal-50 border-teal-300 text-[#0F766E] font-bold'
                        : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{dayNum}</span>

                    {/* Indicator dots for events */}
                    <div className="flex items-center gap-0.5 min-h-[6px]">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#0F766E]'
                          }`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className={`text-[8px] font-bold ${isSelected ? 'text-white' : 'text-[#0F766E]'}`}>
                          +
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                Selected: {MONTH_NAMES[currentMonthIndex]} {selectedDayNumber}, {currentYear} ({selectedDayName})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                Has Planned Event
              </span>
            </div>
          </div>
        </div>

        {/* Selected Date Agenda & Scheduled Reminders (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Agenda For
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedDayName}, {MONTH_NAMES[currentMonthIndex]} {selectedDayNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-[#0F766E] text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Event</span>
              </button>
            </div>

            {/* Events List for Day */}
            <div className="space-y-3">
              {eventsForSelectedDay.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600">No events planned for this date</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click "Add Event" to plan a meeting, reminder, or milestone.
                  </p>
                </div>
              ) : (
                eventsForSelectedDay.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                      event.status === 'completed'
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200/90 shadow-xs hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => onToggleEventStatus(event.id)}
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-colors ${
                            event.status === 'completed'
                              ? 'bg-[#0F766E] text-white'
                              : 'border-2 border-slate-300 hover:border-[#0F766E]'
                          }`}
                        >
                          {event.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                        <div>
                          <h4 className={`text-xs sm:text-sm font-bold ${
                            event.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}>
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{event.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {event.enableNotification && (
                          <button
                            type="button"
                            onClick={() => handleTestNotification(event)}
                            className="p-1 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Test notification trigger"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                      {event.time && (
                        <span className="flex items-center gap-1 font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {event.time}
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-md font-semibold capitalize border ${CATEGORY_COLORS[event.category]}`}>
                        {event.category}
                      </span>

                      {event.enableNotification && (
                        <span className="flex items-center gap-1 text-[#0F766E] font-medium">
                          <Bell className="w-3 h-3" />
                          Reminders ON
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Plan Event: {selectedDayName}, {MONTH_NAMES[currentMonthIndex]} {selectedDayNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quarterly Review, Doctor Appointment, Flight Departure"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Location, video link, agenda or preparation notes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-slate-50/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] bg-white capitalize cursor-pointer"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="celebration">Celebration</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>

              {/* Push Notification Reminder Settings */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#0F766E]" />
                    <span className="text-xs font-bold text-slate-900">Push Notification Reminder</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableNotification}
                      onChange={(e) => setEnableNotification(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F766E]"></div>
                  </label>
                </div>

                {enableNotification && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 text-xs">
                    <span className="text-slate-600">Notify me:</span>
                    <select
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    >
                      <option value={0}>At time of event</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                      <option value={1440}>1 day before</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Schedule Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
