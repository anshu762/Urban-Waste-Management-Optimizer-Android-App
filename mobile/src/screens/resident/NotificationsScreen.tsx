import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getMyNotifications, markAsRead } from '../../api/notification.api';
import { format, parseISO } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const NotificationsScreen = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => getMyNotifications(page),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data?.notifications || [];

  const renderItem = ({ item }: { item: any }) => {
    const unread = !item.isRead;
    return (
      <TouchableOpacity
        style={[styles.cell, unread && styles.cellUnread]}
        onPress={() => unread && markReadMutation.mutate(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconTile, unread ? styles.iconTileUnread : styles.iconTileRead]}>
          <Ionicons name="notifications" size={20} color={unread ? '#059669' : '#94A3B8'} />
        </View>
        <View style={styles.cellBody}>
          <View style={styles.titleRow}>
            <Text style={[styles.itemTitle, unread && styles.itemTitleUnread]} numberOfLines={2}>
              {item.title}
            </Text>
            {unread ? <View style={[styles.unreadDot, { marginLeft: 8 }]} /> : null}
          </View>
          <Text style={styles.itemBody} numberOfLines={3}>
            {item.body}
          </Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.timeText}>{format(parseISO(item.createdAt), 'MMM d, h:mm a')}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#E2E8F0" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {isLoading && page === 1 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0F172A" />
          <View style={styles.skeletonCol}>
            <LoadingSkeleton height={88} borderRadius={20} />
            <View style={{ height: 12 }} />
            <LoadingSkeleton height={88} borderRadius={20} />
            <View style={{ height: 12 }} />
            <LoadingSkeleton height={88} borderRadius={20} />
          </View>
        </View>
      ) : isError ? (
        <View style={styles.errorPad}>
          <ErrorCard error={parseError(error)} onRetry={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={() => refetch()} tintColor="#00A36C" />
          }
          ListEmptyComponent={
            <EmptyState
              emoji=""
              title="You're all caught up"
              subtitle="Pickup reminders and service updates will show here."
            />
          }
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          onEndReached={() => {
            if (data?.data?.pagination?.totalPages > page) {
              setPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <View style={styles.footerLoad}>
                <ActivityIndicator size="small" color="#0F172A" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingBox: { flex: 1, paddingTop: 24, alignItems: 'center' },
  skeletonCol: { marginTop: 24, paddingHorizontal: 16, width: '100%' },
  errorPad: { flex: 1, padding: 16, justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  cell: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cellUnread: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconTileUnread: { backgroundColor: '#D1FAE5' },
  iconTileRead: { backgroundColor: '#F8FAFC' },
  cellBody: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#475569', lineHeight: 20 },
  itemTitleUnread: { fontWeight: '800', color: '#0F172A' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginTop: 6,
  },
  itemBody: { fontSize: 13, color: '#64748B', lineHeight: 19, marginTop: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  timeText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  sep: { height: 10 },
  footerLoad: { paddingVertical: 20, alignItems: 'center' },
});
