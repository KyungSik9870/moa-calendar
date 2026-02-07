import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { GroupResponse } from '../../types/api';

interface CalendarSwitcherProps {
  groups: GroupResponse[];
  currentGroupId: number | null;
  onGroupChange: (groupId: number) => void;
}

export default function CalendarSwitcher({
  groups,
  currentGroupId,
  onGroupChange,
}: CalendarSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentGroup = groups.find((g) => g.id === currentGroupId);

  const handleSelect = (groupId: number) => {
    onGroupChange(groupId);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.trigger}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {currentGroup?.name || '캘린더 선택'}
        </Text>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#4B5563"
        />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        >
          <View style={styles.dropdown}>
            <FlatList
              data={groups}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.id)}
                >
                  <View>
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionName}>{item.name}</Text>
                      {item.id === currentGroupId && (
                        <Icon name="checkmark" size={16} color="#2563EB" />
                      )}
                    </View>
                    <Text style={styles.optionType}>
                      {item.type === 'PERSONAL' ? '개인' : '공유'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    maxWidth: 180,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 300,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  optionType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
