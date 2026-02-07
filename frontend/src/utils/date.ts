import { format, startOfMonth, endOfMonth, getDay, getDaysInMonth, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (date: Date, fmt: string = 'yyyy-MM-dd') =>
  format(date, fmt, { locale: ko });

export const formatMonthTitle = (date: Date) =>
  format(date, 'yyyy년 M월', { locale: ko });

export const formatDayHeader = (date: Date) =>
  format(date, 'M월 d일 EEEE', { locale: ko });

export const getMonthDays = (date: Date) => {
  const start = startOfMonth(date);
  const firstDayOfWeek = getDay(start);
  const totalDays = getDaysInMonth(date);
  return { firstDayOfWeek, totalDays, start };
};

export const getMonthRange = (date: Date) => ({
  startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
  endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
});

export const getCycleRange = (date: Date, startDay: number) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const cycleStart = new Date(year, month - 1, startDay);
  const cycleEnd = new Date(year, month, startDay - 1);
  return {
    startDate: format(cycleStart, 'yyyy-MM-dd'),
    endDate: format(cycleEnd, 'yyyy-MM-dd'),
    label: `${format(cycleStart, 'M/d')} ~ ${format(cycleEnd, 'M/d')}`,
  };
};

export const nextMonth = (date: Date) => addMonths(date, 1);
export const prevMonth = (date: Date) => subMonths(date, 1);
export const isSameDayCheck = (d1: Date, d2: Date) => isSameDay(d1, d2);
export const parseDate = (dateStr: string) => parseISO(dateStr);

export const getDayOfWeekName = (date: Date) =>
  format(date, 'EEEE', { locale: ko });
