import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';

export const ComplaintDetailScreen = () => {
  const route = useRoute<any>();
  const { complaint } = route.params;

  if (!complaint) return null;

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg font-bold text-gray-900">Report Details</Text>
        <StatusBadge status={complaint.status} />
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-500 mb-1">Date Submitted</Text>
        <Text className="text-base text-gray-800">
          {format(new Date(complaint.createdAt), 'MMMM dd, yyyy - hh:mm a')}
        </Text>
      </View>

      {complaint.resolvedAt && (
        <View className="mb-4">
          <Text className="text-sm text-gray-500 mb-1">Date Resolved</Text>
          <Text className="text-base text-gray-800">
            {format(new Date(complaint.resolvedAt), 'MMMM dd, yyyy - hh:mm a')}
          </Text>
        </View>
      )}

      {complaint.relatedSchedule && (
        <View className="mb-4">
          <Text className="text-sm text-gray-500 mb-1">Related Schedule</Text>
          <Text className="text-base text-gray-800">
            {complaint.relatedSchedule.wasteCategory} Pickup - {complaint.relatedSchedule.pickupTimeWindow}
          </Text>
        </View>
      )}

      <View className="mb-6">
        <Text className="text-sm text-gray-500 mb-1">Description</Text>
        <Text className="text-base text-gray-800">
          {complaint.note || 'No description provided.'}
        </Text>
      </View>

      {complaint.imageUrl && (
        <View className="mb-8">
          <Text className="text-sm text-gray-500 mb-2">Attached Photo</Text>
          <Image
            source={{ uri: complaint.imageUrl }}
            className="w-full h-64 rounded-xl"
            resizeMode="cover"
          />
        </View>
      )}
    </ScrollView>
  );
};
