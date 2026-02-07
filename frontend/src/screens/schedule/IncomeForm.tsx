import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { format } from 'date-fns';
import { transactionsApi } from '../../api/transactions';
import { useQueryClient } from '@tanstack/react-query';

const INCOME_CATEGORIES = [
  '💰 급여',
  '💵 부수입',
  '🎊 용돈/선물',
  '📈 투자수익',
  '💸 환급',
  '📦 기타',
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
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <Text style={styles.currency}>원</Text>
        </View>
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>카테고리</Text>
        <View style={styles.chipRow}>
          {INCOME_CATEGORIES.map((cat) => {
            const name = cat.split(' ').slice(1).join(' ');
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === name && styles.chipActive]}
                onPress={() => setCategory(name)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === name && styles.chipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
          placeholderTextColor="#9CA3AF"
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
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#DBEAFE',
  },
  chipText: {
    fontSize: 13,
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#2563EB',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typePersonalActive: {
    backgroundColor: '#EC4899',
  },
  typeJointActive: {
    backgroundColor: '#3B82F6',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
});
