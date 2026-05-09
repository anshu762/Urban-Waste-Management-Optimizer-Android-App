import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSchedulesByZone, createSchedule, deleteSchedule } from '../../api/schedule.api';
import CategoryBadge from '../../components/common/CategoryBadge';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const ZoneDetailScreen = ({ route, navigation }: any) => {
  const { zoneId, zoneName } = route.params;
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Form State
  const [wasteCategory, setWasteCategory] = useState('WET');
  const [pickupDay, setPickupDay] = useState(1);
  const [timeWindow, setTimeWindow] = useState('08:00 AM - 10:00 AM');

  const { data: schedules, isLoading, isError, refetch } = useQuery({
    queryKey: ['schedules', zoneId],
    queryFn: () => getSchedulesByZone(zoneId),
  });

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', zoneId] });
      setIsModalVisible(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', zoneId] });
    },
  });

  const categories = ['WET', 'DRY', 'RECYCLABLE', 'HAZARDOUS', 'SANITARY', 'EWASTE'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleAddSchedule = () => {
    createMutation.mutate({
      zoneId,
      wasteCategory,
      pickupDay,
      pickupTimeWindow: timeWindow,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-primary font-bold">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">{zoneName}</Text>
      </View>

      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-bold text-gray-800">Pickup Schedules</Text>
          <TouchableOpacity 
            onPress={() => setIsModalVisible(true)}
            className="bg-primary px-3 py-1.5 rounded-lg"
          >
            <Text className="text-white font-bold text-xs">+ Add Schedule</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : isError ? (
          <ErrorState message="Something went wrong" onRetry={refetch} />
        ) : (
          <FlatList
            data={schedules?.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="bg-gray-50 p-4 rounded-xl mb-3 flex-row justify-between items-center border border-gray-100">
                <View>
                  <Text className="font-bold text-gray-800">{days[item.pickupDay]}</Text>
                  <Text className="text-xs text-gray-500">{item.pickupTimeWindow}</Text>
                </View>
                <CategoryBadge category={item.wasteCategory} />
                <TouchableOpacity onPress={() => deleteMutation.mutate(item.id)}>
                    <Text className="text-red-500">🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <EmptyState emoji="📅" title="No schedules set" subtitle="Add a pickup schedule for this zone." />
            }
          />
        )}
      </View>

      {/* Add Schedule Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-6">New Schedule</Text>
            
            <Text className="text-gray-700 font-medium mb-2">Waste Category</Text>
            <View className="flex-row flex-wrap mb-4">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setWasteCategory(cat)}
                  className={`px-3 py-1.5 rounded-full mr-2 mb-2 border ${wasteCategory === cat ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-xs ${wasteCategory === cat ? 'text-white' : 'text-gray-600'}`}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-700 font-medium mb-2">Pickup Day</Text>
            <View className="flex-row justify-between mb-4">
              {days.map((day, idx) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setPickupDay(idx)}
                  className={`w-10 h-10 rounded-full items-center justify-center border ${pickupDay === idx ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-xs font-bold ${pickupDay === idx ? 'text-white' : 'text-gray-600'}`}>{day[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-700 font-medium mb-2">Time Window</Text>
            <TextInput
              className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6"
              value={timeWindow}
              onChangeText={setTimeWindow}
              placeholder="e.g. 08:00 AM - 10:00 AM"
            />

            <View className="flex-row mb-6">
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="flex-1 py-4 items-center"
              >
                <Text className="text-gray-500 font-bold">Cancel</Text>
              </TouchableOpacity>
              <View className="flex-1">
                <AppButton 
                  title="Save Schedule" 
                  onPress={handleAddSchedule} 
                  isLoading={createMutation.isPending}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
