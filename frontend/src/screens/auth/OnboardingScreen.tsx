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
import { COLORS, RADIUS } from '../../constants/theme';
import GradientButton from '../../components/common/GradientButton';
import type { AuthScreenProps } from '../../types/navigation';

export default function OnboardingScreen({ route }: AuthScreenProps<'Onboarding'>) {
  const { email, password, nickname } = route.params;
  const [selectedColor, setSelectedColor] = useState(USER_COLORS[0].value);
  const [calendarName, setCalendarName] = useState(`${nickname}의 하루`);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const selectedColorName = USER_COLORS.find(c => c.value === selectedColor)?.name || '';

  const handleComplete = async () => {
    if (!calendarName.trim()) return;
    setLoading(true);
    try {
      const response = await authApi.signUp({
        email,
        password,
        nickname,
        color_code: selectedColor,
      });
      await setAuth(response.token.access_token, response.user);
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
          <View style={[styles.profileImage, { backgroundColor: selectedColor }]}>
            <Text style={styles.profileInitial}>{nickname.charAt(0)}</Text>
          </View>
          <Text style={styles.profileHint}>프로필 이미지 (선택)</Text>
        </View>

        <View style={styles.colorSection}>
          <Text style={styles.label}>내 색상을 선택해주세요</Text>
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
                  selectedColor === color.value && styles.colorBtnActive,
                ]}
                onPress={() => setSelectedColor(color.value)}
              >
                {selectedColor === color.value && (
                  <View style={styles.colorCheckDot} />
                )}
              </TouchableOpacity>
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
            placeholderTextColor={COLORS.gray400}
          />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <GradientButton
          title={loading ? '처리 중...' : '시작하기'}
          onPress={handleComplete}
          disabled={!calendarName.trim() || loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 32, paddingTop: 48 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 48,
    color: COLORS.gray900,
  },
  profileSection: { alignItems: 'center', marginBottom: 48 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: '600',
    color: COLORS.white,
  },
  profileHint: { fontSize: 14, color: COLORS.gray500 },
  colorSection: { marginBottom: 32 },
  label: { fontSize: 14, color: COLORS.gray600, marginBottom: 12 },
  selectedColorName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
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
  divider: { height: 1, backgroundColor: COLORS.gray200, marginVertical: 32 },
  nameSection: {},
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    fontSize: 16,
    color: COLORS.gray900,
  },
  bottom: { paddingHorizontal: 32, paddingBottom: 32 },
});
