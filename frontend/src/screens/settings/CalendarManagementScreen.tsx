import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../api/groups';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
import type { RootScreenProps } from '../../types/navigation';

export default function CalendarManagementScreen({ route, navigation }: RootScreenProps<'CalendarManagement'>) {
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const queryClient = useQueryClient();
  const { data: group } = useQuery({ queryKey: ['group', groupId], queryFn: () => groupsApi.getById(groupId) });
  const { data: members = [] } = useQuery({ queryKey: ['members', groupId], queryFn: () => groupsApi.getMembers(groupId) });
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

  const isShared = group?.type === 'SHARED';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>캘린더 관리</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Calendar Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.calendarAvatar}>
            <Icon name="calendar" size={28} color={COLORS.white} />
          </View>
          <View style={styles.infoDetails}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              maxLength={30}
              placeholder="캘린더 이름"
              placeholderTextColor={COLORS.gray400}
            />
            <Text style={styles.infoSubtext}>
              {isShared ? `공유 캘린더 · ${members.length}명` : '개인 캘린더'}
            </Text>
          </View>
          <View style={styles.hostBadge}>
            <Text style={styles.hostBadgeText}>호스트</Text>
          </View>
        </View>

        {/* Member Management */}
        {isShared && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>멤버 관리</Text>
            <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('MemberInvite', { groupId })}>
              <View style={styles.menuCardLeft}>
                <View style={[styles.menuIcon, { backgroundColor: COLORS.jointBadgeBg }]}>
                  <Icon name="person-add-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.menuCardText}>멤버 초대</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('MemberList', { groupId })}>
              <View style={styles.menuCardLeft}>
                <View style={[styles.menuIcon, { backgroundColor: COLORS.jointBadgeBg }]}>
                  <Icon name="people-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.menuCardText}>멤버 목록</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        {isShared && (
          <View style={styles.section}>
            <Text style={styles.dangerTitle}>위험 영역</Text>
            <TouchableOpacity style={styles.dangerCard} onPress={handleDelete}>
              <View style={styles.dangerCardLeft}>
                <View style={styles.dangerIcon}>
                  <Icon name="trash-outline" size={18} color={COLORS.danger} />
                </View>
                <View>
                  <Text style={styles.dangerCardText}>캘린더 삭제</Text>
                  <Text style={styles.dangerCardDesc}>이 작업은 되돌릴 수 없습니다</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
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
  scrollContent: { flex: 1 },

  // Calendar Info
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.gray100,
  },
  calendarAvatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoDetails: { flex: 1, gap: 4 },
  nameInput: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.gray900,
    padding: 0,
  },
  infoSubtext: { fontSize: 13, color: COLORS.gray500 },
  hostBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.jointBadgeBg,
    borderRadius: RADIUS.full,
  },
  hostBadgeText: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '500' },

  // Section
  section: { padding: 24, gap: 12, borderBottomWidth: 8, borderBottomColor: COLORS.gray100 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray900, marginBottom: 4 },

  // Menu Cards
  menuCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    ...SHADOWS.card,
    backgroundColor: COLORS.white,
  },
  menuCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCardText: { fontSize: 15, fontWeight: '500', color: COLORS.gray700 },

  // Danger Zone
  dangerTitle: { fontSize: 16, fontWeight: '600', color: COLORS.danger, marginBottom: 4 },
  dangerCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: RADIUS.xl,
    backgroundColor: '#FEF2F2',
  },
  dangerCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dangerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerCardText: { fontSize: 15, fontWeight: '500', color: COLORS.danger },
  dangerCardDesc: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
});
