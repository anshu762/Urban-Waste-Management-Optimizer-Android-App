import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth.store';
import { getUpcomingPickups } from '../../api/schedule.api';
import PickupCard from '../../components/resident/PickupCard';
import CategoryBadge from '../../components/common/CategoryBadge';
import { AppButton } from '../../components/common/AppButton';

export const HomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const zoneId = user?.residentProfile?.zoneId;
  const zoneName = user?.residentProfile?.zone?.zoneName || (zoneId ? 'Zone Set ✓' : 'No Zone Set');

  const { data: pickups, isLoading } = useQuery({
    queryKey: ['upcomingPickups', zoneId],
    queryFn: () => getUpcomingPickups(zoneId!),
    enabled: !!zoneId,
  });

  const nextPickup = pickups?.data?.[0];
  const nextSevenDays = pickups?.data?.slice(1, 8) || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4">
        <View className="py-6 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 text-sm">Welcome back,</Text>
            <Text className="text-2xl font-bold text-gray-900">{user?.fullName}</Text>
            <TouchableOpacity onPress={() => useAuthStore.getState().logout()}>
              <Text className="text-red-500 text-xs font-bold mt-1">Logout</Text>
            </TouchableOpacity>
          </View>
          <View className="items-end">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Notifications')}
              className="bg-white p-2 rounded-full shadow-sm mb-2"
            >
              <Text className="text-xl">🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddressSetup')}
              className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full"
            >
              <Text className="text-emerald-700 text-xs font-bold">📍 {zoneId ? 'Change Zone' : 'Set Zone!'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Pickup Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Next Pickup</Text>
          {isLoading ? (
            <View className="bg-white p-8 rounded-xl items-center">
              <Text className="text-gray-400">Loading schedules...</Text>
            </View>
          ) : nextPickup ? (
            <PickupCard 
              date={nextPickup.date} 
              category={nextPickup.wasteCategory} 
              timeWindow={nextPickup.timeWindow}
              showCountdown
            />
          ) : (
            <View className="bg-white p-8 rounded-xl items-center border border-dashed border-gray-300">
              <Text className="text-gray-400">No upcoming pickups scheduled.</Text>
            </View>
          )}
        </View>

        {/* Next 7 Days List */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Next 7 Days</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PickupCalendar')}>
              <Text className="text-primary font-bold">View Calendar</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={nextSevenDays}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mr-4 w-40 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <Text className="text-gray-500 text-xs font-medium uppercase mb-1">
                  {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
                <View className="mb-2">
                    <CategoryBadge category={item.wasteCategory} />
                </View>
                <Text className="text-xs text-gray-400">🕒 {item.timeWindow}</Text>
              </View>
            )}
          />
        </View>

        {/* Quick Actions */}
        <View className="mb-10">
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <AppButton 
                title="Log Waste Ready" 
                onPress={() => navigation.navigate('LogWaste')} 
                variant="primary"
                className="h-12"
              />
            </View>
            <View className="flex-1 ml-2">
              <AppButton 
                title="Report Missed" 
                onPress={() => navigation.navigate('ReportMissedPickup')} 
                variant="secondary"
                className="h-12 border-red-500"
              />
            </View>
          </View>
          <View className="mt-4">
            <AppButton 
              title="My Reports" 
              onPress={() => navigation.navigate('MyReports')} 
              variant="outline"
              className="h-12"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
