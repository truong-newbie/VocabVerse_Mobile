import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { theme } from '@/theme';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyMedium'
  | 'small'
  | 'smallMedium'
  | 'caption'
  | 'overline';

type Color = 'primary' | 'secondary' | 'muted' | 'inverse' | 'danger' | 'success';

interface Props extends TextProps {
  variant?: Variant;
  color?: Color;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle | TextStyle[];
}

export function Text({
  variant = 'body',
  color = 'primary',
  align,
  style,
  children,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[
        theme.typography[variant],
        { color: textColor[color], textAlign: align },
        style as TextStyle,
      ]}
    >
      {children}
    </RNText>
  );
}

const textColor: Record<Color, string> = {
  primary: theme.colors.textPrimary,
  secondary: theme.colors.textSecondary,
  muted: theme.colors.textMuted,
  inverse: theme.colors.textInverse,
  danger: theme.colors.danger,
  success: theme.colors.success,
};