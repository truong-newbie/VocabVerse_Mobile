import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { theme } from '@/theme';

interface IconButtonProps {
  name: IconName;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

const SIZE = {
  sm: { hit: 32, icon: 16 },
  md: { hit: 40, icon: 20 },
  lg: { hit: 48, icon: 24 },
} as const;

export function IconButton({
  name,
  onPress,
  size = 'md',
  color,
  accessibilityLabel,
  style,
  disabled = false,
}: IconButtonProps) {
  const dims = SIZE[size];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? name}
      android_ripple={{ color: theme.colors.surface, borderless: true }}
      style={({ pressed }) => [
        styles.hit,
        { width: dims.hit, height: dims.hit, borderRadius: dims.hit / 2 },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Icon name={name} size={dims.icon} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
});
