import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../../api/groups';
import { useAuthStore } from '../../store/authStore';
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
          <Icon name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>멤버 목록</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <View style={styles.memberLeft}>
              <View style={[styles.avatar, { backgroundColor: item.color_code }]}>
                <Text style={styles.avatarText}>{item.nickname.charAt(0)}</Text>
              </View>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName}>{item.nickname}</Text>
                  {item.role === 'HOST' && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>호스트</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberEmail}>{item.email}</Text>
              </View>
            </View>
            {isHost && item.user_id !== user?.id && (
              <TouchableOpacity onPress={() => handleKick(item)} style={styles.kickBtn}>
                <Icon name="close-circle-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  list: { padding: 24, gap: 12 },
  memberCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12 },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: { fontSize: 15, fontWeight: '500' },
  hostBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#EFF6FF', borderRadius: 4 },
  hostBadgeText: { fontSize: 11, color: '#2563EB', fontWeight: '500' },
  memberEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  kickBtn: { padding: 8 },
});
