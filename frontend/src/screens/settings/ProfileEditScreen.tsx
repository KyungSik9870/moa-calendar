import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../api/users';
import { USER_COLORS } from '../../constants/colors';
import type { RootScreenProps } from '../../types/navigation';

export default function ProfileEditScreen({ navigation }: RootScreenProps<'ProfileEdit'>) {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [colorCode, setColorCode] = useState(user?.color_code || '#5B9FFF');

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
          <Icon name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colorCode }]}>
            <Text style={styles.avatarText}>{nickname.charAt(0) || '?'}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            maxLength={10}
            placeholder="닉네임 입력"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>이메일</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>색상</Text>
          <View style={styles.colorGrid}>
            {USER_COLORS.map((color) => (
              <TouchableOpacity
                key={color.value}
                style={[styles.colorBtn, { backgroundColor: color.value }, colorCode === color.value && styles.colorBtnActive]}
                onPress={() => setColorCode(color.value)}
              >
                {colorCode === color.value && <Icon name="checkmark" size={18} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  saveBtn: { color: '#2563EB', fontWeight: '500', fontSize: 16 },
  content: { padding: 24, gap: 24 },
  avatarSection: { alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '600', color: '#FFFFFF' },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  emailText: { fontSize: 16, color: '#6B7280', paddingVertical: 12 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorBtnActive: { borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
});
