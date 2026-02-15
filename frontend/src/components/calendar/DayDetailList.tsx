import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CATEGORY_EMOJI } from '../../constants/colors';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
import type { ScheduleResponse, TransactionResponse } from '../../types/api';

interface DayDetailListProps {
  selectedDate: Date;
  schedules: ScheduleResponse[];
  transactions: TransactionResponse[];
  onAddClick: () => void;
}

export default function DayDetailList({
  selectedDate,
  schedules,
  transactions,
  onAddClick,
}: DayDetailListProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const daySchedules = schedules.filter((s) => {
    const start = s.start_date;
    const end = s.end_date || s.start_date;
    return dateStr >= start && dateStr <= end;
  });
  const dayTransactions = transactions.filter((t) => t.date === dateStr);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {format(selectedDate, 'M월 d일 EEEE', { locale: ko })}
        </Text>
        <TouchableOpacity onPress={onAddClick} style={styles.addButton}>
          <Icon name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Schedules Section */}
      {daySchedules.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar-outline" size={16} color={COLORS.gray500} />
            <Text style={styles.sectionTitle}>일정</Text>
          </View>
          {daySchedules.map((schedule) => (
            <TouchableOpacity key={schedule.id} style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <Text style={styles.emoji}>
                  {CATEGORY_EMOJI[schedule.category] || '📅'}
                </Text>
                <View>
                  <Text style={styles.itemTitle}>{schedule.title}</Text>
                  <Text style={styles.itemSubtitle}>
                    {schedule.is_all_day
                      ? '종일'
                      : `${schedule.start_time || ''} ~ ${schedule.end_time || ''}`}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.badge,
                  schedule.asset_type === 'JOINT'
                    ? styles.badgeJoint
                    : styles.badgePersonal,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    schedule.asset_type === 'JOINT'
                      ? styles.badgeTextJoint
                      : styles.badgeTextPersonal,
                  ]}
                >
                  {schedule.asset_type === 'JOINT' ? 'Joint' : 'Personal'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Transactions Section */}
      {dayTransactions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="wallet-outline" size={16} color={COLORS.gray500} />
            <Text style={styles.sectionTitle}>가계부</Text>
          </View>
          {dayTransactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <Text style={styles.emoji}>
                  {CATEGORY_EMOJI[transaction.category_name] || '📦'}
                </Text>
                <View>
                  <Text style={styles.itemTitle}>{transaction.category_name}</Text>
                  <View
                    style={[
                      styles.badge,
                      transaction.asset_type === 'JOINT'
                        ? styles.badgeJoint
                        : styles.badgePersonal,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        transaction.asset_type === 'JOINT'
                          ? styles.badgeTextJoint
                          : styles.badgeTextPersonal,
                      ]}
                    >
                      {transaction.asset_type === 'JOINT' ? 'Joint' : 'Personal'}
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  styles.amount,
                  transaction.transaction_type === 'EXPENSE'
                    ? styles.amountExpense
                    : styles.amountIncome,
                ]}
              >
                {transaction.transaction_type === 'EXPENSE' ? '-' : '+'}
                {Math.abs(transaction.amount).toLocaleString()}원
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {daySchedules.length === 0 && dayTransactions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>이 날짜에 등록된 일정이 없습니다</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    marginBottom: 8,
    ...SHADOWS.card,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeJoint: {
    backgroundColor: COLORS.jointBadgeBg,
  },
  badgePersonal: {
    backgroundColor: COLORS.personalBadgeBg,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeTextJoint: {
    color: COLORS.jointBadgeText,
  },
  badgeTextPersonal: {
    color: COLORS.personalBadgeText,
  },
  amount: {
    fontSize: 15,
    fontWeight: '500',
  },
  amountExpense: {
    color: COLORS.expense,
  },
  amountIncome: {
    color: COLORS.income,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray400,
  },
});
