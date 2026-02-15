import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

type FilterType = 'all' | 'me' | 'joint';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  isSharedGroup: boolean;
}

export default function FilterBar({ activeFilter, onFilterChange, isSharedGroup }: FilterBarProps) {
  const filters: { key: FilterType; label: string; showOnlyShared?: boolean }[] = [
    { key: 'all', label: 'All' },
    { key: 'me', label: 'Me' },
    { key: 'joint', label: 'Joint', showOnlyShared: true },
  ];

  return (
    <View style={styles.container}>
      {filters.map((f) => {
        if (f.showOnlyShared && !isSharedGroup) return null;
        const isActive = activeFilter === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onFilterChange(f.key)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  chipTextActive: {
    color: COLORS.white,
  },
});
