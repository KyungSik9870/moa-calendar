import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../api/groups';
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
          <Icon name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>앱 설정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowDayPicker(!showDayPicker)}>
          <View>
            <Text style={styles.settingTitle}>가계부 시작일</Text>
            <Text style={styles.settingDesc}>통계와 예산 계산 기준일입니다</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{budgetStartDay}일</Text>
            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

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

        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('CategoryManagement', { groupId })}>
          <View>
            <Text style={styles.settingTitle}>카테고리 관리</Text>
            <Text style={styles.settingDesc}>수입/지출 카테고리 관리</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>가계부 시작일은 통계 탭의 사이클 계산 기준이 됩니다.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  saveBtn: { color: '#2563EB', fontWeight: '500', fontSize: 16 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  settingDesc: { fontSize: 14, color: '#6B7280' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 16, fontWeight: '500' },
  dayPicker: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#F9FAFB' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  dayBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  dayBtnText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  dayBtnTextActive: { color: '#FFFFFF' },
  infoBox: { margin: 24, padding: 16, backgroundColor: '#EFF6FF', borderRadius: 8 },
  infoText: { fontSize: 14, color: '#1E40AF' },
});
