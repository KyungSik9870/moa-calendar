import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { USER_COLORS } from '../../constants/colors';
import type { AuthScreenProps } from '../../types/navigation';

export default function OnboardingScreen({ route }: AuthScreenProps<'Onboarding'>) {
  const { email, password, nickname } = route.params;
  const [selectedColor, setSelectedColor] = useState(USER_COLORS[0].value);
  const [calendarName, setCalendarName] = useState(`${nickname}의 하루`);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleComplete = async () => {
    if (!calendarName.trim()) return;
    setLoading(true);
    try {
      const response = await authApi.signUp({
        email,
        password,
        nickname,
        color_code: selectedColor,
        calendar_name: calendarName,
      });
      await setAuth(response.token, response.user);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '회원가입에 실패했습니다';
      Alert.alert('오류', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Text style={styles.title}>프로필을 설정해주세요</Text>

        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImage}>
            <Icon name="camera" size={40} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.profileHint}>프로필 이미지 (선택)</Text>
        </View>

        <View style={styles.colorSection}>
          <Text style={styles.label}>내 색상을 선택해주세요</Text>
          <View style={styles.colorGrid}>
            {USER_COLORS.map((color) => (
              <TouchableOpacity
                key={color.value}
                style={[
                  styles.colorButton,
                  { backgroundColor: color.value },
                  selectedColor === color.value && styles.colorSelected,
                ]}
                onPress={() => setSelectedColor(color.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.nameSection}>
          <Text style={styles.label}>캘린더 이름</Text>
          <TextInput
            style={styles.input}
            value={calendarName}
            onChangeText={setCalendarName}
            placeholder={`${nickname}의 하루`}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.submitButton, !calendarName.trim() && styles.submitButtonDisabled]}
          onPress={handleComplete}
          disabled={!calendarName.trim() || loading}
        >
          <Text style={styles.submitButtonText}>{loading ? '처리 중...' : '시작하기'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 32, paddingTop: 48 },
  title: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 48,
    color: '#000',
  },
  profileSection: { alignItems: 'center', marginBottom: 48 },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileHint: { fontSize: 14, color: '#6B7280' },
  colorSection: { marginBottom: 32 },
  label: { fontSize: 14, color: '#4B5563', marginBottom: 12 },
  colorGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorButton: { width: 40, height: 40, borderRadius: 20 },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 32 },
  nameSection: {},
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
  },
  bottom: { paddingHorizontal: 32, paddingBottom: 32 },
  submitButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
});
