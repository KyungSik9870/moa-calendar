import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants/theme';
import GradientButton from '../../components/common/GradientButton';
import type { AuthScreenProps } from '../../types/navigation';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const isValid = email.includes('@') && password.length >= 8;

  const handleLogin = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      await setAuth(response.token.access_token, response.user);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '로그인에 실패했습니다';
      Alert.alert('오류', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={COLORS.gray900} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>로그인</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="minsu@email.com"
              placeholderTextColor={COLORS.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.gray400}
              secureTextEntry
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <GradientButton
          title={loading ? '로그인 중...' : '로그인'}
          onPress={handleLogin}
          disabled={!isValid || loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backButton: { padding: 8, marginLeft: -8 },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 32, color: COLORS.gray900 },
  form: { gap: 24 },
  field: {},
  label: { fontSize: 14, color: COLORS.gray600, marginBottom: 8 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 20,
    fontSize: 16,
    color: COLORS.gray900,
  },
  bottom: { paddingHorizontal: 32, paddingBottom: 32 },
});
