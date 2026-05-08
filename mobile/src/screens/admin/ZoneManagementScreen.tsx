import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getZonesApi } from '../../api/zone.api';
// Assuming deleteZone api exists or I should add it
import { apiClient } from '../../config/api.config';

export const ZoneManagementScreen = ({ navigation }: any) => {
  const queryClient = useQueryClient();

  const { data: zones, isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: getZonesApi,
  });

  const deleteZoneMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Zone',
      `Are you sure you want to deactivate ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteZoneMutation.mutate(id)
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ZoneDetail', { zoneId: item.id, zoneName: item.zoneName })}
      className="bg-white p-4 mx-4 mb-3 rounded-xl shadow-sm border border-gray-100 flex-row justify-between items-center"
    >
      <View>
        <Text className="text-lg font-bold text-gray-900">{item.zoneName}</Text>
        <Text className="text-gray-500 text-sm">{item.city} • {item.areaCode || 'No Area Code'}</Text>
      </View>
      <View className="flex-row items-center">
        <View className={`px-2 py-1 rounded-md ${item.isActive ? 'bg-green-100' : 'bg-red-100'} mr-3`}>
          <Text className={`text-xs font-bold ${item.isActive ? 'text-green-700' : 'text-red-700'}`}>
            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.zoneName)}>
            <Text className="text-red-500 font-bold">🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Zones</Text>
        <TouchableOpacity 
          className="bg-primary px-4 py-2 rounded-full"
          onPress={() => {/* Open Create Zone Sheet/Screen */}}
        >
          <Text className="text-white font-bold">+ New Zone</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
            <Text>Loading zones...</Text>
        </View>
      ) : (
        <FlatList
          data={zones?.data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <Text className="text-gray-400">No zones found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
