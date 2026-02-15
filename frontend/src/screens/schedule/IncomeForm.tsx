import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { format } from 'date-fns';
import { transactionsApi } from '../../api/transactions';
import { COLORS, RADIUS } from '../../constants/theme';
import { useQueryClient } from '@tanstack/react-query';
import DropdownSelect from '../../components/common/DropdownSelect';

const INCOME_CATEGORIES = [
  { label: '💰 급여', value: '급여' },
  { label: '💵 부수입', value: '부수입' },
  { label: '🎊 용돈/선물', value: '용돈/선물' },
  { label: '📈 투자수익', value: '투자수익' },
  { label: '💸 환급', value: '환급' },
  { label: '📦 기타', value: '기타' },
];

interface IncomeFormProps {
  selectedDate: Date;
  groupId: number;
}

const IncomeForm = forwardRef(({ selectedDate, groupId }: IncomeFormProps, ref) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('급여');
  const [assetType, setAssetType] = useState<'PERSONAL' | 'JOINT'>('PERSONAL');
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
          transaction_type: 'INCOME',
          asset_type: assetType,
          category_name: category,
          date: format(selectedDate, 'yyyy-MM-dd'),
          description: memo || undefined,
        });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['statistics'] });
        return true;
      } catch {
        Alert.alert('오류', '수입 저장에 실패했습니다');
        return false;
      }
    },
  }));

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
          options={INCOME_CATEGORIES}
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
});

export default IncomeForm;

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
