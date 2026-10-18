import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Input, Screen, Switch, Text } from '@/components/ui';
import { useToast } from '@/hooks';
import { useSettingsStore, type ThemeMode } from '@/stores';
import { theme } from '@/theme';
import type { UserLocale } from '@/types';

const LOCALES: { value: UserLocale; label: string }[] = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' },
  { value: 'system', label: 'Theo hệ thống' },
];

function isValidHHmm(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function SettingsScreen() {
  const toast = useToast();
  const settings = useSettingsStore();
  const [reminderDraft, setReminderDraft] = useState(
    settings.dailyReminderAt ?? '20:00'
  );

  const onSaveReminder = () => {
    if (!isValidHHmm(reminderDraft)) {
      toast.error('Định dạng HH:mm (ví dụ 20:00)');
      return;
    }
    settings.setDailyReminderAt(reminderDraft);
    toast.success('Đã lưu giờ nhắc');
  };

  const onClearReminder = () => {
    setReminderDraft('20:00');
    settings.setDailyReminderAt(null);
    toast.success('Đã tắt nhắc hằng ngày');
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Text variant="h1">Cài đặt</Text>
          <Text variant="caption" color="muted">
            Tùy chọn này được lưu cục bộ trên thiết bị.
          </Text>
        </View>

        <Card style={styles.sectionCard}>
          <Text variant="overline" color="muted">
            Ngôn ngữ
          </Text>
          <View style={styles.chipsRow}>
            {LOCALES.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => settings.setLocale(opt.value)}
                style={({ pressed }) => [
                  styles.chip,
                  settings.locale === opt.value ? styles.chipActive : null,
                  pressed ? styles.chipPressed : null,
                ]}
              >
                <Text
                  variant="bodyMedium"
                  color={settings.locale === opt.value ? 'inverse' : 'primary'}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="overline" color="muted">
            Giao diện
          </Text>
          <View style={styles.chipsRow}>
            {THEMES.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => settings.setThemeMode(opt.value)}
                style={({ pressed }) => [
                  styles.chip,
                  settings.themeMode === opt.value ? styles.chipActive : null,
                  pressed ? styles.chipPressed : null,
                ]}
              >
                <Text
                  variant="bodyMedium"
                  color={settings.themeMode === opt.value ? 'inverse' : 'primary'}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text variant="overline" color="muted">
            Nhắc hằng ngày
          </Text>
          <Input
            label="Giờ (HH:mm)"
            value={reminderDraft}
            onChangeText={setReminderDraft}
            placeholder="20:00"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
          />
          <View style={styles.rowGap}>
            <Button title="Lưu giờ nhắc" onPress={onSaveReminder} />
            <Button title="Tắt nhắc" variant="secondary" onPress={onClearReminder} />
          </View>
          <Text variant="caption" color="muted">
            Hiện tại: {settings.dailyReminderAt ?? 'Tắt'}
          </Text>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text variant="bodyMedium">Âm thanh khi chấm điểm</Text>
              <Text variant="caption" color="muted">
                Bật để có phản hồi âm thanh khi lật flashcard.
              </Text>
            </View>
            <Switch
              value={settings.soundOn}
              onValueChange={settings.setSoundOn}
            />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  heroBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
  sectionCard: { padding: theme.spacing.base, gap: theme.spacing.sm },
  chipsRow: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipPressed: { opacity: 0.8 },
  rowGap: { gap: theme.spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  switchText: { flex: 1, gap: theme.spacing.xxs },
});
