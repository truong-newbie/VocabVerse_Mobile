import { Pressable, StyleSheet, View } from 'react-native';
import { theme } from '@/theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  /** Style applied to the track wrapper. */
  style?: object;
  /** Accessibility label. */
  accessibilityLabel?: string;
}

/**
 * Minimal native switcher: a 44x26 pill, the thumb animates
 * position via the Pressable. We intentionally avoid pulling in
 * a switch library — the inline component keeps the bundle slim
 * and the test surface tiny.
 */
export function Switch({ value, onValueChange, disabled, style, accessibilityLabel }: SwitchProps) {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={[
        styles.track,
        value ? styles.trackOn : styles.trackOff,
        disabled ? styles.trackDisabled : null,
        style,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
    >
      <View
        style={[
          styles.thumb,
          value ? styles.thumbOn : styles.thumbOff,
        ]}
      />
    </Pressable>
  );
}

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 22;

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  trackOn: { backgroundColor: theme.colors.primary },
  trackOff: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  trackDisabled: { opacity: 0.5 },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
  },
  thumbOn: { transform: [{ translateX: THUMB_SIZE - 4 }] },
  thumbOff: { transform: [{ translateX: 0 }] },
});
