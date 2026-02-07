import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
            <Text style={styles.bold}>{invite.inviter_name}</Text>님이
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
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptText}>수락</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  text: {
    fontSize: 18,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
  calendarName: {
    fontWeight: '700',
    color: '#2563EB',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectText: {
    fontWeight: '500',
    color: '#374151',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptText: {
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
