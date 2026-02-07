import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { schedulesApi } from '../../api/schedules';
import { SCHEDULE_CATEGORIES, REPEAT_OPTIONS } from '../../constants/colors';
import { useQueryClient } from '@tanstack/react-query';

interface ScheduleFormProps {
  selectedDate: Date;
  groupId: number;
}

const ScheduleForm = forwardRef(({ selectedDate, groupId }: ScheduleFormProps, ref) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:00');
  const [category, setCategory] = useState('APPOINTMENT');
  const [assetType, setAssetType] = useState<'PERSONAL' | 'JOINT'>('PERSONAL');
  const [repeatType, setRepeatType] = useState('NONE');
  const [memo, setMemo] = useState('');

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!title.trim()) {
        Alert.alert('오류', '제목을 입력해주세요');
        return false;
      }
      try {
        await schedulesApi.create(groupId, {
          title,
          start_date: format(selectedDate, 'yyyy-MM-dd'),
          is_all_day: isAllDay,
          start_time: isAllDay ? undefined : startTime,
          end_time: isAllDay ? undefined : endTime,
          asset_type: assetType,
          category,
          memo: memo || undefined,
          repeat_type: repeatType,
        });
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
        return true;
      } catch {
        Alert.alert('오류', '일정 저장에 실패했습니다');
        return false;
      }
    },
  }));

  const dateLabel = format(selectedDate, 'M월 d일 EEEE', { locale: ko });

  return (
    <View style={styles.form}>
      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="일정 제목"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Date (read-only) */}
      <View style={styles.field}>
        <Text style={styles.label}>날짜</Text>
        <View style={styles.readOnly}>
          <Text style={styles.readOnlyText}>{dateLabel}</Text>
        </View>
      </View>

      {/* All Day Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.label}>종일</Text>
        <TouchableOpacity
          style={[styles.toggle, isAllDay && styles.toggleActive]}
          onPress={() => setIsAllDay(!isAllDay)}
        >
          <View style={[styles.toggleThumb, isAllDay && styles.toggleThumbActive]} />
        </TouchableOpacity>
      </View>

      {/* Time Inputs */}
      {!isAllDay && (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>시작</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="19:00"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>종료</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="20:00"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </>
      )}

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>카테고리</Text>
        <View style={styles.chipRow}>
          {SCHEDULE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                category === cat.value && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat.value && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Type Toggle */}
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

      {/* Repeat */}
      <View style={styles.field}>
        <Text style={styles.label}>반복</Text>
        <View style={styles.chipRow}>
          {REPEAT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.categoryChip,
                repeatType === opt.value && styles.categoryChipActive,
              ]}
              onPress={() => setRepeatType(opt.value)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  repeatType === opt.value && styles.categoryChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
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

export default ScheduleForm;

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
  readOnly: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#374151',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#3B82F6',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  categoryChipActive: {
    backgroundColor: '#DBEAFE',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#4B5563',
  },
  categoryChipTextActive: {
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
