import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { AuthScreenProps } from '../../types/navigation';

export default function SignUpScreen({ navigation }: AuthScreenProps<'SignUp'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');

  const isEmailValid = email.includes('@');
  const isPasswordValid = password.length >= 8;
  const isPasswordMatch = password === passwordConfirm && passwordConfirm.length > 0;
  const isNicknameValid = nickname.length >= 2 && nickname.length <= 10;
  const isValid = isEmailValid && isPasswordValid && isPasswordMatch && isNicknameValid;

  const handleNext = () => {
    if (isValid) {
      navigation.navigate('Onboarding', { email, password, nickname });
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
        <Text style={styles.title}>회원가입</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            {email.length > 0 && !isEmailValid && (
              <Text style={styles.error}>올바른 이메일 형식이 아닙니다</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
            {password.length > 0 && !isPasswordValid && (
              <Text style={styles.error}>8자 이상 입력해주세요</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
            {passwordConfirm.length > 0 && !isPasswordMatch && (
              <Text style={styles.error}>비밀번호가 일치하지 않습니다</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              maxLength={10}
              placeholderTextColor="#9CA3AF"
            />
            {nickname.length > 0 && !isNicknameValid && (
              <Text style={styles.error}>2~10자로 입력해주세요</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.submitButtonText}>다음</Text>
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
  form: { gap: 20 },
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
  error: { fontSize: 12, color: '#EF4444', marginTop: 4 },
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
