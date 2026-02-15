import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { groupsApi } from '../../api/groups';
import { COLORS, GRADIENTS, RADIUS } from '../../constants/theme';
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
      await groupsApi.invite(groupId, { email: searchResult.email });
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
          <Icon name="chevron-back" size={24} color={COLORS.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>멤버 초대</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Row */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Icon name="search" size={18} color={COLORS.gray400} />
            <TextInput
              style={styles.searchInput}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일로 검색"
              placeholderTextColor={COLORS.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity onPress={searchResult ? handleInvite : handleSearch} activeOpacity={0.8}>
            <LinearGradient
              colors={[...GRADIENTS.primary.colors]}
              start={GRADIENTS.primary.start}
              end={GRADIENTS.primary.end}
              style={styles.inviteBtn}
            >
              <Text style={styles.inviteBtnText}>{searchResult ? '초대 보내기' : '검색'}</Text>
            </LinearGradient>
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
          </View>
        )}
      </View>

      {/* Invite Status */}
      <View style={styles.pendingSection}>
        <Text style={styles.sectionTitle}>초대 현황</Text>
        <FlatList
          data={pendingInvites}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.pendingCard}>
              <Text style={styles.pendingEmail}>{item.invitee_email}</Text>
              <View style={[
                styles.statusBadge,
                item.status === 'ACCEPTED' ? styles.statusAccepted : styles.statusPending,
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'ACCEPTED' ? styles.statusAcceptedText : styles.statusPendingText,
                ]}>
                  {item.status === 'ACCEPTED' ? '수락됨' : '대기 중'}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>초대 내역이 없습니다.</Text>}
        />
      </View>
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

  // Search
  searchSection: {
    padding: 24,
    gap: 12,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.gray100,
  },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.gray900,
  },
  inviteBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
  },
  inviteBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  errorText: { fontSize: 14, color: COLORS.danger },

  // Result
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.gray50,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultAvatarText: { fontSize: 16, fontWeight: '500', color: COLORS.white },
  resultName: { fontSize: 15, fontWeight: '500', color: COLORS.gray900 },
  resultEmail: { fontSize: 13, color: COLORS.gray500 },

  // Pending
  pendingSection: { flex: 1, padding: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray900, marginBottom: 16 },
  pendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  pendingEmail: { fontSize: 15, color: COLORS.gray700 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusAccepted: { backgroundColor: '#DCFCE7' },
  statusPending: { backgroundColor: '#FEF9C3' },
  statusText: { fontSize: 12, fontWeight: '500' },
  statusAcceptedText: { color: '#15803D' },
  statusPendingText: { color: '#A16207' },
  emptyText: { fontSize: 14, color: COLORS.gray400, textAlign: 'center', paddingTop: 32 },
});
