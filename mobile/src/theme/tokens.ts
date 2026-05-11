export const tokens = {
  colors: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    border: '#F1F5F9',
    borderStrong: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',
    textSubtle: '#94A3B8',
    placeholder: '#CBD5E1',
    brand: '#10B981',
    brandSoft: '#ECFDF5',
    brandBorder: '#D1FAE5',
    danger: '#EF4444',
  },
  radius: {
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
  control: {
    heightLg: 60,
    heightMd: 56,
  },
  shadow: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
  },
} as const;
