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
      await setAuth(response.token, response.user);
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
          <Icon name="chevron-back" size={24} color="#000" />
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
              placeholderTextColor="#9CA3AF"
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
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
          onPress={handleLogin}
          disabled={!isValid || loading}
        >
          <Text style={styles.submitButtonText}>{loading ? '로그인 중...' : '로그인'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8, marginLeft: -8 },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 32 },
  title: { fontSize: 30, fontWeight: '500', marginBottom: 32, color: '#000' },
  form: { gap: 24 },
  field: {},
  label: { fontSize: 14, color: '#4B5563', marginBottom: 8 },
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
