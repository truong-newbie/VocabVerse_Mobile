import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/ui/Text';
import { theme } from '@/theme';

export type ChipVariant = 'filled' | 'outline';
export type ChipColor = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  color?: ChipColor;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const COLOR_BG: Record<ChipColor, string> = {
  primary: theme.colors.primary,
  secondary: theme.colors.surface,
  neutral: theme.colors.bgMuted,
  success: theme.colors.success,
  warning: theme.colors.warning,
  danger: theme.colors.danger,
};

const COLOR_BORDER: Record<ChipColor, string> = {
  primary: theme.colors.primary,
  secondary: theme.colors.border,
  neutral: theme.colors.border,
  success: theme.colors.success,
  warning: theme.colors.warning,
  danger: theme.colors.danger,
};

const COLOR_TEXT: Record<ChipColor, string> = {
  primary: theme.colors.textInverse,
  secondary: theme.colors.textPrimary,
  neutral: theme.colors.textPrimary,
  success: theme.colors.textInverse,
  warning: theme.colors.textInverse,
  danger: theme.colors.textInverse,
};

export function Chip({
  label,
  variant = 'filled',
  color = 'neutral',
  selected = false,
  onPress,
  style,
}: ChipProps) {
  const isOutlined = variant === 'outline';
  const backgroundColor = selected
    ? isOutlined
      ? 'transparent'
      : COLOR_BG[color]
    : isOutlined
      ? 'transparent'
      : COLOR_BG.neutral;

  const borderColor = selected
    ? COLOR_BORDER[color]
    : variant === 'outline'
      ? COLOR_BORDER[color]
      : 'transparent';

  const textColor = selected || !isOutlined ? COLOR_TEXT[color] : COLOR_BORDER[color];

  const inner = (
    <View
      style={[
        styles.base,
        { backgroundColor, borderColor },
        selected && styles.selected,
        style,
      ]}
    >
      <Text variant="smallMedium" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{inner}</Pressable>;
  }
  return inner;
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  selected: {
    borderWidth: 1.5,
  },
});
