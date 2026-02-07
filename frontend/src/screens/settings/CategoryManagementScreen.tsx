import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { CATEGORY_EMOJI } from '../../constants/colors';
import type { RootScreenProps } from '../../types/navigation';

type CategoryTab = 'EXPENSE' | 'INCOME';

export default function CategoryManagementScreen({ route, navigation }: RootScreenProps<'CategoryManagement'>) {
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CategoryTab>('EXPENSE');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', groupId, activeTab],
    queryFn: () => categoriesApi.getAll(groupId, activeTab),
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
          <Icon name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>카테고리 관리</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        {(['EXPENSE', 'INCOME'] as const).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab === 'EXPENSE' ? '지출' : '수입'}</Text>
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
              <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[item.name] || item.icon || '📦'}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
            {item.is_default ? (
              <Icon name="lock-closed" size={18} color="#9CA3AF" />
            ) : (
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                <Icon name="close-circle" size={22} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn}>
            <Icon name="add" size={20} color="#374151" />
            <Text style={styles.addBtnText}>카테고리 추가</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#2563EB' },
  list: { padding: 24, gap: 8 },
  categoryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12 },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryEmoji: { fontSize: 24 },
  categoryName: { fontSize: 15, fontWeight: '500' },
  addBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 16, backgroundColor: '#F3F4F6', borderRadius: 16, marginTop: 16 },
  addBtnText: { fontSize: 15, fontWeight: '500', color: '#374151' },
});
