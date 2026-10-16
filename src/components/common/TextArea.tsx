import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { theme } from '@/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  minHeight?: number;
}

export function TextArea({
  label,
  error,
  hint,
  style,
  minHeight = 100,
  ...rest
}: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="smallMedium" color="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        multiline
        textAlignVertical="top"
        placeholderTextColor={theme.colors.textMuted}
        {...rest}
        style={[styles.input, { minHeight }, error ? styles.inputError : null, style]}
      />
      {error ? (
        <Text variant="caption" color="danger" style={styles.helper}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="muted" style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: theme.spacing.xs },
  label: { marginBottom: theme.spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 16,
    backgroundColor: theme.colors.bg,
  },
  inputError: { borderColor: theme.colors.danger },
  helper: { marginTop: theme.spacing.xs },
});
