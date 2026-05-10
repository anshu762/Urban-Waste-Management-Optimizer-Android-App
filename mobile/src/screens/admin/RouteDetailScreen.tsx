import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutePlanById, useAssignRoute } from '../../hooks/useRoutes';
import { useVehicles } from '../../hooks/useVehicles';
import { getDriversApi } from '../../api/user.api';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { FullScreenError } from '../../components/common/FullScreenError';
import { parseError } from '../../lib/error-parser';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const RouteDetailScreen = ({ route, navigation }: any) => {
  const { routeId } = route.params;
  const { showError, showSuccess } = useErrorHandler();
  const { data: planData, isLoading, isError, error, refetch } = useRoutePlanById(routeId);
  const { data: vehiclesData, isError: vehiclesError, error: vehiclesErr, refetch: refetchVehicles } = useVehicles();
  const assignRoute = useAssignRoute();

  const { data: driversData, isLoading: driversLoading, isError: driversError, error: driversErr, refetch: refetchDrivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDriversApi,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (isError) {
    return <FullScreenError error={parseError(error)} onRetry={refetch} />;
  }

  const plan = planData?.data;
  const drivers = driversData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const handleAssign = async () => {
    if (!selectedDriverId || !selectedVehicleId) {
      return Alert.alert('Error', 'Please select both a driver and a vehicle');
    }

    try {
      await assignRoute.mutateAsync({
        id: routeId,
        data: {
          driverProfileId: selectedDriverId,
          vehicleId: selectedVehicleId,
        }
      });
      showSuccess('Route assigned successfully!');
      setModalVisible(false);
      refetch();
    } catch (err: any) {
      showError(err);
    }
  };

  const renderStopItem = ({ item }: any) => {
    const resident = item.residentProfile;
    const address = `${resident.houseNumber || ''}, ${resident.buildingName || ''}, ${resident.block || ''}, ${resident.street || ''}`;
    
    return (
      <View className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm">
        <View className="flex-row items-start mb-3">
          <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3">
            <Text className="text-emerald-700 font-bold text-lg">{item.stopOrder}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-900 font-extrabold text-lg">{resident.user?.fullName}</Text>
              <View className={`px-2 py-1 rounded-md ${item.stopStatus === 'COMPLETED' ? 'bg-green-100' : 'bg-orange-50'}`}>
                <Text className={`text-[10px] font-bold ${item.stopStatus === 'COMPLETED' ? 'text-green-700' : 'text-orange-700'}`}>
                  {item.stopStatus}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
               <Ionicons name="location-outline" size={14} color="#6B7280" />
               <Text className="text-gray-500 text-xs ml-1" numberOfLines={2}>{address}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center border-t border-gray-50 pt-3">
           <View className="flex-row items-center">
              <View className="bg-gray-100 px-2 py-1 rounded-md mr-2">
                <Text className="text-[10px] font-bold text-gray-500">Prio: {item.priorityScore}</Text>
              </View>
              {resident.landmark && (
                <Text className="text-[10px] text-gray-400">Near {resident.landmark}</Text>
              )}
           </View>
           <TouchableOpacity className="bg-emerald-50 px-3 py-1.5 rounded-lg flex-row items-center">
              <Ionicons name="call-outline" size={12} color="#059669" />
              <Text className="text-emerald-700 text-xs font-bold ml-1">Contact</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-gray-800">Route Details</Text>
            <Text className="text-gray-500 text-xs">#{plan?.id.slice(-8).toUpperCase()}</Text>
          </View>
        </View>
        
        {plan?.status === 'DRAFT' && (
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="bg-emerald-600 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">Assign Driver</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Info Card */}
        <View className="bg-emerald-600 p-6 rounded-3xl shadow-md mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">Route Date</Text>
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
              <Text className="text-white text-xl font-bold">{plan?.vehicle?.vehicleNumber || 'Unassigned'}</Text>
            </View>
          </View>
        </View>

        {/* Assigned Info (if not DRAFT) */}
        {plan?.status !== 'DRAFT' && (
          <View className="bg-white p-4 rounded-2xl mb-6 border border-gray-100 shadow-sm">
             <Text className="text-xs font-bold text-gray-400 uppercase mb-3">Assigned Team</Text>
             <View className="flex-row items-center mb-2">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                   <Ionicons name="person" size={14} color="#059669" />
                </View>
                <Text className="text-gray-800 font-bold">{plan?.driverProfile?.user?.fullName}</Text>
             </View>
             <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                   <Ionicons name="bus" size={14} color="#059669" />
                </View>
                <Text className="text-gray-800 font-bold">{plan?.vehicle?.vehicleNumber}</Text>
             </View>
          </View>
        )}

        <Text className="text-lg font-bold text-gray-800 mb-4 px-1">Collection Stops</Text>
        
        {plan?.routeStops?.map((item: any) => (
          <React.Fragment key={item.id}>
            {renderStopItem({ item })}
          </React.Fragment>
        ))}

        {(!plan?.routeStops || plan.routeStops.length === 0) && (
          <EmptyState emoji="🗺️" title="No stops defined" subtitle="Generate a route with ready households to create stops." />
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Assign Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-800">Assign Route</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#D1D5DB" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-500 font-bold text-xs uppercase mb-3">1. Select Driver</Text>
              {driversLoading ? <ActivityIndicator /> : driversError ? (
                <ErrorCard error={parseError(driversErr)} onRetry={refetchDrivers} />
              ) : (
                <View className="flex-row flex-wrap mb-6">
                  {drivers.map((d: any) => (
                    <TouchableOpacity
                      key={d.id}
                      onPress={() => setSelectedDriverId(d.id)}
                      className={`px-4 py-3 rounded-2xl mr-2 mb-2 border ${selectedDriverId === d.id ? 'bg-emerald-600 border-emerald-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`font-bold ${selectedDriverId === d.id ? 'text-white' : 'text-gray-600'}`}>{d.user.fullName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text className="text-gray-500 font-bold text-xs uppercase mb-3">2. Select Vehicle</Text>
              {vehiclesError ? <ErrorCard error={parseError(vehiclesErr)} onRetry={refetchVehicles} /> : null}
              <View className="flex-row flex-wrap mb-8">
                {vehicles.filter((v: any) => v.isActive).map((v: any) => (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => setSelectedVehicleId(v.id)}
                    className={`px-4 py-3 rounded-2xl mr-2 mb-2 border ${selectedVehicleId === v.id ? 'bg-emerald-600 border-emerald-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Text className={`font-bold ${selectedVehicleId === v.id ? 'text-white' : 'text-gray-600'}`}>{v.vehicleNumber}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                onPress={handleAssign}
                disabled={assignRoute.isPending}
                className="bg-emerald-600 p-5 rounded-2xl items-center shadow-lg shadow-emerald-600/20"
              >
                {assignRoute.isPending ? <ActivityIndicator color="white" /> : (
                  <Text className="text-white font-bold text-lg">Confirm Assignment</Text>
                )}
              </TouchableOpacity>
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RouteDetailScreen;
