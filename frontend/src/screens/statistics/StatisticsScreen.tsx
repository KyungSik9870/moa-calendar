import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useCalendarStore } from '../../store/calendarStore';
import { statisticsApi } from '../../api/statistics';
import { transactionsApi } from '../../api/transactions';
import { groupsApi } from '../../api/groups';
import { getCycleRange, nextMonth, prevMonth } from '../../utils/date';
import { CHART_COLORS, CATEGORY_EMOJI } from '../../constants/colors';
import type { GroupResponse } from '../../types/api';

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const { selectedGroupId } = useCalendarStore();
  const [cycleDate, setCycleDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'personal' | 'joint'>('all');

  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: () => groupsApi.getAll() });
  const currentGroup = groups.find((g: GroupResponse) => g.id === selectedGroupId);
  const budgetStartDay = currentGroup?.budget_start_day || 1;
  const isShared = currentGroup?.type === 'SHARED';

  const cycle = useMemo(() => getCycleRange(cycleDate, budgetStartDay), [cycleDate, budgetStartDay]);

  const { data: summary } = useQuery({
    queryKey: ['transactionSummary', selectedGroupId, cycle.startDate, cycle.endDate],
    queryFn: () => transactionsApi.getSummary(selectedGroupId!, cycle.startDate, cycle.endDate),
    enabled: !!selectedGroupId,
  });

  const { data: categoryBreakdown = [] } = useQuery({
    queryKey: ['categoryBreakdown', selectedGroupId, cycle.startDate, cycle.endDate],
    queryFn: () => statisticsApi.getCategoryBreakdown(selectedGroupId!, cycle.startDate, cycle.endDate),
    enabled: !!selectedGroupId,
  });

  const { data: dailyTrend = [] } = useQuery({
    queryKey: ['dailyTrend', selectedGroupId, cycle.startDate, cycle.endDate],
    queryFn: () => statisticsApi.getDailyTrend(selectedGroupId!, cycle.startDate, cycle.endDate),
    enabled: !!selectedGroupId,
  });

  const { data: memberComparison = [] } = useQuery({
    queryKey: ['memberComparison', selectedGroupId, cycle.startDate, cycle.endDate],
    queryFn: () => statisticsApi.getMemberComparison(selectedGroupId!, cycle.startDate, cycle.endDate),
    enabled: !!selectedGroupId && isShared,
  });

  const totalExpense = summary?.total_expense || 0;
  const totalIncome = summary?.total_income || 0;
  const balance = summary?.balance || 0;
  const maxMemberExpense = Math.max(...memberComparison.map(m => m.total_expense), 1);
  const maxDailyAmount = Math.max(...dailyTrend.map(d => d.amount), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>통계</Text>
        <TouchableOpacity style={styles.budgetButton}>
          <Text style={styles.budgetButtonText}>예산설정</Text>
        </TouchableOpacity>
      </View>

      {/* Cycle Swiper */}
      <View style={styles.cycleBar}>
        <TouchableOpacity onPress={() => setCycleDate(prevMonth(cycleDate))} style={styles.navBtn}>
          <Icon name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.cycleText}>{cycle.label}</Text>
        <TouchableOpacity onPress={() => setCycleDate(nextMonth(cycleDate))} style={styles.navBtn}>
          <Icon name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <View style={styles.filterBar}>
        {(['all', 'personal', 'joint'] as const).map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? '전체' : f === 'personal' ? 'Personal' : 'Joint'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.cards}>
          {/* Budget Status */}
          <View style={styles.budgetCard}>
            <Text style={styles.cardLabel}>총 예산</Text>
            <Text style={styles.budgetAmount}>2,000,000원</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min((totalExpense / 2000000) * 100, 100)}%` }]} />
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetUsed}>사용 {totalExpense.toLocaleString()}원</Text>
              <Text style={styles.budgetRemaining}>남은 {Math.max(2000000 - totalExpense, 0).toLocaleString()}원</Text>
            </View>
          </View>

          {/* Income/Expense Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>수입/지출 요약</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>수입</Text><Text style={styles.incomeText}>+{totalIncome.toLocaleString()}원</Text></View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>지출</Text><Text style={styles.expenseText}>-{totalExpense.toLocaleString()}원</Text></View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>잔액</Text><Text style={styles.balanceText}>{balance >= 0 ? '+' : ''}{balance.toLocaleString()}원</Text></View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>카테고리별 지출</Text>
            <View style={styles.donutPlaceholder}>
              <Text style={styles.donutLabel}>총 지출</Text>
              <Text style={styles.donutValue}>{totalExpense >= 1000000 ? `${(totalExpense/1000000).toFixed(1)}M` : totalExpense.toLocaleString()}</Text>
            </View>
            {categoryBreakdown.map((cat, i) => (
              <View key={cat.category_name} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                  <Text style={styles.categoryName}>{CATEGORY_EMOJI[cat.category_name] || '📦'} {cat.category_name}</Text>
                </View>
                <Text style={styles.categoryValue}>{cat.percentage.toFixed(0)}% ({cat.amount.toLocaleString()}원)</Text>
              </View>
            ))}
          </View>

          {/* Daily Trend */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>일별 지출 추이</Text>
            <View style={styles.chartContainer}>
              {dailyTrend.map((day, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View style={[styles.bar, { height: `${(day.amount / maxDailyAmount) * 100}%` }]} />
                </View>
              ))}
            </View>
          </View>

          {/* Member Comparison */}
          {isShared && memberComparison.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>멤버별 비교</Text>
              {memberComparison.map((member) => (
                <View key={member.user_id} style={styles.memberRow}>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberDot, { color: member.color_code }]}>●</Text>
                    <Text style={styles.memberName}>{member.nickname}</Text>
                    <Text style={styles.memberAmount}>{member.total_expense.toLocaleString()}원</Text>
                  </View>
                  <View style={styles.memberBar}>
                    <View style={[styles.memberBarFill, { width: `${(member.total_expense / maxMemberExpense) * 100}%`, backgroundColor: member.color_code }]} />
                  </View>
                </View>
              ))}
              <Text style={styles.memberNote}>※ Joint 지출 합계 기준</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 20, fontWeight: '500' },
  budgetButton: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#2563EB', borderRadius: 8 },
  budgetButtonText: { fontSize: 14, color: '#2563EB' },
  cycleBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 16, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  navBtn: { padding: 8 },
  cycleText: { fontSize: 15, fontWeight: '500' },
  filterBar: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterChipActive: { backgroundColor: '#3B82F6' },
  filterText: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  filterTextActive: { color: '#FFFFFF' },
  scrollContent: { flex: 1 },
  cards: { padding: 24, gap: 24 },
  budgetCard: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 24 },
  cardLabel: { fontSize: 14, color: '#4B5563', marginBottom: 8 },
  budgetAmount: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  progressBar: { height: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 6 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetUsed: { fontSize: 14, color: '#4B5563' },
  budgetRemaining: { fontSize: 14, fontWeight: '500', color: '#2563EB' },
  summaryCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  summaryLabel: { fontSize: 14, color: '#4B5563' },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6' },
  incomeText: { fontSize: 20, fontWeight: '700', color: '#16A34A' },
  expenseText: { fontSize: 20, fontWeight: '700', color: '#DC2626' },
  balanceText: { fontSize: 20, fontWeight: '700', color: '#2563EB' },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 24 },
  donutPlaceholder: { alignItems: 'center', marginVertical: 24 },
  donutLabel: { fontSize: 12, color: '#6B7280' },
  donutValue: { fontSize: 18, fontWeight: '700' },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  categoryName: { fontSize: 14 },
  categoryValue: { fontSize: 14, fontWeight: '500' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 4, marginTop: 16 },
  barWrapper: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { backgroundColor: '#7C3AED', borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 4 },
  memberRow: { marginTop: 12 },
  memberInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  memberDot: { fontSize: 12 },
  memberName: { fontSize: 14, fontWeight: '500', flex: 1, marginLeft: 4 },
  memberAmount: { fontSize: 14, fontWeight: '500' },
  memberBar: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  memberBarFill: { height: '100%', borderRadius: 4 },
  memberNote: { fontSize: 12, color: '#6B7280', marginTop: 12 },
});
