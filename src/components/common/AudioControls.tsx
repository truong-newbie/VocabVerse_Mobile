import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useAudioPlayer } from '@/hooks';
import { theme } from '@/theme';

interface AudioControlsProps {
  /** Audio URL; when null/undefined, the controls render disabled. */
  source: string | null | undefined;
  /** Optional label below the button. */
  label?: string;
  /** Style applied to the outer wrapper. */
  style?: object;
}

export function AudioControls({ source, label, style }: AudioControlsProps) {
  const audio = useAudioPlayer(source);
  const disabled = !source;
  const progress =
    audio.durationMs > 0
      ? Math.min(1, audio.positionMs / audio.durationMs)
      : 0;

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.row}>
        <Pressable
          onPress={audio.isPlaying ? audio.pause : audio.play}
          disabled={disabled}
          style={({ pressed }) => [
            styles.playBtn,
            disabled ? styles.playBtnDisabled : null,
            pressed ? styles.playBtnPressed : null,
          ]}
        >
          <Text variant="bodyMedium" color="inverse">
            {audio.isLoading ? '…' : audio.isPlaying ? '❚❚' : '▶'}
          </Text>
        </Pressable>
        <View style={styles.progressArea}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
              ]}
            />
          </View>
          <View style={styles.timeRow}>
            <Text variant="caption" color="muted">
              {formatTime(audio.positionMs)}
            </Text>
            <Text variant="caption" color="muted">
              {formatTime(audio.durationMs)}
            </Text>
          </View>
        </View>
      </View>
      {label ? (
        <Text variant="small" color="muted" align="center" style={styles.label}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

function formatTime(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  wrapper: { gap: theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnPressed: { opacity: 0.8 },
  playBtnDisabled: { backgroundColor: theme.colors.surface },
  progressArea: { flex: 1, gap: theme.spacing.xxs },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: theme.colors.primary },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { marginTop: theme.spacing.xs },
});
