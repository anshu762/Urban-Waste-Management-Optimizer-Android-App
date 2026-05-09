import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useZones } from '../../hooks/useZones';
import { useGenerateMockSensorData, useZoneSensorSummary } from '../../hooks/useIoT';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

const fillColor = (fillLevel: number) => {
  if (fillLevel > 80) return '#EF4444';
  if (fillLevel >= 50) return '#F59E0B';
  return '#10B981';
};

export const IoTDashboardScreen = () => {
  const { data: zonesData, isLoading: zonesLoading, isError: zonesError, refetch: refetchZones } = useZones();
  const zones = zonesData?.data || [];
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>();
  const activeZoneId = selectedZoneId || zones[0]?.id;
  const selectedZone = useMemo(() => zones.find((zone: any) => zone.id === activeZoneId), [zones, activeZoneId]);

  const {
    data: summaryData,
    isLoading,
    isError,
    refetch,
  } = useZoneSensorSummary(activeZoneId);
  const generateMock = useGenerateMockSensorData();
  const bins = summaryData?.data || [];

  if (zonesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 p-4">
        <ActivityIndicator size="large" color="#10b981" />
        <View className="mt-6 gap-y-3">
          <LoadingSkeleton height={72} borderRadius={12} />
          <LoadingSkeleton height={72} borderRadius={12} />
          <LoadingSkeleton height={72} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  if (zonesError) {
    return <ErrorState message="Something went wrong" onRetry={refetchZones} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">IoT Bin Monitor</Text>
        <Text className="text-emerald-700 font-bold mt-1">Demo / Pilot Mode</Text>
      </View>

      <View className="px-4 py-3 bg-white">
        <FlatList
          data={zones}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              onPress={() => setSelectedZoneId(item.id)}
              className={`mr-2 px-4 py-2 rounded-full ${item.id === activeZoneId ? 'bg-emerald-600' : 'bg-gray-100'}`}
            >
              <Text className={item.id === activeZoneId ? 'text-white font-bold' : 'text-gray-700'}>
                {item.zoneName}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View className="px-4 py-4 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-gray-900">{selectedZone?.zoneName || 'Select a zone'}</Text>
          <Text className="text-xs text-gray-500">Auto-refreshes every 30 seconds</Text>
        </View>
        <TouchableOpacity
          disabled={!activeZoneId || generateMock.isPending}
          onPress={() => activeZoneId && generateMock.mutate(activeZoneId)}
          className="bg-emerald-600 px-4 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">{generateMock.isPending ? 'Generating...' : 'Generate Mock Data'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="px-4 gap-y-3">
          <LoadingSkeleton height={96} borderRadius={12} />
          <LoadingSkeleton height={96} borderRadius={12} />
          <LoadingSkeleton height={96} borderRadius={12} />
        </View>
      ) : isError ? (
        <ErrorState message="Something went wrong" onRetry={refetch} />
      ) : (
        <FlatList
          data={bins}
          keyExtractor={(item: any) => item.binId}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <EmptyState
              emoji="🧪"
              title="No sensor data yet"
              subtitle="Generate demo readings to preview pilot bin telemetry."
              actionLabel="Generate Mock Data"
              onAction={() => activeZoneId && generateMock.mutate(activeZoneId)}
            />
          }
          renderItem={({ item }: any) => (
            <View className="bg-white p-4 rounded-xl border border-gray-100 mb-3">
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-lg font-bold text-gray-900">{item.binId}</Text>
                  <Text className="text-xs text-gray-500">{item.status}</Text>
                </View>
                <Text className="text-sm font-bold text-gray-700">{Math.round(item.fillLevel)}%</Text>
              </View>
              <View className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                <View style={{ width: `${item.fillLevel}%`, backgroundColor: fillColor(item.fillLevel) }} className="h-3 rounded-full" />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">Battery {item.batteryStatus ?? '--'}%</Text>
                <Text className="text-xs text-gray-400">{new Date(item.recordedAt).toLocaleString()}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};
