import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ScheduleForm from './ScheduleForm';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, RADIUS } from '../../constants/theme';
import type { ScheduleResponse } from '../../types/api';

type Tab = 'schedule' | 'expense' | 'income';

interface InputModalProps {
  selectedDate: Date;
  groupId: number;
  schedules: ScheduleResponse[];
  onClose: () => void;
}

export default function InputModal({
  selectedDate,
  groupId,
  schedules,
  onClose,
}: InputModalProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('schedule');
  const formRef = useRef<{ submit: () => Promise<boolean> } | null>(null);

  const handleSave = async () => {
    if (formRef.current) {
      const success = await formRef.current.submit();
      if (success) onClose();
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'schedule', label: 'Schedule' },
    { key: 'expense', label: 'Expense' },
    { key: 'income', label: 'Income' },
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={styles.modal}>
        {/* Drag Handle + Close */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={20} color={COLORS.gray600} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Content */}
        <ScrollView style={styles.formContent} keyboardShouldPersistTaps="handled">
          {activeTab === 'schedule' && (
            <ScheduleForm
              selectedDate={selectedDate}
              groupId={groupId}
              ref={formRef}
            />
          )}
          {activeTab === 'expense' && (
            <ExpenseForm
              selectedDate={selectedDate}
              groupId={groupId}
              schedules={schedules}
              ref={formRef}
            />
          )}
          {activeTab === 'income' && (
            <IncomeForm
              selectedDate={selectedDate}
              groupId={groupId}
              ref={formRef}
            />
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <GradientButton title="저장" onPress={handleSave} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.gray300,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 10,
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  saveContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
});
