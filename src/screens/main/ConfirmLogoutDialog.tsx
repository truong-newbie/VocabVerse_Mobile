import { Button, Modal, Text } from '@/components/ui';
import { theme } from '@/theme';
import { StyleSheet, View } from 'react-native';

interface ConfirmLogoutDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

/**
 * Reusable confirm dialog for the logout flow. We expose it as
 * its own component so ProfileScreen (or any other screen) can
 * just toggle visibility, and so the test surface focuses on
 * rendering rather than the auth wiring.
 */
export function ConfirmLogoutDialog({
  visible,
  onConfirm,
  onCancel,
  isPending,
}: ConfirmLogoutDialogProps) {
  return (
    <Modal visible={visible} onClose={onCancel} title="Đăng xuất?">
      <View style={styles.body}>
        <Text variant="body" color="secondary">
          Bạn sẽ cần đăng nhập lại để tiếp tục dùng VocabVerse. Các từ
          vựng đã đồng bộ với máy chủ sẽ được giữ nguyên.
        </Text>
        <View style={styles.actions}>
          <Button
            title="Hủy"
            variant="secondary"
            onPress={onCancel}
            disabled={isPending}
            fullWidth
          />
          <Button
            title="Đăng xuất"
            variant="danger"
            onPress={onConfirm}
            isLoading={isPending}
            disabled={isPending}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: { padding: theme.spacing.base, gap: theme.spacing.base },
  actions: { gap: theme.spacing.md },
});
