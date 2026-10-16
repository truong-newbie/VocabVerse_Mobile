import { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' } as TextStyle,
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' } as TextStyle,
  h2: { fontSize: 22, lineHeight: 30, fontWeight: '600' } as TextStyle,
  h3: { fontSize: 18, lineHeight: 26, fontWeight: '600' } as TextStyle,
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' } as TextStyle,
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' } as TextStyle,
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' } as TextStyle,
  smallMedium: { fontSize: 14, lineHeight: 20, fontWeight: '500' } as TextStyle,
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' } as TextStyle,
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,
} as const;