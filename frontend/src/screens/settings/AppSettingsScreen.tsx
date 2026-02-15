import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../api/groups';
import { COLORS, RADIUS } from '../../constants/theme';
import type { RootScreenProps } from '../../types/navigation';

export default function AppSettingsScreen({ route, navigation }: RootScreenProps<'AppSettings'>) {
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const queryClient = useQueryClient();
  const { data: group } = useQuery({ queryKey: ['group', groupId], queryFn: () => groupsApi.getById(groupId) });
  const [budgetStartDay, setBudgetStartDay] = useState(group?.budget_start_day || 1);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const handleSave = async () => {
    try {
      await groupsApi.update(groupId, { budget_start_day: budgetStartDay });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      Alert.alert('완료', '설정이 저장되었습니다.');
      navigation.goBack();
    } catch {
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>앱 설정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Budget Start Day */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가계부 시작일</Text>
          <Text style={styles.sectionDesc}>통계와 예산 계산의 시작 기준일을 설정합니다</Text>
          <TouchableOpacity style={styles.settingCard} onPress={() => setShowDayPicker(!showDayPicker)}>
            <Text style={styles.settingCardText}>시작일</Text>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{budgetStartDay}일</Text>
              <Icon name="chevron-forward" size={18} color={COLORS.gray400} />
            </View>
          </TouchableOpacity>
        </View>

        {showDayPicker && (
          <View style={styles.dayPicker}>
            <View style={styles.dayGrid}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayBtn, budgetStartDay === day && styles.dayBtnActive]}
                  onPress={() => { setBudgetStartDay(day); setShowDayPicker(false); }}
                >
                  <Text style={[styles.dayBtnText, budgetStartDay === day && styles.dayBtnTextActive]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Asset Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자산 색상 설정</Text>
          <Text style={styles.sectionDesc}>자산 유형별 구분 색상입니다</Text>
          <View style={styles.colorCards}>
            <View style={styles.colorCard}>
              <View style={[styles.colorIndicator, { backgroundColor: '#E91E63' }]} />
              <Text style={styles.colorCardText}>개인 자산 색상</Text>
            </View>
            <View style={styles.colorCard}>
              <View style={[styles.colorIndicator, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.colorCardText}>공용 자산 색상</Text>
            </View>
          </View>
        </View>

        {/* Category Management */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingCard} onPress={() => navigation.navigate('CategoryManagement', { groupId })}>
            <View>
              <Text style={styles.settingCardText}>카테고리 관리</Text>
              <Text style={styles.settingCardDesc}>수입/지출 카테고리 관리</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            가계부 시작일은 통계 탭의 사이클 계산 기준이 됩니다. 예를 들어 25일로 설정하면 매월 25일부터 다음달 24일까지가 한 사이클이 됩니다.
          </Text>
        </View>
      </ScrollView>
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
  saveBtn: { color: COLORS.primary, fontWeight: '500', fontSize: 16 },

  // Section
  section: {
    padding: 24,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray900 },
  sectionDesc: { fontSize: 13, color: COLORS.gray500 },

  // Setting Card
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
  },
  settingCardText: { fontSize: 15, fontWeight: '500', color: COLORS.gray700 },
  settingCardDesc: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 16, fontWeight: '600', color: COLORS.primary },

  // Day Picker
  dayPicker: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: COLORS.gray50 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  dayBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  dayBtnTextActive: { color: COLORS.white },

  // Color Cards
  colorCards: { gap: 8 },
  colorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorCardText: { fontSize: 15, color: COLORS.gray700 },

  // Info Box
  infoBox: {
    margin: 24,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.xl,
  },
  infoText: { fontSize: 13, color: '#1E40AF', lineHeight: 20 },
});
