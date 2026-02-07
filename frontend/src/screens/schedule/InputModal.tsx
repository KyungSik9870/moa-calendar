import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ScheduleForm from './ScheduleForm';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
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
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [formRef, setFormRef] = useState<{ submit: () => Promise<boolean> } | null>(
    null,
  );

  const handleSave = async () => {
    if (formRef) {
      const success = await formRef.submit();
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
            <Icon name="close" size={20} color="#4B5563" />
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
              ref={(r: { submit: () => Promise<boolean> } | null) => setFormRef(r)}
            />
          )}
          {activeTab === 'expense' && (
            <ExpenseForm
              selectedDate={selectedDate}
              groupId={groupId}
              schedules={schedules}
              ref={(r: { submit: () => Promise<boolean> } | null) => setFormRef(r)}
            />
          )}
          {activeTab === 'income' && (
            <IncomeForm
              selectedDate={selectedDate}
              groupId={groupId}
              ref={(r: { submit: () => Promise<boolean> } | null) => setFormRef(r)}
            />
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 8,
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  formContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  saveContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
