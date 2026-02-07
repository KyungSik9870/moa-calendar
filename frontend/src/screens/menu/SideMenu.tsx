import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { GroupResponse } from '../../types/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

interface SideMenuProps {
  onClose: () => void;
  currentGroup: GroupResponse | undefined;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function SideMenu({ onClose, currentGroup, navigation }: SideMenuProps) {
  const menuItems = [
    { label: '프로필 편집', icon: 'person-outline' as const, route: 'ProfileEdit' as const },
  ];

  const groupMenuItems = currentGroup
    ? [
        { label: '캘린더 관리', icon: 'settings-outline' as const, route: 'CalendarManagement' as const, params: { groupId: currentGroup.id } },
        { label: '멤버 초대', icon: 'person-add-outline' as const, route: 'MemberInvite' as const, params: { groupId: currentGroup.id } },
        { label: '멤버 목록', icon: 'people-outline' as const, route: 'MemberList' as const, params: { groupId: currentGroup.id } },
        { label: '카테고리 관리', icon: 'pricetag-outline' as const, route: 'CategoryManagement' as const, params: { groupId: currentGroup.id } },
        { label: '앱 설정', icon: 'options-outline' as const, route: 'AppSettings' as const, params: { groupId: currentGroup.id } },
      ]
    : [];

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      <View style={styles.menu}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>메뉴</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Current Group */}
        {currentGroup && (
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{currentGroup.name}</Text>
            <Text style={styles.groupType}>
              {currentGroup.type === 'PERSONAL' ? '개인 캘린더' : '공유 캘린더'}
            </Text>
          </View>
        )}

        {/* Menu Items */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              onClose();
              navigation.navigate(item.route);
            }}
          >
            <Icon name={item.icon} size={20} color="#4B5563" />
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {groupMenuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              onClose();
              navigation.navigate(item.route, item.params);
            }}
          >
            <Icon name={item.icon} size={20} color="#4B5563" />
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    width: 280,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  groupInfo: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  groupType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 15,
    color: '#374151',
  },
});
