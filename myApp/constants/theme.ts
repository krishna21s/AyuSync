/**
 * AyuSync Design System — Colors, Fonts, Glass, Tokens
 */

import { Platform, ViewStyle } from 'react-native';

/* ───── Brand palette ───── */
export const Brand = {
  primary: '#C8FF00',
  primaryForeground: '#1A1A2E',
  primaryMuted: 'rgba(200,255,0,0.15)',
  primaryGlow: 'rgba(200,255,0,0.25)',
  cardDark: '#212122ff',
  cardDarkBorder: '#282828',
  cardWhite: '#FFFFFF',
  cardWhiteBorder: '#F3F4F6',
  background: '#09090B', // True dark neutral background
  // text
  gray900: '#FFFFFF', // Inverted (White)
  gray700: '#EAEAEA', // Light Gray
  gray600: '#CCCCCC', // Inverted
  gray500: '#999999', // Middle
  gray400: '#666666', // Inverted
  gray300: '#3A3A3C', // Deep dark gray
  gray200: '#2C2C2E', // Even darker gray
  gray100: '#1A1A1A', // Neutral True Gray
  gray50: '#111111',  // Almost black
  white: '#FFFFFF',
  // status
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green500: '#22C55E',
  green600: '#16A34A',
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red500: '#EF4444',
  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange500: '#F97316',
  orange700: '#C2410C',
  // tab bar
  tabBarBg: '#1A1A2E',
  tabInactive: 'rgba(255,255,255,0.35)',
  tabActive: '#C8FF00',
};

/* ───── Spacing ───── */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/* ───── Radius ───── */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

/* ───── Shadows ───── */
export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    default: { elevation: 1 },
  }) as ViewStyle,
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    default: { elevation: 3 },
  }) as ViewStyle,
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    default: { elevation: 6 },
  }) as ViewStyle,
  glow: Platform.select({
    ios: {
      shadowColor: '#C8FF00',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    default: { elevation: 8 },
  }) as ViewStyle,
};

/* ───── Glassmorphism Card Styles ───── */
export const Glass = {
  light: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.xl,
  } as ViewStyle,
  dark: {
    backgroundColor: 'rgba(20,20,35,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.xl,
  } as ViewStyle,
  frosted: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.xl,
  } as ViewStyle,
};

/* ───── Existing Colors (kept for backwards compat) ───── */
export const Colors = {
  light: {
    text: Brand.gray900,
    background: Brand.background,
    tint: Brand.primary,
    icon: Brand.gray500,
    tabIconDefault: Brand.tabInactive,
    tabIconSelected: Brand.tabActive,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
