import React from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, GRADIENTS, RADIUS, SHADOWS} from '../../constants/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, SHADOWS.elevated]}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            {variant === 'danger' ? (
              <TouchableOpacity style={styles.dangerButton} onPress={onConfirm} activeOpacity={0.8}>
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onConfirm} activeOpacity={0.8} style={styles.confirmWrapper}>
                <LinearGradient
                  colors={[...GRADIENTS.primary.colors]}
                  start={GRADIENTS.primary.start}
                  end={GRADIENTS.primary.end}
                  style={styles.confirmButton}>
                  <Text style={styles.confirmText}>{confirmLabel}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: COLORS.gray600,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  confirmWrapper: {
    flex: 1,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  dangerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
