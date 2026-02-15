import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { format } from 'date-fns';
import { transactionsApi } from '../../api/transactions';
import { COLORS, RADIUS } from '../../constants/theme';
import { useQueryClient } from '@tanstack/react-query';
import DropdownSelect from '../../components/common/DropdownSelect';
import type { ScheduleResponse } from '../../types/api';

const EXPENSE_CATEGORIES = [
  { label: '🍚 식비', value: '식비' },
  { label: '☕ 카페/간식', value: '카페/간식' },
  { label: '🚌 교통', value: '교통' },
  { label: '🏠 주거/통신', value: '주거/통신' },
  { label: '👕 쇼핑', value: '쇼핑' },
  { label: '🎁 선물', value: '선물' },
  { label: '💊 의료/건강', value: '의료/건강' },
  { label: '📚 교육', value: '교육' },
  { label: '🎬 문화/여가', value: '문화/여가' },
  { label: '🐶 반려동물', value: '반려동물' },
  { label: '✂️ 미용', value: '미용' },
  { label: '📦 기타', value: '기타' },
];

interface ExpenseFormProps {
  selectedDate: Date;
  groupId: number;
  schedules: ScheduleResponse[];
}

const ExpenseForm = forwardRef(
  ({ selectedDate, groupId, schedules }: ExpenseFormProps, ref) => {
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('식비');
    const [assetType, setAssetType] = useState<'PERSONAL' | 'JOINT'>('PERSONAL');
    const [scheduleId, setScheduleId] = useState<number | undefined>(undefined);
    const [memo, setMemo] = useState('');

    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (!amount || Number(amount) <= 0) {
          Alert.alert('오류', '금액을 입력해주세요');
          return false;
        }
        try {
          await transactionsApi.create(groupId, {
            amount: Number(amount),
            transaction_type: 'EXPENSE',
            asset_type: assetType,
            category_name: category,
            date: format(selectedDate, 'yyyy-MM-dd'),
            description: memo || undefined,
            schedule_id: scheduleId,
          });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['statistics'] });
          return true;
        } catch {
          Alert.alert('오류', '지출 저장에 실패했습니다');
          return false;
        }
      },
    }));

    const daySchedules = schedules.filter(
      (s) => s.start_date === format(selectedDate, 'yyyy-MM-dd'),
    );
    const scheduleOptions = [
      { label: '연결 안 함', value: 'none' },
      ...daySchedules.map((s) => ({ label: s.title, value: String(s.id) })),
    ];

    return (
      <View style={styles.form}>
        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>금액</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={COLORS.gray400}
              keyboardType="numeric"
            />
            <Text style={styles.currency}>원</Text>
          </View>
        </View>

        {/* Category - Dropdown */}
        <View style={styles.field}>
          <Text style={styles.label}>카테고리</Text>
          <DropdownSelect
            options={EXPENSE_CATEGORIES}
            selectedValue={category}
            onSelect={setCategory}
            placeholder="카테고리 선택"
          />
        </View>

        {/* Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                assetType === 'PERSONAL' && styles.typePersonalActive,
              ]}
              onPress={() => setAssetType('PERSONAL')}
            >
              <Text
                style={[
                  styles.typeText,
                  assetType === 'PERSONAL' && styles.typeTextActive,
                ]}
              >
                Personal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                assetType === 'JOINT' && styles.typeJointActive,
              ]}
              onPress={() => setAssetType('JOINT')}
            >
              <Text
                style={[
                  styles.typeText,
                  assetType === 'JOINT' && styles.typeTextActive,
                ]}
              >
                Joint
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Link to Schedule - Dropdown */}
        <View style={styles.field}>
          <Text style={styles.label}>일정 연결</Text>
          <DropdownSelect
            options={scheduleOptions}
            selectedValue={scheduleId ? String(scheduleId) : 'none'}
            onSelect={(val) => setScheduleId(val === 'none' ? undefined : Number(val))}
            placeholder="연결 안 함"
          />
        </View>

        {/* Memo */}
        <View style={styles.field}>
          <Text style={styles.label}>메모</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모 (선택)"
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    );
  },
);

export default ExpenseForm;

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {},
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray600,
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    fontSize: 16,
    color: COLORS.gray900,
  },
  textArea: {
    height: 88,
    textAlignVertical: 'top',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 16,
    color: COLORS.gray500,
    marginLeft: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  typePersonalActive: {
    backgroundColor: COLORS.personal,
  },
  typeJointActive: {
    backgroundColor: COLORS.joint,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  typeTextActive: {
    color: COLORS.white,
  },
});
