import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { format, isSameDay, startOfMonth, getDay, getDaysInMonth, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { nextMonth, prevMonth } from '../../utils/date';
import type { ScheduleResponse, TransactionResponse } from '../../types/api';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  focusedDate: Date | null;
  schedules: ScheduleResponse[];
  transactions: TransactionResponse[];
  onDateClick: (date: Date) => void;
  onMonthChange: (month: Date) => void;
}

export default function CalendarGrid({
  currentMonth,
  selectedDate,
  focusedDate,
  schedules,
  transactions,
  onDateClick,
  onMonthChange,
}: CalendarGridProps) {
  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const firstDayOfWeek = getDay(monthStart);
  const totalDays = getDaysInMonth(currentMonth);

  // Build schedule map by date
  const scheduleMap = new Map<string, { title: string; color: string }[]>();
  schedules.forEach((s) => {
    const key = s.start_date;
    if (!scheduleMap.has(key)) scheduleMap.set(key, []);
    scheduleMap.get(key)!.push({ title: s.title, color: s.user_color || '#5B9FFF' });
  });

  // Build expense map by date
  const expenseMap = new Map<string, number>();
  transactions.forEach((t) => {
    if (t.transaction_type === 'EXPENSE') {
      const key = t.date;
      expenseMap.set(key, (expenseMap.get(key) || 0) + t.amount);
    }
  });

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let day = 0; day < totalDays; day++) {
    calendarDays.push(addDays(monthStart, day));
  }

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          onPress={() => onMonthChange(prevMonth(currentMonth))}
          style={styles.navButton}
        >
          <Icon name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </Text>
        <TouchableOpacity
          onPress={() => onMonthChange(nextMonth(currentMonth))}
          style={styles.navButton}
        >
          <Icon name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Days of Week Header */}
      <View style={styles.weekHeader}>
        {DAYS_OF_WEEK.map((day, index) => (
          <View key={index} style={styles.weekCell}>
            <Text
              style={[
                styles.weekText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {calendarDays.map((date, index) => {
          if (!date) return <View key={`empty-${index}`} style={styles.dayCell} />;

          const dateStr = format(date, 'yyyy-MM-dd');
          const isToday = isSameDay(date, today);
          const isFocused = focusedDate ? isSameDay(date, focusedDate) : false;
          const dayOfWeek = index % 7;
          const events = scheduleMap.get(dateStr) || [];
          const expense = expenseMap.get(dateStr);

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                isToday && styles.todayCell,
                isFocused && styles.focusedCell,
              ]}
              onPress={() => onDateClick(date)}
            >
              <Text
                style={[
                  styles.dayNumber,
                  dayOfWeek === 0 && styles.sundayText,
                  dayOfWeek === 6 && styles.saturdayText,
                ]}
              >
                {date.getDate()}
              </Text>
              <View style={styles.eventBars}>
                {events.slice(0, 3).map((event, idx) => (
                  <View
                    key={idx}
                    style={[styles.eventBar, { backgroundColor: event.color }]}
                  />
                ))}
                {events.length > 3 && (
                  <Text style={styles.moreEvents}>+{events.length - 3}</Text>
                )}
              </View>
              {expense !== undefined && (
                <Text style={styles.expenseText}>
                  {(-expense).toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.todayLegend]} />
          <Text style={styles.legendText}>오늘</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.focusedLegend]} />
          <Text style={styles.legendText}>선택됨</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sundayText: {
    color: '#EF4444',
  },
  saturdayText: {
    color: '#3B82F6',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%' as unknown as number,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#F472B6',
  },
  focusedCell: {
    borderWidth: 2,
    borderColor: '#FB923C',
    backgroundColor: '#FFF7ED',
  },
  dayNumber: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 2,
  },
  eventBars: {
    width: '100%' as unknown as number,
    gap: 2,
  },
  eventBar: {
    height: 3,
    borderRadius: 2,
    width: '100%' as unknown as number,
  },
  moreEvents: {
    fontSize: 7,
    color: '#9CA3AF',
  },
  expenseText: {
    fontSize: 8,
    color: '#DC2626',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  todayLegend: {
    borderColor: '#F472B6',
    backgroundColor: 'transparent',
  },
  focusedLegend: {
    borderColor: '#FB923C',
    backgroundColor: '#FFF7ED',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
