import {Platform, ViewStyle} from 'react-native';

export const COLORS = {
  // Primary
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  accent: '#5B9FFF',
  purple: '#9333EA',

  // Asset types
  personal: '#E91E63',
  joint: '#2196F3',

  // Badge
  personalBadgeBg: '#FCE7F3',
  personalBadgeText: '#BE185D',
  jointBadgeBg: '#DBEAFE',
  jointBadgeText: '#1D4ED8',

  // Calendar
  todayRing: '#F472B6',
  focusedRing: '#FB923C',
  focusedBg: '#FFF7ED',

  // Semantic
  income: '#16A34A',
  expense: '#DC2626',
  danger: '#EF4444',
  warning: '#F59E0B',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',
};

export const GRADIENTS = {
  primary: {
    colors: ['#3B82F6', '#9333EA'] as const,
    start: {x: 0, y: 0},
    end: {x: 1, y: 0},
  },
  primarySubtle: {
    colors: ['#EFF6FF', '#F5F3FF'] as const,
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  landing: {
    colors: ['#3B82F6', '#7C3AED', '#9333EA'] as const,
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
  totalAssets: {
    colors: ['#3B82F6', '#9333EA'] as const,
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  hero: 30,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SHADOWS: Record<string, ViewStyle> = {
  card: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  }) as ViewStyle,
  elevated: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }) as ViewStyle,
};
