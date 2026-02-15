import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';
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
          color={COLORS.gray600}
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
                      <View style={[
                        styles.typeBadge,
                        item.type === 'PERSONAL' ? styles.typeBadgePersonal : styles.typeBadgeShared,
                      ]}>
                        <Text style={[
                          styles.typeBadgeText,
                          item.type === 'PERSONAL' ? styles.typeBadgeTextPersonal : styles.typeBadgeTextShared,
                        ]}>
                          {item.type === 'PERSONAL' ? 'Personal' : 'Shared'}
                        </Text>
                      </View>
                      {item.id === currentGroupId && (
                        <Icon name="checkmark" size={16} color={COLORS.primaryDark} />
                      )}
                    </View>
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
    borderRadius: RADIUS.sm,
  },
  triggerText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gray900,
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
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    ...SHADOWS.elevated,
    maxHeight: 300,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray900,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  typeBadgePersonal: {
    backgroundColor: COLORS.personalBadgeBg,
  },
  typeBadgeShared: {
    backgroundColor: COLORS.jointBadgeBg,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  typeBadgeTextPersonal: {
    color: COLORS.personalBadgeText,
  },
  typeBadgeTextShared: {
    color: COLORS.jointBadgeText,
  },
});
