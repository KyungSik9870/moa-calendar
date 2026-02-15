import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, GRADIENTS, RADIUS } from '../../constants/theme';
import { USER_COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import type { GroupResponse } from '../../types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

interface SideMenuProps {
  onClose: () => void;
  currentGroup: GroupResponse | undefined;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function SideMenu({ onClose, currentGroup, navigation }: SideMenuProps) {
  const { user, logout } = useAuthStore();
  const initial = user?.nickname?.charAt(0) || '?';
  const colorName = USER_COLORS.find(c => c.value === user?.color_code)?.name || '';

  const navigate = (route: keyof RootStackParamList, params?: Record<string, number>) => {
    onClose();
    if (params) {
      navigation.navigate(route as 'CalendarManagement', params as { groupId: number });
    } else {
      navigation.navigate(route as 'ProfileEdit');
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      <TouchableOpacity style={styles.menu} activeOpacity={1} onPress={() => {}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Close Button */}
          <View style={styles.closeRow}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.gray900} />
            </TouchableOpacity>
          </View>

          {/* Avatar + User Info */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={[...GRADIENTS.primary.colors]}
              start={GRADIENTS.primary.start}
              end={GRADIENTS.primary.end}
              style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.nickname || ''}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              {colorName ? (
                <View style={styles.colorRow}>
                  <View style={[styles.colorDot, { backgroundColor: user?.color_code }]} />
                  <Text style={styles.colorName}>{colorName}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Profile Edit */}
          <TouchableOpacity style={styles.menuItem} onPress={() => navigate('ProfileEdit')}>
            <View style={styles.menuItemLeft}>
              <Icon name="person-outline" size={20} color={COLORS.gray600} />
              <Text style={styles.menuItemText}>프로필 수정</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={COLORS.gray400} />
          </TouchableOpacity>

          {/* Current Group */}
          {currentGroup && (
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{currentGroup.name}</Text>
              <Text style={styles.groupType}>
                {currentGroup.type === 'PERSONAL' ? '개인 캘린더' : '공유 캘린더'}
              </Text>
            </View>
          )}

          {/* Calendar Management Section */}
          {currentGroup && (
            <>
              <Text style={styles.sectionLabel}>캘린더 관리</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate('CalendarManagement', { groupId: currentGroup.id })}>
                <View style={styles.menuItemLeft}>
                  <Icon name="settings-outline" size={20} color={COLORS.gray600} />
                  <Text style={styles.menuItemText}>캘린더 관리</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={COLORS.gray400} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate('MemberInvite', { groupId: currentGroup.id })}>
                <View style={styles.menuItemLeft}>
                  <Icon name="person-add-outline" size={20} color={COLORS.gray600} />
                  <Text style={styles.menuItemText}>멤버 초대</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={COLORS.gray400} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate('MemberList', { groupId: currentGroup.id })}>
                <View style={styles.menuItemLeft}>
                  <Icon name="people-outline" size={20} color={COLORS.gray600} />
                  <Text style={styles.menuItemText}>멤버 목록</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={COLORS.gray400} />
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>앱 설정</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate('AppSettings', { groupId: currentGroup.id })}>
                <View style={styles.menuItemLeft}>
                  <Icon name="options-outline" size={20} color={COLORS.gray600} />
                  <Text style={styles.menuItemText}>가계부 시작일</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <Text style={styles.menuItemValue}>{currentGroup.budget_start_day || 1}일</Text>
                  <Icon name="chevron-forward" size={18} color={COLORS.gray400} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate('CategoryManagement', { groupId: currentGroup.id })}>
                <View style={styles.menuItemLeft}>
                  <Icon name="pricetag-outline" size={20} color={COLORS.gray600} />
                  <Text style={styles.menuItemText}>카테고리 관리</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={COLORS.gray400} />
              </TouchableOpacity>
            </>
          )}

          {/* Bottom Items */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.bottomItem} onPress={handleLogout}>
              <Icon name="log-out-outline" size={20} color={COLORS.gray500} />
              <Text style={styles.bottomItemText}>로그아웃</Text>
            </TouchableOpacity>
            <View style={styles.bottomItem}>
              <Icon name="information-circle-outline" size={20} color={COLORS.gray500} />
              <Text style={styles.bottomItemText}>앱 정보 v1.0.0</Text>
            </View>
          </View>
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  menu: {
    width: 300,
    backgroundColor: COLORS.white,
    paddingTop: 60,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  colorName: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  groupInfo: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.xl,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  groupType: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuItemValue: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  bottomSection: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: 4,
  },
  bottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  bottomItemText: {
    fontSize: 14,
    color: COLORS.gray500,
  },
});
