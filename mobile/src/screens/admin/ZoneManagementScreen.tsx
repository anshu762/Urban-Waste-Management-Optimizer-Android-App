import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getZonesApi } from '../../api/zone.api';
import { useAuthStore } from '../../stores/auth.store';
import { apiClient } from '../../config/api.config';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { useErrorHandler } from '../../hooks/useErrorHandler';

export const ZoneManagementScreen = ({ navigation }: any) => {
  const queryClient = useQueryClient();

  const { showError, showSuccess } = useErrorHandler();
  const { data: zones, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['zones'],
    queryFn: getZonesApi,
  });

  const deleteZoneMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      showSuccess('Zone deactivated successfully.');
    },
    onError: (err: any) => {
      showError(err);
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

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [zoneName, setZoneName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [areaCode, setAreaCode] = React.useState('');

  const createZoneMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/zones', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setIsModalVisible(false);
      setZoneName('');
      setCity('');
      setAreaCode('');
      showSuccess('Zone created successfully.');
    },
    onError: (err: any) => {
      showError(err);
    },
  });

  const handleCreateZone = () => {
    if (!zoneName || !city) {
        Alert.alert('Error', 'Please fill Zone Name and City');
        return;
    }
    createZoneMutation.mutate({ zoneName, city, areaCode });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Admin Panel</Text>
          <TouchableOpacity onPress={() => useAuthStore.getState().logout()}>
            <Text className="text-red-500 text-xs font-bold">Logout</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row">
          <TouchableOpacity 
            className="bg-orange-500 px-4 py-2 rounded-full mr-2"
            onPress={() => navigation.navigate('Complaints')}
          >
            <Text className="text-white font-bold">Complaints</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-primary px-4 py-2 rounded-full"
            onPress={() => setIsModalVisible(true)}
          >
            <Text className="text-white font-bold">+ Zone</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 mb-4">
        <Text className="text-lg font-bold text-gray-800">Managed Zones</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : isError ? (
        <ErrorCard error={parseError(error)} onRetry={refetch} />
      ) : (
        <FlatList
          data={zones?.data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <EmptyState emoji="📍" title="No zones found" subtitle="Create your first service zone to start scheduling pickups." />
          }
        />
      )}

      {/* Create Zone Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-6">Create New Zone</Text>
            
            <Text className="text-gray-700 font-medium mb-2">Zone Name</Text>
            <TextInput
              className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4"
              value={zoneName}
              onChangeText={setZoneName}
              placeholder="e.g. Sector 15"
            />

            <Text className="text-gray-700 font-medium mb-2">City</Text>
            <TextInput
              className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4"
              value={city}
              onChangeText={setCity}
              placeholder="e.g. New Delhi"
            />

            <Text className="text-gray-700 font-medium mb-2">Area Code (Optional)</Text>
            <TextInput
              className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6"
              value={areaCode}
              onChangeText={setAreaCode}
              placeholder="e.g. 110001"
            />

            <View className="flex-row mb-6">
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="flex-1 py-4 items-center"
              >
                <Text className="text-gray-500 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCreateZone}
                disabled={createZoneMutation.isPending}
                className="flex-1 bg-primary py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">
                    {createZoneMutation.isPending ? 'Creating...' : 'Create Zone'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
