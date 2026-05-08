import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { AppButton } from '../../components/common/AppButton';
import { useSubmitComplaint } from '../../hooks/useComplaints';

import { useAuthStore } from '../../stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { getSchedulesByZone } from '../../api/schedule.api';

export const ReportMissedPickupScreen = () => {
  const navigation = useNavigation();
  const submitComplaintMutation = useSubmitComplaint();

  const user = useAuthStore((state) => state.user);
  const zoneId = user?.residentProfile?.zoneId;

  const { data: schedulesResponse, isLoading } = useQuery({
    queryKey: ['zoneSchedules', zoneId],
    queryFn: () => getSchedulesByZone(zoneId!),
    enabled: !!zoneId,
  });

  const schedules = schedulesResponse?.data || [];

  const [note, setNote] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ note?: string }>({});

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (note.length > 500) {
      setErrors({ note: 'Note cannot exceed 500 characters' });
      return;
    }

    const formData = new FormData();
    if (note) formData.append('note', note);
    if (selectedScheduleId) formData.append('relatedScheduleId', selectedScheduleId);

    if (imageUri) {
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('image', { uri: imageUri, name: filename, type } as any);
    }

    submitComplaintMutation.mutate(formData, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Report submitted.',
          text2: 'Admin will review it soon.',
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message || 'Failed to submit report',
        });
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6 mt-4">Report Missed Pickup</Text>

      <View className="mb-6">
        <Text className="text-base font-semibold text-gray-800 mb-2">Related Schedule (Optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {isLoading ? (
            <ActivityIndicator size="small" color="#22c55e" className="m-2" />
          ) : schedules.length === 0 ? (
            <Text className="text-gray-500 my-2">No active schedules found.</Text>
          ) : (
            schedules.map((schedule: any) => (
              <TouchableOpacity
                key={schedule.id}
                onPress={() => setSelectedScheduleId(schedule.id === selectedScheduleId ? null : schedule.id)}
                className={`px-4 py-2 rounded-full m-1 border ${
                  selectedScheduleId === schedule.id ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                }`}
              >
                <Text className={`${selectedScheduleId === schedule.id ? 'text-white' : 'text-gray-700'}`}>
                  {schedule.wasteCategory} - Day {schedule.pickupDay} ({schedule.pickupTimeWindow})
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <View className="mb-6">
        <Text className="text-base font-semibold text-gray-800 mb-2">Description / Note</Text>
        <TextInput
          className={`bg-gray-50 border ${errors.note ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 text-gray-900 min-h-[100px]`}
          placeholder="Describe the issue... (Max 500 chars)"
          multiline
          textAlignVertical="top"
          value={note}
          onChangeText={(text) => {
            setNote(text);
            if (errors.note && text.length <= 500) setErrors({});
          }}
          maxLength={500}
        />
        {errors.note && <Text className="text-red-500 text-sm mt-1">{errors.note}</Text>}
        <Text className="text-gray-500 text-xs text-right mt-1">{note.length}/500</Text>
      </View>

      <View className="mb-8">
        <Text className="text-base font-semibold text-gray-800 mb-2">Photo Proof (Optional)</Text>
        
        {imageUri ? (
          <View className="relative">
            <Image source={{ uri: imageUri }} className="w-full h-48 rounded-lg" resizeMode="cover" />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
            >
              <Text className="text-white text-xs">Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={pickImage}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center bg-gray-50"
          >
            <Text className="text-gray-500 font-medium">+ Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <AppButton
        title={submitComplaintMutation.isPending ? 'Submitting...' : 'Submit Report'}
        onPress={handleSubmit}
        disabled={submitComplaintMutation.isPending}
      />
      <View className="h-10" />
    </ScrollView>
  );
};
