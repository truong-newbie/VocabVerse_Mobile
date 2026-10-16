import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, ErrorState, Input, LoadingScreen, Screen, Text } from '@/components/ui';
import { useApiMutation, useApiQuery, useToast } from '@/hooks';
import { roleplayApi } from '@/api';
import { theme } from '@/theme';
import type { RoleplayMessage, RoleplaySession } from '@/types';
import type { PracticeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'RoleplaySession'>;
type Nav = NativeStackNavigationProp<PracticeStackParamList, 'RoleplaySession'>;

export function RoleplaySessionScreen({ route }: Props) {
  const { sessionId } = route.params;
  const navigation = useNavigation<Nav>();
  const toast = useToast();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<RoleplayMessage>>(null);

  const session = useApiQuery({
    key: ['roleplay', 'session', sessionId],
    queryFn: () => roleplayApi.getSession(sessionId),
    refetchInterval: q => {
      // Only auto-refresh while the user is actively chatting; stop
      // when there's an unanswered user message.
      const s = q.state.data as RoleplaySession | undefined;
      if (!s) return false;
      const last = s.messages[s.messages.length - 1];
      return last?.sender === 'USER';
    },
  });

  const send = useApiMutation({
    mutationFn: (body: string) =>
      roleplayApi.sendMessage({ sessionId, text: body }),
    onSuccess: res => {
      setText('');
      // Use the latest server response to update the cache directly
      session.refetch();
    },
    onError: () => toast.error('Không gửi được tin nhắn'),
  });

  const end = useApiMutation({
    mutationFn: () => roleplayApi.endSession({ sessionId }),
    onSuccess: () => navigation.replace('RoleplayResult', { sessionId }),
    onError: () => navigation.replace('RoleplayResult', { sessionId }),
  });

  useEffect(() => {
    if (session.data?.messages?.length) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [session.data?.messages?.length]);

  if (session.isLoading) return <LoadingScreen />;
  if (session.isError) {
    return (
      <Screen>
        <ErrorState
          title="Không tải được phiên"
          message={session.error?.message}
          onRetry={session.refetch}
        />
      </Screen>
    );
  }

  const messages = session.data!.messages;
  const lastIsUser = messages[messages.length - 1]?.sender === 'USER';

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.composer}>
          {lastIsUser ? (
            <View style={styles.waitingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text variant="small" color="muted">
                Đang chờ AI trả lời...
              </Text>
            </View>
          ) : (
            <View style={styles.composerRow}>
              <View style={styles.composerInput}>
                <Input value={text} onChangeText={setText} placeholder="Nhập câu trả lời..." />
              </View>
              <Pressable
                onPress={() => text.trim() && send.mutate(text.trim())}
                style={({ pressed }) => [
                  styles.sendBtn,
                  pressed ? styles.sendBtnPressed : null,
                ]}
                disabled={!text.trim() || send.isPending}
              >
                <Text variant="bodyMedium" color="inverse">
                  Gửi
                </Text>
              </Pressable>
            </View>
          )}
          <Button
            title="Kết thúc phiên"
            variant="ghost"
            onPress={() => end.mutate()}
            isLoading={end.isPending}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function MessageBubble({ message }: { message: RoleplayMessage }) {
  const isUser = message.sender === 'USER';
  return (
    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
      <Text variant="body" color={isUser ? 'inverse' : 'primary'}>
        {message.text}
      </Text>
      {message.correction ? (
        <View style={styles.correction}>
          <Text variant="overline" color="muted">
            Gợi ý
          </Text>
          <Text variant="small" color="secondary">
            {message.correction}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { padding: theme.spacing.base, paddingBottom: theme.spacing.lg },
  bubble: {
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    maxWidth: '85%',
    gap: theme.spacing.xs,
  },
  bubbleUser: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: theme.radius.sm,
  },
  bubbleAi: {
    backgroundColor: theme.colors.bgElevated,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: theme.radius.sm,
  },
  correction: { borderTopWidth: 1, borderColor: theme.colors.border, paddingTop: theme.spacing.xs },
  sep: { height: theme.spacing.sm },
  composer: {
    padding: theme.spacing.base,
    backgroundColor: theme.colors.bg,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm },
  composerInput: { flex: 1 },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  sendBtnPressed: { opacity: 0.8 },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
});
