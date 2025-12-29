// NexaWork Premium Design System
// A calm, modern, and professional aesthetic

export const theme = {
  colors: {
    // Primary palette - Deep Indigo
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#F5F3FF',

    // Accent - Vibrant violet
    accent: '#8B5CF6',
    accentLight: '#F5F3FF',

    // Success/Error states
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',

    // Neutrals - Sophisticated grays
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',

    // Text hierarchy
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    // Special
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(15, 23, 42, 0.5)',

    // Gradients
    gradientStart: '#4F46E5',
    gradientEnd: '#7C3AED',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    // Display - For hero sections
    display: {
      fontSize: 36,
      fontWeight: '800' as const,
      lineHeight: 44,
      letterSpacing: -1,
    },
    // Headings
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 28,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    // Body text
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    bodySemibold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    // Small text
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    captionMedium: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    smallMedium: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
    },
    // Button text
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
