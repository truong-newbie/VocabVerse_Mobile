import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { Card, ErrorState, Screen, Text } from '@/components/ui';
import { Chip, Icon, SectionHeader } from '@/components/common';
import { useApiQuery } from '@/hooks';
import { collectionApi } from '@/api';
import { formatDate, queryKeys } from '@/lib';
import { COLLECTION_VISIBILITY_LABELS } from '@/types/enums';
import { theme } from '@/theme';
import type { CollectionStackParamList, MainTabParamList } from '@/navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<CollectionStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();

  // Recent mine: fetch first page only (we only show 3)
  const recent = useApiQuery({
    key: queryKeys.collections({ q: '', mine: true, page: 0 }),
    queryFn: () => collectionApi.listMine(0, 3),
  });

  const publicList = useApiQuery({
    key: queryKeys.collections({ q: '', mine: false, publicPage: 0 }),
    queryFn: () => collectionApi.list(0, 5),
  });

  useEffect(() => {
    if (recent.isError) console.warn('recent collections load failed');
  }, [recent.isError]);

  const goTo = useCallback(
    (screen: keyof CollectionStackParamList, params?: object) => {
      navigation.navigate('Collections', { screen, params } as any);
    },
    [navigation]
  );

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshing={recent.isFetching || publicList.isFetching}
        onScrollEndDrag={() => {
          recent.refetch();
          publicList.refetch();
        }}
      >
        <View style={styles.headerBlock}>
          <Text variant="h1">Trang chủ</Text>
          <Text variant="body" color="secondary">
            Hôm nay học gì? Mình gợi ý vài bộ sưu tập nè.
          </Text>
        </View>

        <SectionHeader
          title="Bộ sưu tập gần đây"
          action={
            <Pressable onPress={() => navigation.navigate('Collections' as never)}>
              <Text variant="smallMedium" color="primary">
                Xem tất cả
              </Text>
            </Pressable>
          }
        />
        {recent.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : recent.isError ? (
          <ErrorState
            title="Không tải được bộ sưu tập"
            message={recent.error?.message}
            onRetry={recent.refetch}
          />
        ) : !recent.data || recent.data.items.length === 0 ? (
          <Card onPress={() => goTo('Collections')}>
            <Text variant="bodyMedium">Tạo bộ sưu tập đầu tiên</Text>
            <Text variant="small" color="muted">
              Bắt đầu bằng một bộ sưu tập mới ngay bây giờ.
            </Text>
          </Card>
        ) : (
          <View style={styles.recentList}>
            {recent.data.items.map(c => (
              <Card
                key={c.id}
                onPress={() => goTo('CollectionDetail', { collectionId: c.id })}
                style={styles.recentCard}
              >
                <View style={styles.recentHeader}>
                  <Text variant="bodyMedium">{c.title}</Text>
                  <Chip
                    label={COLLECTION_VISIBILITY_LABELS[c.visibility]}
                    color={c.visibility === 'PUBLIC' ? 'primary' : 'neutral'}
                    variant="outline"
                  />
                </View>
                {c.description ? (
                  <Text variant="caption" color="muted" numberOfLines={2}>
                    {c.description}
                  </Text>
                ) : null}
                <Text variant="caption" color="muted">
                  {c.totalWords} từ · cập nhật {formatDate(c.updatedAt)}
                </Text>
              </Card>
            ))}
          </View>
        )}

        <SectionHeader title="Công cụ" />
        <View style={styles.toolsRow}>
          <Pressable
            style={styles.toolCard}
            onPress={() => goTo('DictionarySearch')}
          >
            <Icon name="search" color={theme.colors.primary} />
            <Text variant="bodyMedium">Tra từ điển</Text>
            <Text variant="caption" color="muted">
              Tìm nhanh nghĩa + ví dụ
            </Text>
          </Pressable>
          <Pressable
            style={styles.toolCard}
            onPress={() => goTo('AiNormalize')}
          >
            <Icon name="sparkle" color={theme.colors.primary} />
            <Text variant="bodyMedium">AI Normalize</Text>
            <Text variant="caption" color="muted">
              Chuẩn hoá hàng loạt
            </Text>
          </Pressable>
        </View>

        <SectionHeader
          title="Bộ sưu tập công khai"
          description="Khám phá từ cộng đồng"
        />
        {publicList.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : publicList.isError ? (
          <ErrorState
            title="Không tải được danh sách"
            message={publicList.error?.message}
            onRetry={publicList.refetch}
          />
        ) : !publicList.data || publicList.data.items.length === 0 ? (
          <Card>
            <Text variant="body" color="muted">
              Hiện chưa có bộ sưu tập công khai nào.
            </Text>
          </Card>
        ) : (
          <View style={styles.publicList}>
            {publicList.data.items.map(c => (
              <Card
                key={c.id}
                onPress={() => goTo('CollectionDetail', { collectionId: c.id })}
                style={styles.publicCard}
              >
                <Text variant="bodyMedium">{c.title}</Text>
                <Text variant="caption" color="muted">
                  {c.totalWords} từ · {formatDate(c.updatedAt)}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  headerBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.md },
  center: { padding: theme.spacing.lg, alignItems: 'center' },
  recentList: { gap: theme.spacing.sm },
  recentCard: { padding: theme.spacing.md, gap: theme.spacing.xxs },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolsRow: { flexDirection: 'row', gap: theme.spacing.md },
  toolCard: {
    flex: 1,
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgElevated,
    gap: theme.spacing.xxs,
  },
  publicList: { gap: theme.spacing.sm },
  publicCard: { padding: theme.spacing.md, gap: theme.spacing.xxs },
});
