import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { schedulesApi } from '../../api/schedules';
import { SCHEDULE_CATEGORIES, REPEAT_OPTIONS } from '../../constants/colors';
import { COLORS, RADIUS } from '../../constants/theme';
import { useQueryClient } from '@tanstack/react-query';
import DropdownSelect from '../../components/common/DropdownSelect';

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
          placeholderTextColor={COLORS.gray400}
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
              placeholderTextColor={COLORS.gray400}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>종료</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="20:00"
              placeholderTextColor={COLORS.gray400}
            />
          </View>
        </>
      )}

      {/* Category - Dropdown */}
      <View style={styles.field}>
        <Text style={styles.label}>카테고리</Text>
        <DropdownSelect
          options={SCHEDULE_CATEGORIES}
          selectedValue={category}
          onSelect={setCategory}
          placeholder="카테고리 선택"
        />
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

      {/* Repeat - Dropdown */}
      <View style={styles.field}>
        <Text style={styles.label}>반복</Text>
        <DropdownSelect
          options={REPEAT_OPTIONS}
          selectedValue={repeatType}
          onSelect={setRepeatType}
          placeholder="반복 설정"
        />
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

export default ScheduleForm;

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
  readOnly: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.gray50,
  },
  readOnlyText: {
    fontSize: 16,
    color: COLORS.gray700,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray300,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
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
