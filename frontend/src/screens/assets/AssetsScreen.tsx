import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useCalendarStore } from '../../store/calendarStore';
import { assetSourcesApi } from '../../api/assetSources';
import { groupsApi } from '../../api/groups';
import { ASSET_SOURCE_TYPES } from '../../constants/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import type { GroupResponse, AssetSourceResponse } from '../../types/api';

export default function AssetsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedGroupId } = useCalendarStore();

  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: () => groupsApi.getAll() });
  const currentGroup = groups.find((g: GroupResponse) => g.id === selectedGroupId);
  const isShared = currentGroup?.type === 'SHARED';

  const { data: assetSources = [] } = useQuery({
    queryKey: ['assetSources', selectedGroupId],
    queryFn: () => assetSourcesApi.getAll(selectedGroupId!),
    enabled: !!selectedGroupId,
  });

  const getEmoji = (type: string) => ASSET_SOURCE_TYPES.find(t => t.value === type)?.emoji || '💵';
  const getTypeLabel = (type: string) => ASSET_SOURCE_TYPES.find(t => t.value === type)?.label || type;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>자산</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          {/* Total Assets Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>총 자산</Text>
            <Text style={styles.totalAmount}>관리 중인 자산 {assetSources.length}개</Text>
          </View>

          {/* Personal Assets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>개인 자산 (Personal)</Text>
            {assetSources.map((asset: AssetSourceResponse) => (
              <TouchableOpacity
                key={asset.id}
                style={styles.assetCard}
                onPress={() => navigation.navigate('AssetDetail', { assetSourceId: asset.id, assetName: asset.name })}
              >
                <View style={styles.assetLeft}>
                  <View style={[styles.assetIcon, styles.personalIcon]}>
                    <Text style={styles.assetEmoji}>{getEmoji(asset.type)}</Text>
                  </View>
                  <View>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetType}>{getTypeLabel(asset.type)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add Asset Button */}
          <TouchableOpacity style={styles.addButton}>
            <Icon name="add" size={20} color="#374151" />
            <Text style={styles.addButtonText}>자산 추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 20, fontWeight: '500' },
  scrollContent: { flex: 1 },
  content: { padding: 24, gap: 24 },
  totalCard: { backgroundColor: '#7C3AED', borderRadius: 16, padding: 24 },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  totalAmount: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 14, color: '#4B5563', paddingHorizontal: 8, marginBottom: 4 },
  assetCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
  },
  assetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assetIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  personalIcon: { backgroundColor: '#FCE7F3' },
  assetEmoji: { fontSize: 18 },
  assetName: { fontSize: 14, fontWeight: '500' },
  assetType: { fontSize: 12, color: '#6B7280' },
  addButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    paddingVertical: 16, backgroundColor: '#F3F4F6', borderRadius: 16,
  },
  addButtonText: { fontSize: 15, fontWeight: '500', color: '#374151' },
});
