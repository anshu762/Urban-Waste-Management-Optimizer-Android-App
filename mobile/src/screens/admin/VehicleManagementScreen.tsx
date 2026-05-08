import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVehicles, useCreateVehicle, useDeleteVehicle } from '../../hooks/useVehicles';
import { Ionicons } from '@expo/vector-icons';

const VehicleManagementScreen = () => {
  const { data: vehiclesData, isLoading, refetch } = useVehicles(true);
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [modalVisible, setModalVisible] = useState(false);
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('100');

  const handleCreate = async () => {
    if (!newVehicleNumber) return Alert.alert('Error', 'Vehicle number is required');
    try {
      await createVehicle.mutateAsync({ 
        vehicleNumber: newVehicleNumber, 
        capacityUnits: parseInt(newCapacity) 
      });
      setModalVisible(false);
      setNewVehicleNumber('');
      setNewCapacity('100');
      Alert.alert('Success', 'Vehicle added successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add vehicle');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteVehicle.mutateAsync(id);
            Alert.alert('Success', 'Vehicle removed');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove vehicle');
          }
        } 
      }
    ]);
  };

  const renderVehicleItem = ({ item }: any) => (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 flex-row items-center justify-between shadow-sm">
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${item.isActive ? 'bg-emerald-100' : 'bg-gray-100'}`}>
          <Ionicons name="bus" size={24} color={item.isActive ? '#059669' : '#9CA3AF'} />
        </View>
        <View>
          <Text className="text-gray-800 font-bold text-lg">{item.vehicleNumber}</Text>
          <Text className="text-gray-500 text-xs">Capacity: {item.capacityUnits} Units</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-800">Fleet Management</Text>
          <Text className="text-gray-500 text-sm">Manage collection vehicles</Text>
        </View>
        <TouchableOpacity 
          className="bg-emerald-600 w-10 h-10 rounded-full items-center justify-center"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={vehiclesData?.data || []}
          keyExtractor={(item) => item.id}
          renderItem={renderVehicleItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="car-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4">No vehicles in the fleet.</Text>
            </View>
          }
        />
      )}

      {/* Add Vehicle Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-800">Add Vehicle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-500 mb-2 ml-1">Vehicle Number</Text>
              <TextInput 
                className="bg-gray-100 p-4 rounded-2xl text-gray-800 font-medium"
                placeholder="e.g. MH-01-AB-1234"
                value={newVehicleNumber}
                onChangeText={setNewVehicleNumber}
              />
            </View>

            <View className="mb-8">
              <Text className="text-gray-500 mb-2 ml-1">Capacity (Units)</Text>
              <TextInput 
                className="bg-gray-100 p-4 rounded-2xl text-gray-800 font-medium"
                placeholder="100"
                keyboardType="numeric"
                value={newCapacity}
                onChangeText={setNewCapacity}
              />
            </View>

            <TouchableOpacity 
              className="bg-emerald-600 p-5 rounded-2xl items-center shadow-lg shadow-emerald-600/20"
              onPress={handleCreate}
              disabled={createVehicle.isPending}
            >
              {createVehicle.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Add to Fleet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VehicleManagementScreen;
