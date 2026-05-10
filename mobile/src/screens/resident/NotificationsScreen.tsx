import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markAsRead } from '../../api/notification.api';
import { format, parseISO } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const NotificationsScreen = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => getMyNotifications(page),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => !item.isRead && markReadMutation.mutate(item.id)}
      className={`p-4 border-b border-gray-100 ${item.isRead ? 'bg-white' : 'bg-green-50'}`}
    >
      <View className="flex-row justify-between items-start mb-1">
        <Text className={`flex-1 text-base ${item.isRead ? 'text-gray-800' : 'font-bold text-gray-900'}`}>
          {item.title}
        </Text>
        {!item.isRead && <View className="w-2 h-2 rounded-full bg-primary mt-1.5" />}
      </View>
      <Text className="text-gray-600 text-sm mb-2">{item.body}</Text>
      <Text className="text-gray-400 text-xs">
        {format(parseISO(item.createdAt), 'MMM do, h:mm a')}
      </Text>
    </TouchableOpacity>
  );

  const notifications = data?.data?.notifications || [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Notifications</Text>
      </View>

      {isLoading && page === 1 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10b981" />
          <View className="mt-6 w-full px-4 gap-y-3">
            <LoadingSkeleton height={70} borderRadius={12} />
            <LoadingSkeleton height={70} borderRadius={12} />
          </View>
        </View>
      ) : isError ? (
        <ErrorCard error={parseError(error)} onRetry={refetch} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState emoji="🔔" title="No notifications yet" subtitle="Pickup reminders and service updates will appear here." />
          }
          onEndReached={() => {
            if (data?.data?.pagination?.totalPages > page) {
              setPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#10b981" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};
