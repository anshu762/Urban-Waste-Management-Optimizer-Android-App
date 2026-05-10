import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';
import { useUpdateComplaintStatus } from '../../hooks/useComplaints';
import { useErrorHandler } from '../../hooks/useErrorHandler';

export const AdminComplaintDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { complaint } = route.params;
  const updateStatusMutation = useUpdateComplaintStatus();
  const { showError, showSuccess } = useErrorHandler();

  if (!complaint) return null;

  const handleUpdateStatus = (status: string) => {
    Alert.alert('Update Status', `Mark this complaint as ${status}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          updateStatusMutation.mutate(
            { id: complaint.id, status },
            {
              onSuccess: () => {
                showSuccess('Status updated.');
                navigation.goBack();
              },
              onError: (err: any) => {
                showError(err);
              },
            }
          );
        },
      },
    ]);
  };

  const isResolvedOrRejected = complaint.status === 'RESOLVED' || complaint.status === 'REJECTED';

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg font-bold text-gray-900">Complaint #{complaint.id.slice(-6)}</Text>
        <StatusBadge status={complaint.status} />
      </View>

      <View className="bg-gray-50 p-4 rounded-xl mb-6">
        <Text className="text-xs text-gray-500 mb-1">Resident</Text>
        <Text className="text-base font-semibold text-gray-900 mb-3">{complaint.user?.fullName}</Text>

        <Text className="text-xs text-gray-500 mb-1">Zone</Text>
        <Text className="text-base text-gray-900 mb-3">{complaint.zone?.zoneName}</Text>

        <Text className="text-xs text-gray-500 mb-1">Date Submitted</Text>
        <Text className="text-base text-gray-900">
          {format(new Date(complaint.createdAt), 'MMM dd, yyyy - hh:mm a')}
        </Text>

        {complaint.resolvedAt && (
          <>
            <Text className="text-xs text-gray-500 mb-1 mt-3">✅ Date Resolved</Text>
            <Text className="text-base text-emerald-700 font-semibold">
              {format(new Date(complaint.resolvedAt), 'MMM dd, yyyy - hh:mm a')}
            </Text>
          </>
        )}

        {!complaint.resolvedAt && complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
          <>
            <Text className="text-xs text-gray-500 mb-1 mt-3">🔄 Last Updated</Text>
            <Text className="text-base text-blue-600">
              {format(new Date(complaint.updatedAt), 'MMM dd, yyyy - hh:mm a')}
            </Text>
          </>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-800 mb-2">Description</Text>
        <Text className="text-base text-gray-700 bg-white border border-gray-200 p-3 rounded-lg">
          {complaint.note || 'No description provided.'}
        </Text>
      </View>

      {complaint.imageUrl && (
        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-800 mb-2">Photo Proof</Text>
          <Image
            source={{ uri: complaint.imageUrl }}
            className="w-full h-64 rounded-xl bg-gray-100"
            resizeMode="cover"
          />
        </View>
      )}

      {!isResolvedOrRejected && (
        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-800 mb-3">Update Status</Text>
          
          {complaint.status === 'OPEN' && (
            <TouchableOpacity
              onPress={() => handleUpdateStatus('IN_PROGRESS')}
              className="bg-blue-500 py-3 rounded-lg items-center mb-3"
            >
              <Text className="text-white font-bold">Mark as In Progress</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => handleUpdateStatus('RESOLVED')}
            className="bg-green-500 py-3 rounded-lg items-center mb-3"
          >
            <Text className="text-white font-bold">Mark as Resolved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleUpdateStatus('REJECTED')}
            className="bg-red-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-bold">Reject Complaint</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View className="h-10" />
    </ScrollView>
  );
};
