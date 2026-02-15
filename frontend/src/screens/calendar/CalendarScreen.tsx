import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import CalendarGrid from '../../components/calendar/CalendarGrid';
import DayDetailList from '../../components/calendar/DayDetailList';
import FilterBar from '../../components/calendar/FilterBar';
import CalendarSwitcher from '../../components/calendar/CalendarSwitcher';
import InputModal from '../schedule/InputModal';
import SideMenu from '../menu/SideMenu';
import InvitePopup from '../../components/common/InvitePopup';
import { COLORS } from '../../constants/theme';
import { useCalendarStore } from '../../store/calendarStore';
import { useAuthStore } from '../../store/authStore';
import { groupsApi } from '../../api/groups';
import { schedulesApi } from '../../api/schedules';
import { transactionsApi } from '../../api/transactions';
import { getMonthRange } from '../../utils/date';
import { useQuery } from '@tanstack/react-query';
import type { GroupResponse, InviteResponse } from '../../types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

export default function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const {
    selectedDate,
    currentMonth,
    focusedDate,
    selectedGroupId,
    filter,
    setSelectedDate,
    setCurrentMonth,
    setFocusedDate,
    setSelectedGroupId,
    setFilter,
  } = useCalendarStore();
  const { user } = useAuthStore();
  const [showInputModal, setShowInputModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [pendingInvite, setPendingInvite] = useState<InviteResponse | null>(null);

  const { startDate, endDate } = getMonthRange(currentMonth);

  // Fetch groups
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll(),
  });

  // Auto-select first group
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId, setSelectedGroupId]);

  const currentGroup = groups.find((g: GroupResponse) => g.id === selectedGroupId);
  const isSharedGroup = currentGroup?.type === 'SHARED';

  // Fetch schedules
  const filterUserId = filter === 'me' ? user?.id : undefined;
  const filterAssetType = filter === 'joint' ? 'JOINT' : undefined;

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules', selectedGroupId, startDate, endDate, filterUserId, filterAssetType],
    queryFn: () =>
      schedulesApi.getAll(selectedGroupId!, startDate, endDate, filterUserId, filterAssetType),
    enabled: !!selectedGroupId,
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', selectedGroupId, startDate, endDate],
    queryFn: () => transactionsApi.getAll(selectedGroupId!, startDate, endDate),
    enabled: !!selectedGroupId,
  });

  // Fetch pending invites
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pendingInvites'],
    queryFn: () => groupsApi.getPendingInvites(),
  });

  useEffect(() => {
    if (pendingInvites.length > 0 && !showInvitePopup) {
      setPendingInvite(pendingInvites[0]);
      setShowInvitePopup(true);
    }
  }, [pendingInvites, showInvitePopup]);

  // 2-tap interaction
  const handleDateClick = useCallback(
    (date: Date) => {
      if (focusedDate && date.getTime() === focusedDate.getTime()) {
        setShowInputModal(true);
      } else {
        setFocusedDate(date);
        setSelectedDate(date);
      }
    },
    [focusedDate, setFocusedDate, setSelectedDate],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <CalendarSwitcher
          groups={groups}
          currentGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId}
        />
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
          <Icon name="menu" size={24} color={COLORS.gray900} />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <FilterBar
        activeFilter={filter}
        onFilterChange={setFilter}
        isSharedGroup={isSharedGroup ?? false}
      />

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent}>
        <CalendarGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          focusedDate={focusedDate}
          schedules={schedules}
          transactions={transactions}
          onDateClick={handleDateClick}
          onMonthChange={setCurrentMonth}
        />
        <DayDetailList
          selectedDate={selectedDate}
          schedules={schedules}
          transactions={transactions}
          onAddClick={() => setShowInputModal(true)}
        />
      </ScrollView>

      {/* Input Modal */}
      <Modal visible={showInputModal} animationType="slide" transparent>
        <InputModal
          selectedDate={selectedDate}
          groupId={selectedGroupId!}
          schedules={schedules}
          onClose={() => setShowInputModal(false)}
        />
      </Modal>

      {/* Side Menu */}
      <Modal visible={showMenu} animationType="fade" transparent>
        <SideMenu
          onClose={() => setShowMenu(false)}
          currentGroup={currentGroup}
          navigation={navigation}
        />
      </Modal>

      {/* Invite Popup */}
      {showInvitePopup && pendingInvite && (
        <Modal visible={showInvitePopup} animationType="fade" transparent>
          <InvitePopup
            invite={pendingInvite}
            onAccept={async () => {
              await groupsApi.acceptInvite(pendingInvite.id);
              setShowInvitePopup(false);
              setPendingInvite(null);
            }}
            onReject={async () => {
              await groupsApi.rejectInvite(pendingInvite.id);
              setShowInvitePopup(false);
              setPendingInvite(null);
            }}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
});
