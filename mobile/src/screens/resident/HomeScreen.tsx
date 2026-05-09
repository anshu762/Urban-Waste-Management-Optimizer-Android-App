import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth.store';
import { getUpcomingPickups } from '../../api/schedule.api';
import PickupCard from '../../components/resident/PickupCard';
import CategoryBadge from '../../components/common/CategoryBadge';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useResidentZoneSensorSummary } from '../../hooks/useIoT';

export const HomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const zoneId = user?.residentProfile?.zoneId;
  const zoneName = user?.residentProfile?.zone?.zoneName || (zoneId ? 'Zone Set ✓' : 'No Zone Set');

  const { data: pickups, isLoading, isError, refetch } = useQuery({
    queryKey: ['upcomingPickups', zoneId],
    queryFn: () => getUpcomingPickups(zoneId!),
    enabled: !!zoneId,
  });
  const { data: sensorData } = useResidentZoneSensorSummary(zoneId || undefined);

  const nextPickup = pickups?.data?.[0];
  const nextSevenDays = pickups?.data?.slice(1, 8) || [];
  const bins = sensorData?.data?.slice(0, 5) || [];

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
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Text className="text-emerald-600 text-xs font-bold mt-1">Profile</Text>
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
            <View className="bg-white p-6 rounded-xl">
              <ActivityIndicator size="large" color="#10b981" />
              <View className="mt-5">
                <LoadingSkeleton height={18} borderRadius={8} />
                <View className="mt-3"><LoadingSkeleton width="65%" height={14} borderRadius={8} /></View>
              </View>
            </View>
          ) : isError ? (
            <ErrorState message="Something went wrong" onRetry={refetch} />
          ) : nextPickup ? (
            <PickupCard 
              date={nextPickup.date} 
              category={nextPickup.wasteCategory} 
              timeWindow={nextPickup.timeWindow}
              showCountdown
            />
          ) : (
            <EmptyState emoji="📅" title="No pickups scheduled" subtitle="Contact your admin to set up a schedule." />
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

        {bins.length > 0 ? (
          <View className="mb-8 bg-white p-4 rounded-xl border border-gray-100">
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-lg font-bold text-gray-900">Bin Status</Text>
                <Text className="text-xs text-gray-500">Bins are being monitored for your area</Text>
              </View>
              <Text className="text-lg">📡</Text>
            </View>
            <View className="flex-row">
              {bins.map((bin: any) => (
                <View key={bin.binId} className="mr-3 items-center">
                  <View
                    style={{
                      backgroundColor: bin.fillLevel > 80 ? '#ef4444' : bin.fillLevel >= 50 ? '#f59e0b' : '#10b981',
                    }}
                    className="w-4 h-4 rounded-full mb-1"
                  />
                  <Text className="text-[10px] text-gray-500">{Math.round(bin.fillLevel)}%</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

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
