import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useCalendarStore } from '../../store/calendarStore';
import { assetSourcesApi } from '../../api/assetSources';
import { ASSET_SOURCE_TYPES } from '../../constants/colors';
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from '../../constants/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import type { AssetSourceResponse } from '../../types/api';

export default function AssetsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedGroupId } = useCalendarStore();

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
          <LinearGradient
            colors={[...GRADIENTS.totalAssets.colors]}
            start={GRADIENTS.totalAssets.start}
            end={GRADIENTS.totalAssets.end}
            style={styles.totalCard}>
            <Text style={styles.totalLabel}>총 자산</Text>
            <Text style={styles.totalAmount}>관리 중</Text>
            <Text style={styles.totalSubtitle}>관리 중인 자산 {assetSources.length}개</Text>
          </LinearGradient>

          {/* Personal Assets */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: COLORS.personal }]} />
              <Text style={styles.sectionTitle}>개인 자산 (Personal)</Text>
            </View>
            {assetSources.length > 0 ? (
              assetSources.map((asset: AssetSourceResponse) => (
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
                  <Icon name="chevron-forward" size={18} color={COLORS.gray400} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>등록된 개인 자산이 없습니다</Text>
              </View>
            )}
          </View>

          {/* Joint Assets */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: COLORS.joint }]} />
              <Text style={styles.sectionTitle}>공용 자산 (Joint)</Text>
            </View>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>등록된 공용 자산이 없습니다</Text>
            </View>
          </View>

          {/* Add Asset Button */}
          <TouchableOpacity style={styles.addButton}>
            <Icon name="add" size={20} color={COLORS.gray700} />
            <Text style={styles.addButtonText}>자산 추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray900 },
  scrollContent: { flex: 1 },
  content: { padding: 24, gap: 24 },

  // Total Assets Card
  totalCard: {
    borderRadius: RADIUS.xl,
    padding: 24,
    ...SHADOWS.elevated,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  totalSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  // Section
  section: { gap: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Asset Card
  assetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    ...SHADOWS.card,
  },
  assetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalIcon: { backgroundColor: COLORS.personalBadgeBg },
  jointIcon: { backgroundColor: COLORS.jointBadgeBg },
  assetEmoji: { fontSize: 22 },
  assetName: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
  assetType: { fontSize: 12, color: COLORS.gray500 },

  // Empty State
  emptyCard: {
    padding: 24,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray400,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.xl,
  },
  addButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.gray700 },
});
