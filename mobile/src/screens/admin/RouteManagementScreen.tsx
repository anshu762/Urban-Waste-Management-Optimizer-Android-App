import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGenerateRoute, useRoutePlans } from '../../hooks/useRoutes';
import { useZones } from '../../hooks/useZones';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';

const RouteManagementScreen = ({ navigation }: any) => {
  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  
  const { data: plansData, isLoading: plansLoading, refetch } = useRoutePlans({ 
    zoneId: selectedZoneId || '' 
  });
  
  const generateRoute = useGenerateRoute();

  // Select first zone by default if available
  useEffect(() => {
    if (zonesData?.success && zonesData.data.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zonesData.data[0].id);
    }
  }, [zonesData]);

  const handleGenerate = async () => {
    if (!selectedZoneId) return Alert.alert('Error', 'Please select a zone first');
    
    try {
      await generateRoute.mutateAsync({ zoneId: selectedZoneId });
      Alert.alert('Success', 'Route plan generated successfully');
      refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate route');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return { bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'IN_PROGRESS': return { bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'COMPLETED': return { bg: 'bg-green-100', text: 'text-green-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600' }; // DRAFT
    }
  };

  const renderRouteItem = ({ item }: any) => {
    const statusStyle = getStatusStyle(item.status);
    const routeDate = new Date(item.routeDate);
    const dateLabel = format(routeDate, 'dd MMM yyyy');
    const stops = item.totalEstimatedStops;
    const driver = item.driverProfile?.user?.fullName;
    const vehicle = item.vehicle?.vehicleNumber;

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mb-4 border border-gray-100 shadow-sm overflow-hidden"
        onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
      >
        {/* Top bar: status + date */}
        <View className="flex-row justify-between items-center px-4 pt-4 pb-3">
          <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
            <Text className={`text-xs font-bold ${statusStyle.text}`}>{item.status}</Text>
          </View>
          <Text className="text-gray-400 text-xs">📅 {dateLabel}</Text>
        </View>

        {/* Stats row */}
        <View className="flex-row px-4 pb-3 gap-4">
          <View className="flex-1 bg-emerald-50 rounded-xl px-3 py-2 items-center">
            <Text className="text-2xl font-extrabold text-emerald-700">{stops}</Text>
            <Text className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">
              {stops === 1 ? 'Resident' : 'Residents'}
            </Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2 items-center">
            <Text className="text-2xl font-extrabold text-gray-700">{item.totalPriorityScore}</Text>
            <Text className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Priority</Text>
          </View>
        </View>

        {/* Driver/Vehicle info or unassigned prompt */}
        <View className={`mx-4 mb-3 px-3 py-2 rounded-xl flex-row items-center ${
          driver ? 'bg-blue-50' : 'bg-amber-50'
        }`}>
          <Ionicons
            name={driver ? 'person' : 'alert-circle-outline'}
            size={14}
            color={driver ? '#3B82F6' : '#F59E0B'}
          />
          <Text className={`ml-2 text-xs font-semibold ${
            driver ? 'text-blue-700' : 'text-amber-700'
          }`}>
            {driver
              ? `Driver: ${driver}  •  ${vehicle || 'No vehicle'}`
              : 'Not assigned — tap to assign driver'}
          </Text>
        </View>

        {/* Footer */}
        <View className="flex-row justify-end items-center px-4 pb-3">
          <Text className="text-emerald-600 font-semibold text-sm mr-1">View Details</Text>
          <Ionicons name="arrow-forward" size={15} color="#059669" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Route Planning</Text>
            <Text className="text-gray-500 text-sm">Optimize collection routes</Text>
          </View>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-xl flex-row items-center ${selectedZoneId ? 'bg-emerald-600' : 'bg-gray-300'}`}
            onPress={handleGenerate}
            disabled={generateRoute.isPending || !selectedZoneId}
          >
            {generateRoute.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Optimize</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Zone Selector */}
        <View>
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Select Zone</Text>
          {zonesLoading ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {zonesData?.data?.map((zone: any) => (
                <TouchableOpacity
                  key={zone.id}
                  onPress={() => setSelectedZoneId(zone.id)}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    selectedZoneId === zone.id 
                    ? 'bg-emerald-600 border-emerald-600' 
                    : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`font-bold ${selectedZoneId === zone.id ? 'text-white' : 'text-gray-500'}`}>
                    {zone.zoneName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {plansLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={plansData?.data || []}
          keyExtractor={(item) => item.id}
          renderItem={renderRouteItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="map-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 text-center">
                {selectedZoneId 
                  ? "No route plans found for this zone.\nTap 'Optimize' to generate one."
                  : "Please select a zone to see route plans."
                }
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default RouteManagementScreen;
