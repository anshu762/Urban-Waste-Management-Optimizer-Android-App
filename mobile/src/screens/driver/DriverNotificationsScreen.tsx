import React, { useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getMyNotifications, markAsRead } from '../../api/notification.api';
import { format, parseISO, isToday, isYesterday, differenceInHours, differenceInMinutes } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

type NotificationType = 'route_assigned' | 'route_updated' | 'route_completed' | 'pickup_reminder' | 'admin_message' | 'general';

const getNotifType = (title: string, body: string): NotificationType => {
  const t = title.toLowerCase();
  const b = body.toLowerCase();
  if (t.includes('route assigned') || t.includes('new route')) return 'route_assigned';
  if (t.includes('route updated') || t.includes('route changed')) return 'route_updated';
  if (t.includes('route completed') || t.includes('route done')) return 'route_completed';
  if (t.includes('reminder') || t.includes('pickup')) return 'pickup_reminder';
  if (t.includes('admin') || b.includes('admin')) return 'admin_message';
  return 'general';
};

const typeConfig: Record<NotificationType, { icon: any; color: string; bg: string }> = {
  route_assigned: { icon: 'map', color: '#10B981', bg: '#ECFDF5' },
  route_updated: { icon: 'refresh', color: '#F59E0B', bg: '#FFFBEB' },
  route_completed: { icon: 'checkmark-circle', color: '#3B82F6', bg: '#EFF6FF' },
  pickup_reminder: { icon: 'alarm', color: '#8B5CF6', bg: '#F5F3FF' },
  admin_message: { icon: 'megaphone', color: '#EF4444', bg: '#FEF2F2' },
  general: { icon: 'notifications', color: '#64748B', bg: '#F8FAFC' },
};

const getRelativeTime = (dateStr: string): string => {
  const date = parseISO(dateStr);
  const now = new Date();
  const diffMin = differenceInMinutes(now, date);
  const diffHrs = differenceInHours(now, date);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (isYesterday(date)) return 'Yesterday';
  if (diffHrs < 168) return `${Math.floor(diffHrs / 24)}d ago`;
  return format(date, 'MMM d');
};

type DateGroup = 'today' | 'yesterday' | 'week' | 'earlier';

const getDateGroup = (dateStr: string): DateGroup => {
  const date = parseISO(dateStr);
  const now = new Date();
  const diffHrs = differenceInHours(now, date);
  if (isToday(date)) return 'today';
  if (isYesterday(date)) return 'yesterday';
  if (diffHrs < 168) return 'week';
  return 'earlier';
};

const groupLabels: Record<DateGroup, string> = {
  today: 'TODAY',
  yesterday: 'YESTERDAY',
  week: 'THIS WEEK',
  earlier: 'EARLIER',
};

type ListItem =
  | { type: 'section'; title: string }
  | { type: 'notif'; item: any };

const DriverNotificationsScreen = () => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
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
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const flatList: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];
    let lastGroup: DateGroup | null = null;
    notifications.forEach((n: any) => {
      const g = getDateGroup(n.createdAt);
      if (g !== lastGroup) {
        items.push({ type: 'section', title: groupLabels[g] });
        lastGroup = g;
      }
      items.push({ type: 'notif', item: n });
    });
    return items;
  }, [notifications]);

  const handleMarkAllRead = () => {
    notifications.forEach((n: any) => {
      if (!n.isRead) markReadMutation.mutate(n.id);
    });
  };

  const renderSkeleton = () => (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color="#0F172A" />
      <View style={styles.skeletonCol}>
        <LoadingSkeleton height={88} borderRadius={20} />
        <View style={{ height: 10 }} />
        <LoadingSkeleton height={88} borderRadius={20} />
        <View style={{ height: 10 }} />
        <LoadingSkeleton height={88} borderRadius={20} />
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'section') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
      );
    }

    const notif = item.item;
    const unread = !notif.isRead;
    const ntype = getNotifType(notif.title, notif.body);
    const cfg = typeConfig[ntype];

    return (
      <TouchableOpacity
        style={[styles.cell, unread && styles.cellUnread]}
        onPress={() => {
          if (unread) markReadMutation.mutate(notif.id);
        }}
        activeOpacity={0.7}
      >
        {unread && <View style={styles.accentLine} />}
        <View style={[styles.iconTile, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
        </View>
        <View style={styles.cellBody}>
          <View style={styles.titleRow}>
            <Text style={[styles.itemType, { color: cfg.color }]} numberOfLines={1}>
              {ntype.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
            {unread && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.itemTitle, unread && styles.itemTitleUnread]} numberOfLines={1}>
            {notif.title}
          </Text>
          <Text style={styles.itemBody} numberOfLines={2}>
            {notif.body}
          </Text>
          <View style={styles.cellFooter}>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={10} color="#94A3B8" style={{ marginRight: 3 }} />
              <Text style={styles.timeText}>{getRelativeTime(notif.createdAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBox}>
            <Ionicons name="notifications" size={18} color="#10B981" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Alerts</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead} activeOpacity={0.7}>
            <Ionicons name="checkmark-done" size={14} color="#10B981" />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : isError ? (
        <View style={styles.errorPad}>
          <ErrorCard error={parseError(error)} onRetry={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={flatList}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={() => refetch()}
              tintColor="#10B981"
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji=""
              title="You're all caught up"
              subtitle="Route assignments & service alerts will appear here."
            />
          }
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoad}>
                <ActivityIndicator size="small" color="#10B981" />
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 10, fontWeight: '600', color: '#64748B', marginTop: 1 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  markAllText: { fontSize: 10, fontWeight: '800', color: '#059669', letterSpacing: 0.3 },
  listContent: { paddingBottom: 24 },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2 },
  cell: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cellUnread: {
    backgroundColor: '#FAFFFE',
    borderColor: '#A7F3D0',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#10B981',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cellBody: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemType: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  itemTitle: { fontSize: 13, fontWeight: '600', color: '#475569', lineHeight: 17, marginBottom: 2 },
  itemTitleUnread: { fontWeight: '800', color: '#0F172A' },
  itemBody: { fontSize: 11, color: '#94A3B8', lineHeight: 15 },
  cellFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 10, color: '#CBD5E1', fontWeight: '600' },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  loadingBox: { paddingTop: 24, alignItems: 'center' },
  skeletonCol: { marginTop: 20, paddingHorizontal: 16, width: '100%' },
  errorPad: { flex: 1, padding: 16, justifyContent: 'center' },
  footerLoad: { paddingVertical: 16, alignItems: 'center' },
});

export default DriverNotificationsScreen;
