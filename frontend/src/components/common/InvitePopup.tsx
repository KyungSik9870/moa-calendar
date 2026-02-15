import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from '../../constants/theme';
import type { InviteResponse } from '../../types/api';

interface InvitePopupProps {
  invite: InviteResponse;
  onAccept: () => void;
  onReject: () => void;
}

export default function InvitePopup({ invite, onAccept, onReject }: InvitePopupProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <View style={styles.content}>
          <Text style={styles.text}>
            <Text style={styles.bold}>{invite.inviter_nickname}</Text>님이
          </Text>
          <Text style={styles.text}>
            &apos;<Text style={styles.calendarName}>{invite.group_name}</Text>&apos;
            캘린더에
          </Text>
          <Text style={styles.text}>초대했습니다.</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <Text style={styles.rejectText}>거절</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onAccept} activeOpacity={0.8} style={styles.acceptWrapper}>
            <LinearGradient
              colors={[...GRADIENTS.primary.colors]}
              start={GRADIENTS.primary.start}
              end={GRADIENTS.primary.end}
              style={styles.acceptButton}>
              <Text style={styles.acceptText}>수락</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  popup: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.elevated,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  text: {
    fontSize: 18,
    marginBottom: 4,
    color: COLORS.gray900,
  },
  bold: {
    fontWeight: '700',
  },
  calendarName: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  rejectText: {
    fontWeight: '500',
    color: COLORS.gray700,
  },
  acceptWrapper: {
    flex: 1,
  },
  acceptButton: {
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  acceptText: {
    fontWeight: '500',
    color: COLORS.white,
  },
});
