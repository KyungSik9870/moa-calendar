import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
