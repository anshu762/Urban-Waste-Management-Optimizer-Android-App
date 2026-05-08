import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAdminComplaints } from '../../hooks/useComplaints';
import { StatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';

const TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'OPEN', label: 'Open' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'RESOLVED', label: 'Resolved' },
];

export const ComplaintsScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('ALL');
  
  const filters = activeTab === 'ALL' ? {} : { status: activeTab };
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminComplaints(filters);

  const handlePress = (complaint: any) => {
    navigation.navigate('AdminComplaintDetail', { complaintId: complaint.id, complaint });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handlePress(item)}
      className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100 flex-row justify-between items-center"
    >
      <View className="flex-1 pr-4">
        <View className="flex-row items-center mb-1 justify-between">
          <StatusBadge status={item.status} />
          <Text className="text-gray-400 text-xs">
            {format(new Date(item.createdAt), 'MMM dd')}
          </Text>
        </View>
        <Text className="text-gray-900 font-semibold text-sm mb-1">
          {item.user?.fullName || 'Resident'} - {item.zone?.zoneName || 'Unknown Zone'}
        </Text>
        <Text className="text-gray-500 text-sm" numberOfLines={2}>
          {item.note || 'No description provided'}
        </Text>
      </View>
      <Text className="text-gray-400 text-lg">›</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-2 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeTab === tab.id ? 'bg-green-500' : 'bg-gray-100'
              }`}
            >
              <Text className={`${activeTab === tab.id ? 'text-white font-semibold' : 'text-gray-600'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500">Failed to load complaints.</Text>
        </View>
      ) : (
        <FlatList
          data={data?.pages.flatMap(page => page.data.data) || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-gray-500">No complaints found.</Text>
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
      )}
    </View>
  );
};
