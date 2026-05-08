import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGenerateRoute, useRoutePlans } from '../../hooks/useRoutes';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const RouteManagementScreen = ({ navigation }: any) => {
  const [selectedZoneId, setSelectedZoneId] = useState('clw0qjx0c0001z1v8z8z8z8z8'); // Placeholder or from a list
  const { data: plansData, isLoading, refetch } = useRoutePlans({ zoneId: selectedZoneId });
  const generateRoute = useGenerateRoute();

  const handleGenerate = async () => {
    try {
      await generateRoute.mutateAsync({ zoneId: selectedZoneId });
      Alert.alert('Success', 'Route plan generated successfully');
      refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate route');
    }
  };

  const renderRouteItem = ({ item }: any) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm"
      onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
    >
      <View className="flex-row justify-between items-center mb-2">
        <View className="bg-emerald-100 px-3 py-1 rounded-full">
          <Text className="text-emerald-700 text-xs font-bold">{item.status}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{format(new Date(item.routeDate), 'PPP')}</Text>
      </View>
      
      <View className="flex-row justify-between items-end">
        <View>
          <Text className="text-gray-800 font-bold text-lg">{item.totalEstimatedStops} Stops</Text>
          <Text className="text-gray-500 text-sm">Priority Score: {item.totalPriorityScore}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-emerald-600 font-medium mr-1">View Details</Text>
          <Ionicons name="arrow-forward" size={16} color="#059669" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-800">Route Planning</Text>
          <Text className="text-gray-500 text-sm">Optimize collection routes</Text>
        </View>
        <TouchableOpacity 
          className="bg-emerald-600 px-4 py-2 rounded-xl flex-row items-center"
          onPress={handleGenerate}
          disabled={generateRoute.isPending}
        >
          {generateRoute.isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="flash" size={18} color="white" className="mr-2" />
              <Text className="text-white font-bold ml-1">Optimize</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
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
              <Text className="text-gray-400 mt-4 text-center">No route plans found for this zone.{"\n"}Tap 'Optimize' to generate one.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default RouteManagementScreen;
