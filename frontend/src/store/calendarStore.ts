import { create } from 'zustand';
import { format, startOfMonth, endOfMonth } from 'date-fns';

type FilterType = 'all' | 'me' | 'joint';

interface CalendarState {
  selectedDate: Date;
  currentMonth: Date;
  focusedDate: Date | null;
  selectedGroupId: number | null;
  filter: FilterType;
  setSelectedDate: (date: Date) => void;
  setCurrentMonth: (month: Date) => void;
  setFocusedDate: (date: Date | null) => void;
  setSelectedGroupId: (groupId: number | null) => void;
  setFilter: (filter: FilterType) => void;
  getMonthRange: () => { startDate: string; endDate: string };
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  selectedDate: new Date(),
  currentMonth: new Date(),
  focusedDate: null,
  selectedGroupId: null,
  filter: 'all',
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentMonth: (month) => set({ currentMonth: month }),
  setFocusedDate: (date) => set({ focusedDate: date }),
  setSelectedGroupId: (groupId) => set({ selectedGroupId: groupId }),
  setFilter: (filter) => set({ filter }),
  getMonthRange: () => {
    const { currentMonth } = get();
    return {
      startDate: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
    };
  },
}));
