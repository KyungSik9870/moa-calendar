import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../api/groups';
import { useAuthStore } from '../../store/authStore';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
import type { RootScreenProps } from '../../types/navigation';
import type { GroupMemberResponse } from '../../types/api';

export default function MemberListScreen({ route, navigation }: RootScreenProps<'MemberList'>) {
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: group } = useQuery({ queryKey: ['group', groupId], queryFn: () => groupsApi.getById(groupId) });
  const { data: members = [] } = useQuery({ queryKey: ['members', groupId], queryFn: () => groupsApi.getMembers(groupId) });

  const isHost = group?.host_id === user?.id;

  const handleKick = (member: GroupMemberResponse) => {
    Alert.alert('멤버 내보내기', `${member.nickname}님을 내보내시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '내보내기',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupsApi.removeMember(groupId, member.user_id);
            queryClient.invalidateQueries({ queryKey: ['members', groupId] });
          } catch {
            Alert.alert('오류', '멤버 내보내기에 실패했습니다.');
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
        <Text style={styles.headerTitle}>멤버 목록</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMe = item.user_id === user?.id;
          return (
            <View style={styles.memberCard}>
              <View style={styles.memberLeft}>
                <View style={[styles.colorDot, { backgroundColor: item.color_code }]} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {item.nickname}{isMe ? ' (나)' : ''}
                  </Text>
                  <Text style={styles.memberEmail}>{item.role === 'HOST' ? '호스트' : '게스트'}</Text>
                </View>
              </View>
              {item.role === 'HOST' ? (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>호스트</Text>
                </View>
              ) : isHost ? (
                <TouchableOpacity onPress={() => handleKick(item)} style={styles.kickBtn}>
                  <Text style={styles.kickBtnText}>내보내기</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        }}
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
  list: { padding: 24, gap: 8 },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    ...SHADOWS.card,
  },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  memberInfo: { gap: 2 },
  memberName: { fontSize: 15, fontWeight: '500', color: COLORS.gray900 },
  memberEmail: { fontSize: 13, color: COLORS.gray500 },
  hostBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.jointBadgeBg,
    borderRadius: RADIUS.full,
  },
  hostBadgeText: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '500' },
  kickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.full,
  },
  kickBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.danger,
  },
});
