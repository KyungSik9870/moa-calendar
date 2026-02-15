import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useCalendarStore } from '../../store/calendarStore';
import { statisticsApi } from '../../api/statistics';
import { transactionsApi } from '../../api/transactions';
import { groupsApi } from '../../api/groups';
import { getCycleRange, nextMonth, prevMonth } from '../../utils/date';
import { CHART_COLORS, CATEGORY_EMOJI } from '../../constants/colors';
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from '../../constants/theme';
import BudgetModal from '../../components/common/BudgetModal';
import type { GroupResponse } from '../../types/api';

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const { selectedGroupId } = useCalendarStore();
  const [cycleDate, setCycleDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'personal' | 'joint'>('all');
  const [showBudgetModal, setShowBudgetModal] = useState(false);

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

  const { data: categoryBreakdownData } = useQuery({
    queryKey: ['categoryBreakdown', selectedGroupId, cycle.startDate, cycle.endDate],
    queryFn: () => statisticsApi.getCategoryBreakdown(selectedGroupId!, cycle.startDate, cycle.endDate),
    enabled: !!selectedGroupId,
  });

  const { data: dailyTrendData } = useQuery({
    queryKey: ['dailyTrend', selectedGroupId, cycle.startDate, cycle.endDate],
    queryFn: () => statisticsApi.getDailyTrend(selectedGroupId!, cycle.startDate, cycle.endDate),
    enabled: !!selectedGroupId,
  });

  const { data: memberComparisonData } = useQuery({
    queryKey: ['memberComparison', selectedGroupId, cycle.startDate, cycle.endDate],
    queryFn: () => statisticsApi.getMemberComparison(selectedGroupId!, cycle.startDate, cycle.endDate),
    enabled: !!selectedGroupId && isShared,
  });

  const totalExpense = summary?.total_expense || 0;
  const totalIncome = summary?.total_income || 0;
  const balance = summary?.balance || 0;

  const categoryItems = categoryBreakdownData?.items?.filter(i => i.transaction_type === 'EXPENSE') || [];
  const categoryTotal = categoryBreakdownData?.total_expense || totalExpense || 1;
  const dailyItems = dailyTrendData?.items?.filter(i => i.transaction_type === 'EXPENSE') || [];
  const memberItems = memberComparisonData?.items?.filter(i => i.transaction_type === 'EXPENSE') || [];

  const maxMemberExpense = Math.max(...memberItems.map(m => m.total), 1);
  const maxDailyAmount = Math.max(...dailyItems.map(d => d.total), 1);

  const donutBorderColors = useMemo(() => {
    const defaultColor = COLORS.gray200;
    if (categoryItems.length === 0) {
      return {
        borderTopColor: defaultColor,
        borderRightColor: defaultColor,
        borderBottomColor: defaultColor,
        borderLeftColor: defaultColor,
      };
    }
    const sides: Array<'borderTopColor' | 'borderRightColor' | 'borderBottomColor' | 'borderLeftColor'> = [
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
    ];
    const colors: Record<string, string> = {};
    sides.forEach((side, index) => {
      if (index < categoryItems.length) {
        colors[side] = CHART_COLORS[index % CHART_COLORS.length];
      } else {
        const lastIndex = Math.min(categoryItems.length - 1, CHART_COLORS.length - 1);
        colors[side] = CHART_COLORS[lastIndex % CHART_COLORS.length];
      }
    });
    return colors;
  }, [categoryItems]);

  const dailyDateLabels = useMemo(() => {
    if (dailyItems.length === 0) return [];
    const firstDate = dailyItems[0]?.date ?? '';
    const lastDate = dailyItems[dailyItems.length - 1]?.date ?? '';
    const midIndex = Math.floor(dailyItems.length / 2);
    const midDate = dailyItems[midIndex]?.date ?? '';
    const formatDate = (d: string) => {
      if (!d) return '';
      const parts = d.split('-');
      if (parts.length >= 3) {
        return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
      }
      return d;
    };
    return [
      { index: 0, label: formatDate(firstDate) },
      { index: midIndex, label: formatDate(midDate) },
      { index: dailyItems.length - 1, label: formatDate(lastDate) },
    ];
  }, [dailyItems]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>통계</Text>
        <TouchableOpacity style={styles.budgetButton} onPress={() => setShowBudgetModal(true)}>
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
          <LinearGradient
            colors={[...GRADIENTS.primarySubtle.colors]}
            start={GRADIENTS.primarySubtle.start}
            end={GRADIENTS.primarySubtle.end}
            style={styles.budgetCard}>
            <Text style={styles.cardLabel}>총 예산</Text>
            <Text style={styles.budgetAmount}>2,000,000원</Text>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[...GRADIENTS.primary.colors]}
                start={GRADIENTS.primary.start}
                end={GRADIENTS.primary.end}
                style={[styles.progressFill, { width: `${Math.min((totalExpense / 2000000) * 100, 100)}%` }]}
              />
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetUsed}>사용 {totalExpense.toLocaleString()}원</Text>
              <Text style={styles.budgetRemaining}>남은 {Math.max(2000000 - totalExpense, 0).toLocaleString()}원</Text>
            </View>
          </LinearGradient>

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
            <View style={styles.donutContainer}>
              <View style={[styles.donutRing, donutBorderColors]}>
                <View style={styles.donutInner}>
                  <Text style={styles.donutLabel}>총 지출</Text>
                  <Text style={styles.donutValue}>
                    {totalExpense >= 1000000 ? `${(totalExpense / 1000000).toFixed(1)}M` : totalExpense.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
            {categoryItems.map((cat, i) => {
              const pct = categoryTotal > 0 ? (cat.total / categoryTotal) * 100 : 0;
              return (
                <View key={cat.category_name} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                    <Text style={styles.categoryName}>{CATEGORY_EMOJI[cat.category_name] || '📦'} {cat.category_name}</Text>
                  </View>
                  <Text style={styles.categoryValue}>{pct.toFixed(0)}% ({cat.total.toLocaleString()}원)</Text>
                </View>
              );
            })}
          </View>

          {/* Daily Trend */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>일별 지출 추이</Text>
            <View style={styles.chartContainer}>
              {dailyItems.map((day, i) => (
                <View key={i} style={styles.barWrapper}>
                  <LinearGradient
                    colors={['#3B82F6', '#9333EA']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[styles.bar, { height: `${(day.total / maxDailyAmount) * 100}%` }]}
                  />
                </View>
              ))}
            </View>
            {dailyItems.length > 0 && (
              <View style={styles.dateLabelsRow}>
                {dailyDateLabels.map((item, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.dateLabel,
                      idx === 0 && styles.dateLabelLeft,
                      idx === dailyDateLabels.length - 1 && styles.dateLabelRight,
                      idx > 0 && idx < dailyDateLabels.length - 1 && styles.dateLabelCenter,
                    ]}
                  >
                    {item.label}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Member Comparison */}
          {isShared && memberItems.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>멤버별 비교</Text>
              {memberItems.map((member) => (
                <View key={member.user_id} style={styles.memberRow}>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberDot, { color: member.color_code }]}>●</Text>
                    <Text style={styles.memberName}>{member.nickname}</Text>
                    <Text style={styles.memberAmount}>{member.total.toLocaleString()}원</Text>
                  </View>
                  <View style={styles.memberBar}>
                    <View style={[styles.memberBarFill, { width: `${(member.total / maxMemberExpense) * 100}%`, backgroundColor: member.color_code }]} />
                  </View>
                </View>
              ))}
              <Text style={styles.memberNote}>※ Joint 지출 합계 기준</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BudgetModal
        visible={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSave={() => {}}
        initialAmount={2000000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray900 },
  budgetButton: { paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.xl },
  budgetButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  cycleBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 16, backgroundColor: COLORS.gray50, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  navBtn: { padding: 8 },
  cycleText: { fontSize: 16, fontWeight: '600', color: COLORS.gray900 },
  filterBar: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray200 },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 14, fontWeight: '600', color: COLORS.gray600 },
  filterTextActive: { color: COLORS.white },
  scrollContent: { flex: 1 },
  cards: { padding: 24, gap: 24 },
  budgetCard: { borderRadius: RADIUS.xl, padding: 24 },
  cardLabel: { fontSize: 14, color: COLORS.gray600, marginBottom: 8 },
  budgetAmount: { fontSize: 24, fontWeight: '700', color: COLORS.gray900, marginBottom: 16 },
  progressBar: { height: 14, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 7, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 7 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetUsed: { fontSize: 14, color: COLORS.gray600 },
  budgetRemaining: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  summaryCard: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: RADIUS.xl, padding: 24, ...SHADOWS.card },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  summaryLabel: { fontSize: 14, color: COLORS.gray600 },
  summaryDivider: { height: 1, backgroundColor: COLORS.gray100 },
  incomeText: { fontSize: 22, fontWeight: '700', color: COLORS.income },
  expenseText: { fontSize: 22, fontWeight: '700', color: COLORS.expense },
  balanceText: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  card: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: RADIUS.xl, padding: 24, ...SHADOWS.card },
  donutContainer: { alignItems: 'center', marginVertical: 24 },
  donutRing: {
    width: 200,
    height: 200,
    borderWidth: 28,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: { alignItems: 'center', justifyContent: 'center' },
  donutLabel: { fontSize: 12, color: COLORS.gray500 },
  donutValue: { fontSize: 20, fontWeight: '700', color: COLORS.gray900, marginTop: 2 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  categoryName: { fontSize: 14, color: COLORS.gray900 },
  categoryValue: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 4, marginTop: 16 },
  barWrapper: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 4 },
  dateLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dateLabel: { fontSize: 11, color: COLORS.gray500 },
  dateLabelLeft: { textAlign: 'left' },
  dateLabelCenter: { textAlign: 'center' },
  dateLabelRight: { textAlign: 'right' },
  memberRow: { marginTop: 12 },
  memberInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  memberDot: { fontSize: 12 },
  memberName: { fontSize: 14, fontWeight: '500', flex: 1, marginLeft: 4, color: COLORS.gray900 },
  memberAmount: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  memberBar: { height: 8, backgroundColor: COLORS.gray100, borderRadius: 4, overflow: 'hidden' },
  memberBarFill: { height: '100%', borderRadius: 4 },
  memberNote: { fontSize: 12, color: COLORS.gray500, marginTop: 12 },
});
