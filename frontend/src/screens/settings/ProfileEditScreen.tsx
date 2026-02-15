import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../api/users';
import { USER_COLORS } from '../../constants/colors';
import { COLORS, RADIUS } from '../../constants/theme';
import type { RootScreenProps } from '../../types/navigation';

export default function ProfileEditScreen({ navigation }: RootScreenProps<'ProfileEdit'>) {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [colorCode, setColorCode] = useState(user?.color_code || '#5B9FFF');

  const selectedColorName = USER_COLORS.find(c => c.value === colorCode)?.name || '';

  const handleSave = async () => {
    try {
      const updated = await usersApi.updateMe({ nickname, color_code: colorCode });
      setUser(updated);
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      Alert.alert('완료', '프로필이 수정되었습니다.');
      navigation.goBack();
    } catch {
      Alert.alert('오류', '프로필 수정에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatar, { backgroundColor: colorCode }]}>
                <Text style={styles.avatarText}>{nickname.charAt(0) || '?'}</Text>
              </View>
              <View style={styles.cameraOverlay}>
                <Icon name="camera" size={14} color={COLORS.white} />
              </View>
            </View>
            <Text style={styles.changePhotoText}>프로필 사진 변경</Text>
          </View>

          {/* Nickname */}
          <View style={styles.field}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={(text) => setNickname(text.slice(0, 10))}
              maxLength={10}
              placeholder="닉네임 입력"
              placeholderTextColor={COLORS.gray400}
            />
            <Text style={styles.charCount}>{nickname.length}/10자</Text>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          {/* Color Grid - 4x2 large squares */}
          <View style={styles.field}>
            <Text style={styles.label}>색상</Text>
            {selectedColorName ? (
              <Text style={styles.selectedColorName}>{selectedColorName}</Text>
            ) : null}
            <View style={styles.colorGrid}>
              {USER_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: color.value },
                    colorCode === color.value && styles.colorBtnActive,
                  ]}
                  onPress={() => setColorCode(color.value)}
                >
                  {colorCode === color.value && (
                    <View style={styles.colorCheckDot} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Change Password Link */}
          <TouchableOpacity style={styles.passwordLink}>
            <Text style={styles.passwordLinkText}>비밀번호 변경하기</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
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
  scrollContent: { flex: 1 },
  content: { padding: 28, gap: 24 },

  // Avatar
  avatarSection: { alignItems: 'center', gap: 12 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: '600', color: COLORS.white },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray600,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changePhotoText: { fontSize: 14, color: COLORS.primary },

  // Fields
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.gray600 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.gray900,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'right',
  },
  emailText: { fontSize: 16, color: COLORS.gray500, paddingVertical: 12 },
  selectedColorName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Color Grid - 4x2 large square
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorBtn: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorBtnActive: {
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheckDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },

  // Password Link
  passwordLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  passwordLinkText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
