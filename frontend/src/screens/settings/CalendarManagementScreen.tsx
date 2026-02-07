import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../api/groups';
import type { RootScreenProps } from '../../types/navigation';

export default function CalendarManagementScreen({ route, navigation }: RootScreenProps<'CalendarManagement'>) {
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const queryClient = useQueryClient();
  const { data: group } = useQuery({ queryKey: ['group', groupId], queryFn: () => groupsApi.getById(groupId) });
  const [name, setName] = useState(group?.name || '');

  const handleSave = async () => {
    try {
      await groupsApi.update(groupId, { name });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      Alert.alert('완료', '캘린더가 수정되었습니다.');
      navigation.goBack();
    } catch {
      Alert.alert('오류', '수정에 실패했습니다.');
    }
  };

  const handleDelete = () => {
    Alert.alert('캘린더 삭제', '정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupsApi.delete(groupId);
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            navigation.goBack();
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
        <Text style={styles.headerTitle}>캘린더 관리</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>캘린더 정보</Text>
          <View style={styles.field}>
            <Text style={styles.label}>캘린더 이름</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={30} placeholder="캘린더 이름" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>유형</Text>
            <Text style={styles.valueText}>{group?.type === 'PERSONAL' ? '개인 캘린더' : '공유 캘린더'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>멤버 관리</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MemberInvite', { groupId })}>
            <Text style={styles.menuItemText}>멤버 초대</Text>
            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MemberList', { groupId })}>
            <Text style={styles.menuItemText}>멤버 목록</Text>
            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {group?.type === 'SHARED' && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>위험 영역</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Icon name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteBtnText}>캘린더 삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  saveBtn: { color: '#2563EB', fontWeight: '500', fontSize: 16 },
  content: { flex: 1 },
  section: { padding: 24, gap: 16, borderBottomWidth: 8, borderBottomColor: '#F3F4F6' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  valueText: { fontSize: 16, color: '#6B7280', paddingVertical: 4 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuItemText: { fontSize: 15, color: '#374151' },
  dangerZone: { padding: 24, gap: 16 },
  dangerTitle: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, backgroundColor: '#FEF2F2' },
  deleteBtnText: { fontSize: 15, color: '#EF4444', fontWeight: '500' },
});
