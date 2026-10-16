import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  padded?: boolean;
  style?: ViewStyle;
}

export function Card({ children, onPress, padded = true, style }: CardProps) {
  const content = (
    <View style={[styles.base, padded ? styles.padded : null, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: theme.colors.surface }}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  padded: { padding: theme.spacing.base },
  pressed: { opacity: 0.9 },
});
