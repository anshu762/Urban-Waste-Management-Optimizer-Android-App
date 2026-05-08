import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutePlanById } from '../../hooks/useRoutes';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const RouteDetailScreen = ({ route, navigation }: any) => {
  const { routeId } = route.params;
  const { data: planData, isLoading } = useRoutePlanById(routeId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const plan = planData?.data;

  const renderStopItem = ({ item }: any) => (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 flex-row items-center">
      <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-4">
        <Text className="text-emerald-700 font-bold">{item.stopOrder}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-bold" numberOfLines={1}>Stop #{item.stopOrder}</Text>
        <Text className="text-gray-500 text-xs">Priority Score: {item.priorityScore}</Text>
      </View>
      <View className={`px-2 py-1 rounded-md ${item.stopStatus === 'COMPLETED' ? 'bg-green-100' : 'bg-gray-100'}`}>
        <Text className={`text-[10px] font-bold ${item.stopStatus === 'COMPLETED' ? 'text-green-700' : 'text-gray-500'}`}>
          {item.stopStatus}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-gray-800">Route Details</Text>
          <Text className="text-gray-500 text-xs">{plan?.id.slice(0, 8).toUpperCase()}</Text>
        </View>
      </View>

      <View className="p-4">
        <View className="bg-emerald-600 p-6 rounded-3xl shadow-md mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Route Date</Text>
              <Text className="text-white text-lg font-bold">{format(new Date(plan?.routeDate), 'PPP')}</Text>
            </View>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">{plan?.status}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-2 border-t border-emerald-500/30 pt-4">
            <View>
              <Text className="text-emerald-100 text-[10px] uppercase">Total Stops</Text>
              <Text className="text-white text-xl font-bold">{plan?.totalEstimatedStops}</Text>
            </View>
            <View>
              <Text className="text-emerald-100 text-[10px] uppercase">Priority Score</Text>
              <Text className="text-white text-xl font-bold">{plan?.totalPriorityScore}</Text>
            </View>
            <View>
              <Text className="text-emerald-100 text-[10px] uppercase">Vehicle</Text>
              <Text className="text-white text-xl font-bold">{plan?.vehicle?.vehicleNumber || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <Text className="text-lg font-bold text-gray-800 mb-4 px-1">Sequence of Stops</Text>
        
        <FlatList
          data={plan?.routeStops || []}
          keyExtractor={(item) => item.id}
          renderItem={renderStopItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text className="text-gray-400 text-center py-10">No stops defined for this route.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default RouteDetailScreen;
