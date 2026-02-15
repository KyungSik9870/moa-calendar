import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, GRADIENTS, RADIUS, SHADOWS} from '../../constants/theme';

type BudgetType = 'all' | 'personal' | 'joint';

interface BudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (budget: {type: BudgetType; amount: number}) => void;
  initialAmount?: number;
  initialType?: BudgetType;
}

const BUDGET_TYPES: {key: BudgetType; label: string}[] = [
  {key: 'all', label: '전체'},
  {key: 'personal', label: 'Personal'},
  {key: 'joint', label: 'Joint'},
];

export default function BudgetModal({
  visible,
  onClose,
  onSave,
  initialAmount = 0,
  initialType = 'all',
}: BudgetModalProps) {
  const [budgetType, setBudgetType] = useState<BudgetType>(initialType);
  const [amount, setAmount] = useState(initialAmount > 0 ? initialAmount.toString() : '');

  const handleSave = () => {
    const parsed = parseInt(amount.replace(/,/g, ''), 10);
    if (parsed > 0) {
      onSave({type: budgetType, amount: parsed});
      onClose();
    }
  };

  const formatInput = (text: string) => {
    const num = text.replace(/[^0-9]/g, '');
    if (num) {
      setAmount(parseInt(num, 10).toLocaleString());
    } else {
      setAmount('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, SHADOWS.elevated]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>예산 설정</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color={COLORS.gray500} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>예산 유형</Text>
            <View style={styles.typeRow}>
              {BUDGET_TYPES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeChip, budgetType === t.key && styles.typeChipActive]}
                  onPress={() => setBudgetType(t.key)}>
                  <Text style={[styles.typeText, budgetType === t.key && styles.typeTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>총 예산</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={formatInput}
                placeholder="0"
                placeholderTextColor={COLORS.gray400}
                keyboardType="number-pad"
              />
              <Text style={styles.amountUnit}>원</Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.8} style={styles.saveWrapper}>
              <LinearGradient
                colors={[...GRADIENTS.primary.colors]}
                start={GRADIENTS.primary.start}
                end={GRADIENTS.primary.end}
                style={styles.saveButton}>
                <Text style={styles.saveText}>저장</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray600,
    marginBottom: 8,
    marginTop: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  typeTextActive: {
    color: COLORS.white,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  amountUnit: {
    fontSize: 16,
    color: COLORS.gray500,
    marginLeft: 8,
  },
  footer: {
    padding: 24,
  },
  saveWrapper: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  saveButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
});
