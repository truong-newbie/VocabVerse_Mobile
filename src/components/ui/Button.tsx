import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const containerStyle: ViewStyle = {
    ...styles.base,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(fullWidth ? styles.fullWidth : null),
    ...(isDisabled ? styles.disabled : null),
    ...(style ?? {}),
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
      android_ripple={{ color: theme.colors.primaryDark }}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? theme.colors.primary : theme.colors.textInverse}
        />
      ) : (
        <Text style={[styles.text, textSizeStyles[size], textVariantStyles[variant]]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { ...theme.typography.bodyMedium },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
  md: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg },
  lg: { paddingVertical: theme.spacing.base, paddingHorizontal: theme.spacing.xl },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: theme.colors.primary },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: theme.colors.danger },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: theme.colors.textInverse },
  secondary: { color: theme.colors.textPrimary },
  ghost: { color: theme.colors.primary },
  danger: { color: theme.colors.textInverse },
});