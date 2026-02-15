import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { CATEGORY_EMOJI } from '../../constants/colors';
import { COLORS, RADIUS } from '../../constants/theme';
import type { RootScreenProps } from '../../types/navigation';

type CategoryTab = 'EXPENSE' | 'INCOME' | 'SCHEDULE';

const TABS: { key: CategoryTab; label: string }[] = [
  { key: 'EXPENSE', label: '지출' },
  { key: 'INCOME', label: '수입' },
  { key: 'SCHEDULE', label: '일정' },
];

export default function CategoryManagementScreen({ route, navigation }: RootScreenProps<'CategoryManagement'>) {
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CategoryTab>('EXPENSE');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', groupId, activeTab],
    queryFn: () => categoriesApi.getAll(groupId, activeTab === 'SCHEDULE' ? undefined : activeTab),
  });

  const handleDelete = (categoryId: number, categoryName: string) => {
    Alert.alert('카테고리 삭제', `"${categoryName}" 카테고리를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await categoriesApi.delete(groupId, categoryId);
            queryClient.invalidateQueries({ queryKey: ['categories', groupId] });
          } catch {
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>카테고리 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 3 Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={styles.categoryLeft}>
              <Text style={styles.dragHandle}>⋮⋮</Text>
              <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[item.name] || item.icon || '📦'}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
            {item.is_default ? (
              <Icon name="lock-closed" size={18} color={COLORS.gray400} />
            ) : (
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
                <Icon name="close" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity style={styles.addBtn}>
              <Icon name="add" size={20} color={COLORS.primary} />
              <Text style={styles.addBtnText}>카테고리 추가</Text>
            </TouchableOpacity>

            <View style={styles.legend}>
              <Text style={styles.legendItem}>≡  드래그로 순서 변경</Text>
              <Text style={styles.legendItem}>🔒  시스템 기본 카테고리</Text>
              <Text style={styles.legendItem}>✕  삭제 가능한 카테고리</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.gray500 },
  tabTextActive: { color: COLORS.primary },
  list: { padding: 24, gap: 8 },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
  },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dragHandle: {
    fontSize: 16,
    color: COLORS.gray400,
    letterSpacing: 2,
  },
  categoryEmoji: { fontSize: 28 },
  categoryName: { fontSize: 16, fontWeight: '500', color: COLORS.gray900 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: { marginTop: 16, gap: 16 },
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    borderStyle: 'dashed',
  },
  addBtnText: { fontSize: 15, fontWeight: '500', color: COLORS.primary },
  legend: {
    padding: 16,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.xl,
    gap: 8,
  },
  legendItem: {
    fontSize: 13,
    color: COLORS.gray500,
  },
});
