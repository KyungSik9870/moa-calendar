import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useCalendarStore } from '../../store/calendarStore';
import { transactionsApi } from '../../api/transactions';
import { CATEGORY_EMOJI } from '../../constants/colors';
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from '../../constants/theme';
import { getMonthRange } from '../../utils/date';
import type { RootScreenProps } from '../../types/navigation';

export default function AssetDetailScreen({ route, navigation }: RootScreenProps<'AssetDetail'>) {
  const insets = useSafeAreaInsets();
  const { assetSourceId, assetName } = route.params;
  const { selectedGroupId, currentMonth } = useCalendarStore();
  const { startDate, endDate } = getMonthRange(currentMonth);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', selectedGroupId, startDate, endDate],
    queryFn: () => transactionsApi.getAll(selectedGroupId!, startDate, endDate),
    enabled: !!selectedGroupId,
  });

  const assetTransactions = transactions.filter(t => t.asset_source_id === assetSourceId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={COLORS.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{assetName}</Text>
      </View>

      <LinearGradient
        colors={[...GRADIENTS.primarySubtle.colors]}
        start={GRADIENTS.primarySubtle.start}
        end={GRADIENTS.primarySubtle.end}
        style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>현재 잔액</Text>
        <Text style={styles.balanceAmount}>관리 중</Text>
      </LinearGradient>

      <ScrollView style={styles.list}>
        {assetTransactions.map((t) => (
          <TouchableOpacity key={t.id} style={styles.txCard}>
            <View style={styles.txLeft}>
              <Text style={styles.emoji}>{CATEGORY_EMOJI[t.category_name] || '📦'}</Text>
              <Text style={styles.txTitle}>{t.category_name}</Text>
            </View>
            <Text style={[styles.txAmount, t.transaction_type === 'EXPENSE' ? styles.expense : styles.income]}>
              {t.transaction_type === 'EXPENSE' ? '-' : '+'}{Math.abs(t.amount).toLocaleString()}원
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray900 },
  balanceCard: { paddingHorizontal: 24, paddingVertical: 28 },
  balanceLabel: { fontSize: 14, color: COLORS.gray600, marginBottom: 8 },
  balanceAmount: { fontSize: 30, fontWeight: '700', color: COLORS.gray900 },
  list: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  txCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: RADIUS.xl, marginBottom: 8, ...SHADOWS.card },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 24 },
  txTitle: { fontSize: 15, fontWeight: '500', color: COLORS.gray900 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  expense: { color: COLORS.expense },
  income: { color: COLORS.income },
});
