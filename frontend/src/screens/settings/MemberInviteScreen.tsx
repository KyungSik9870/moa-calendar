import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { groupsApi } from '../../api/groups';
import type { RootScreenProps } from '../../types/navigation';
import type { UserSearchResponse } from '../../types/api';

export default function MemberInviteScreen({ route, navigation }: RootScreenProps<'MemberInvite'>) {
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<UserSearchResponse | null>(null);
  const [searchError, setSearchError] = useState('');

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pendingInvites', groupId],
    queryFn: () => groupsApi.getPendingInvites(),
  });

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearchError('');
    setSearchResult(null);
    try {
      const result = await usersApi.search(email.trim());
      setSearchResult(result);
    } catch {
      setSearchError('사용자를 찾을 수 없습니다.');
    }
  };

  const handleInvite = async () => {
    if (!searchResult) return;
    try {
      await groupsApi.invite(groupId, { invitee_email: searchResult.email });
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
      Alert.alert('완료', `${searchResult.nickname}님에게 초대를 보냈습니다.`);
      setSearchResult(null);
      setEmail('');
    } catch {
      Alert.alert('오류', '초대에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>멤버 초대</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={email}
            onChangeText={setEmail}
            placeholder="이메일로 검색"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Icon name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}

        {searchResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultLeft}>
              <View style={[styles.resultAvatar, { backgroundColor: searchResult.color_code }]}>
                <Text style={styles.resultAvatarText}>{searchResult.nickname.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.resultName}>{searchResult.nickname}</Text>
                <Text style={styles.resultEmail}>{searchResult.email}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite}>
              <Text style={styles.inviteBtnText}>초대</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.pendingSection}>
        <Text style={styles.sectionTitle}>대기 중인 초대</Text>
        <FlatList
          data={pendingInvites}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.pendingCard}>
              <Text style={styles.pendingEmail}>{item.invitee_email}</Text>
              <Text style={styles.pendingStatus}>대기중</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>대기 중인 초대가 없습니다.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  searchSection: { padding: 24, gap: 12, borderBottomWidth: 8, borderBottomColor: '#F3F4F6' },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  searchBtn: { width: 48, backgroundColor: '#2563EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, color: '#EF4444' },
  resultCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB' },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  resultAvatarText: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  resultName: { fontSize: 15, fontWeight: '500' },
  resultEmail: { fontSize: 13, color: '#6B7280' },
  inviteBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#2563EB', borderRadius: 8 },
  inviteBtnText: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  pendingSection: { flex: 1, padding: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  pendingCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  pendingEmail: { fontSize: 15 },
  pendingStatus: { fontSize: 13, color: '#F59E0B', fontWeight: '500' },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingTop: 32 },
});
