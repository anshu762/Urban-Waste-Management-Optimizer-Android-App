import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';

// A small timeline row component for visual consistency
const TimelineRow = ({
  emoji, label, dateStr, textColor = 'text-gray-800',
}: { emoji: string; label: string; dateStr: string; textColor?: string }) => (
  <View className="flex-row items-start mb-4">
    <View className="w-8 items-center">
      <Text className="text-lg">{emoji}</Text>
    </View>
    <View className="flex-1 ml-2 border-l-2 border-gray-100 pl-3">
      <Text className="text-xs text-gray-400 uppercase font-semibold mb-0.5">{label}</Text>
      <Text className={`text-sm font-semibold ${textColor}`}>{dateStr}</Text>
    </View>
  </View>
);

export const ComplaintDetailScreen = () => {
  const route = useRoute<any>();
  const { complaint } = route.params;

  if (!complaint) return null;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Card */}
      <View className="bg-white px-4 pt-6 pb-4 mb-3">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-lg font-bold text-gray-900">Complaint Report</Text>
          <StatusBadge status={complaint.status} />
        </View>
        <Text className="text-xs text-gray-400">ID: #{complaint.id?.slice(-8).toUpperCase()}</Text>
      </View>

      {/* Timeline Card */}
      <View className="bg-white px-4 py-4 mb-3">
        <Text className="text-xs font-bold text-gray-400 uppercase mb-4">Activity Timeline</Text>

        <TimelineRow
          emoji="📋"
          label="Complaint Filed"
          dateStr={format(new Date(complaint.createdAt), 'MMM dd, yyyy • hh:mm a')}
          textColor="text-gray-800"
        />

        {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && !complaint.resolvedAt && (
          <TimelineRow
            emoji="🔄"
            label="Status Updated (In Progress)"
            dateStr={format(new Date(complaint.updatedAt), 'MMM dd, yyyy • hh:mm a')}
            textColor="text-blue-600"
          />
        )}

        {complaint.resolvedAt ? (
          <TimelineRow
            emoji="✅"
            label="Complaint Resolved"
            dateStr={format(new Date(complaint.resolvedAt), 'MMM dd, yyyy • hh:mm a')}
            textColor="text-emerald-600"
          />
        ) : (
          <View className="flex-row items-start mb-4 opacity-40">
            <View className="w-8 items-center">
              <Text className="text-lg">⏳</Text>
            </View>
            <View className="flex-1 ml-2 border-l-2 border-dashed border-gray-200 pl-3">
              <Text className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Awaiting Resolution</Text>
              <Text className="text-sm text-gray-400">Pending admin action</Text>
            </View>
          </View>
        )}
      </View>

      {/* Details Card */}
      <View className="bg-white px-4 py-4 mb-3">
        <Text className="text-xs font-bold text-gray-400 uppercase mb-3">Complaint Details</Text>

        {complaint.relatedSchedule && (
          <View className="mb-3">
            <Text className="text-xs text-gray-500 mb-1">Related Schedule</Text>
            <Text className="text-sm font-semibold text-gray-800">
              {complaint.relatedSchedule.wasteCategory} Pickup — {complaint.relatedSchedule.pickupTimeWindow}
            </Text>
          </View>
        )}

        <View>
          <Text className="text-xs text-gray-500 mb-1">Your Description</Text>
          <Text className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl">
            {complaint.note || 'No description provided.'}
          </Text>
        </View>
      </View>

      {/* Photo */}
      {complaint.imageUrl && (
        <View className="bg-white px-4 py-4 mb-8">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3">Attached Photo</Text>
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
