import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMyComplaints } from '../../hooks/useComplaints';
import { StatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';

export const MyReportsScreen = () => {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyComplaints();

  const handlePress = (complaint: any) => {
    navigation.navigate('ComplaintDetail', { complaintId: complaint.id, complaint });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handlePress(item)}
      className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100 flex-row justify-between items-center"
    >
      <View className="flex-1 pr-4">
        <View className="flex-row items-center mb-1">
          <StatusBadge status={item.status} />
          <Text className="text-gray-400 text-xs ml-2">
            {format(new Date(item.createdAt), 'MMM dd, yyyy')}
          </Text>
        </View>
        <Text className="text-gray-800 text-sm" numberOfLines={2}>
          {item.note || 'No description provided'}
        </Text>
      </View>
      <Text className="text-gray-400 text-lg">›</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500">Failed to load reports.</Text>
      </View>
    );
  }

  const complaints = data?.pages.flatMap((page) => page.data.data) || [];

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500">No reports found.</Text>
          </View>
        }
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#22c55e" className="my-4" />
          ) : null
        }
      />
    </View>
  );
};
