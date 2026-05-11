import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getMyNotifications, markAsRead } from '../../api/notification.api';
import { format, parseISO } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminNotificationsScreen = ({ navigation }: any) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => getMyNotifications(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination && pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.pages?.flatMap((p) => p?.data?.notifications || []) || [];

  const formatTimestamp = (iso: string) => {
    try {
      const d = parseISO(iso);
      return format(d, 'MMM d, h:mm a');
    } catch {
      return iso;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.notifItem, !item.isRead && styles.unreadItem]}
      onPress={() => {
        if (!item.isRead) markReadMutation.mutate(item.id);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.notifIconBox, !item.isRead ? styles.unreadIconBox : styles.readIconBox]}>
        <Ionicons
          name={!item.isRead ? 'notifications' : 'notifications-outline'}
          size={20}
          color={!item.isRead ? '#10B981' : '#94A3B8'}
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{formatTimestamp(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ padding: 20, gap: 12 }}>
          <LoadingSkeleton height={72} borderRadius={16} />
          <LoadingSkeleton height={72} borderRadius={16} />
          <LoadingSkeleton height={72} borderRadius={16} />
        </View>
      ) : isError ? (
        <ErrorCard error={parseError(error)} onRetry={refetch} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={() => refetch()}
              tintColor="#10B981"
            />
          }
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#10B981" style={{ padding: 16 }} />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              emoji=""
              title="No Notifications"
              subtitle="You're all caught up! New notifications will appear here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  listContent: { padding: 16, paddingBottom: 32 },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  unreadItem: {
    backgroundColor: '#F0FDF9',
    borderColor: '#A7F3D0',
  },
  notifIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  unreadIconBox: { backgroundColor: '#ECFDF5' },
  readIconBox: { backgroundColor: '#F8FAFC' },
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  notifBody: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
});
