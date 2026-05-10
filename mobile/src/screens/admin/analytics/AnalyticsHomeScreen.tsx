import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { analyticsApi } from '../../../api/analytics.api';
import { getZonesApi } from '../../../api/zone.api';

type RootStackParamList = {
  DemandForecast: { zoneId: string };
  ZoneRanking: undefined;
  ComplianceTrend: { zoneId: string };
  InactiveResidents: { zoneId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AnalyticsHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedZone, setSelectedZone] = useState<string>('');

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: getZonesApi,
  });

  const zonesArray = zones?.data || zones || [];
  const activeZones = Array.isArray(zonesArray) ? zonesArray.filter((z: any) => z.isActive) : [];

  // Default to first zone if none selected
  React.useEffect(() => {
    if (!selectedZone && activeZones.length > 0) {
      setSelectedZone(activeZones[0].id);
    }
  }, [activeZones, selectedZone]);

  const { data: demandEstimate, isLoading: demandLoading } = useQuery({
    queryKey: ['demandEstimate', selectedZone],
    queryFn: () => analyticsApi.getDemandEstimate(selectedZone),
    enabled: !!selectedZone,
  });

  const { data: zoneRankings, isLoading: rankLoading } = useQuery({
    queryKey: ['zoneRankings'],
    queryFn: analyticsApi.getZoneRankings,
  });

  const { data: complianceTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['complianceTrend', selectedZone],
    queryFn: () => analyticsApi.getComplianceTrend(selectedZone),
    enabled: !!selectedZone,
  });

  const { data: inactiveResidents, isLoading: inactiveLoading } = useQuery({
    queryKey: ['inactiveResidents', selectedZone],
    queryFn: () => analyticsApi.getInactiveResidents(selectedZone),
    enabled: !!selectedZone,
  });

  if (zonesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Smart Insights</Text>

      <View className="bg-white rounded-lg p-2 mb-6 border border-gray-200 shadow-sm">
        <Text className="text-sm font-semibold text-gray-500 ml-2 mt-2">SELECT ZONE</Text>
        <Picker
          selectedValue={selectedZone}
          onValueChange={(itemValue: any) => setSelectedZone(itemValue)}
        >
          {activeZones.map((zone: any) => (
            <Picker.Item key={zone.id} label={`${zone.zoneName} (${zone.city})`} value={zone.id} />
          ))}
        </Picker>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {/* Card 1: Demand Forecast */}
        <TouchableOpacity 
          className="w-[48%] bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4"
          onPress={() => navigation.navigate('DemandForecast', { zoneId: selectedZone })}
        >
          <Text className="text-3xl mb-2">📊</Text>
          <Text className="font-bold text-gray-800 text-lg mb-1">Demand Forecast</Text>
          {demandLoading ? <ActivityIndicator size="small" /> : (
            <>
              <Text className="text-gray-500 text-sm mb-2">Tomorrow's Load</Text>
              <Text className="text-2xl font-black text-green-600">{demandEstimate?.estimatedLogs || 0} <Text className="text-sm font-normal text-gray-500">logs</Text></Text>
              
              <View className={`mt-3 px-2 py-1 rounded-full self-start ${
                demandEstimate?.confidence === 'HIGH' ? 'bg-green-100' : 
                demandEstimate?.confidence === 'MEDIUM' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Text className={`text-xs font-bold ${
                  demandEstimate?.confidence === 'HIGH' ? 'text-green-700' : 
                  demandEstimate?.confidence === 'MEDIUM' ? 'text-yellow-700' : 'text-red-700'
                }`}>{demandEstimate?.confidence || 'UNKNOWN'} CONFIDENCE</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Card 2: Zone Rankings */}
        <TouchableOpacity 
          className="w-[48%] bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4"
          onPress={() => navigation.navigate('ZoneRanking')}
        >
          <Text className="text-3xl mb-2">🏆</Text>
          <Text className="font-bold text-gray-800 text-lg mb-1">Zone Rankings</Text>
          {rankLoading ? <ActivityIndicator size="small" /> : (
            <>
              <Text className="text-gray-500 text-sm mb-2">Priority Top 3</Text>
              {Array.isArray(zoneRankings) && zoneRankings.slice(0, 3).map((zone: any, idx: number) => (
                <View key={zone.zoneId} className="flex-row justify-between items-center mt-1">
                  <Text className="text-gray-700 text-sm truncate w-20" numberOfLines={1}>{idx+1}. {zone.zoneName}</Text>
                  <View className={`px-1 rounded ${idx === 0 ? 'bg-red-100' : idx === 1 ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                    <Text className={`text-xs font-bold ${idx === 0 ? 'text-red-700' : idx === 1 ? 'text-orange-700' : 'text-yellow-700'}`}>{zone.totalScore}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </TouchableOpacity>

        {/* Card 3: Compliance Trend */}
        <TouchableOpacity 
          className="w-[48%] bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4"
          onPress={() => navigation.navigate('ComplianceTrend', { zoneId: selectedZone })}
        >
          <Text className="text-3xl mb-2">♻️</Text>
          <Text className="font-bold text-gray-800 text-lg mb-1">Compliance</Text>
          {trendLoading ? <ActivityIndicator size="small" /> : (
            <>
              <Text className="text-gray-500 text-sm mb-2">Segregation Trend</Text>
              <View className="flex-row items-center">
                <Text className="text-2xl font-black text-blue-600 mr-2">{complianceTrend?.thisWeekRate || 0}%</Text>
                {complianceTrend?.trend === 'IMPROVING' && <Text className="text-green-500 text-xl">↑</Text>}
                {complianceTrend?.trend === 'DECLINING' && <Text className="text-red-500 text-xl">↓</Text>}
                {complianceTrend?.trend === 'STABLE' && <Text className="text-gray-500 text-xl">→</Text>}
              </View>
              <Text className="text-xs text-gray-500 mt-2 truncate" numberOfLines={2}>{complianceTrend?.insight}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Card 4: Inactive Residents */}
        <TouchableOpacity 
          className="w-[48%] bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4"
          onPress={() => navigation.navigate('InactiveResidents', { zoneId: selectedZone })}
        >
          <Text className="text-3xl mb-2">😴</Text>
          <Text className="font-bold text-gray-800 text-lg mb-1">Inactive Users</Text>
          {inactiveLoading ? <ActivityIndicator size="small" /> : (
            <>
              <Text className="text-gray-500 text-sm mb-2">Needs Nudge</Text>
              <Text className="text-2xl font-black text-purple-600">{inactiveResidents?.totalInactive || 0}</Text>
              <Text className="text-xs text-gray-500 mt-1">out of {inactiveResidents?.totalResidents || 0} residents</Text>
              <View className="bg-purple-100 rounded-full px-2 py-1 mt-3 self-start">
                <Text className="text-purple-700 text-xs font-bold">Review & Remind</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
      <View className="h-10" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#4b5563', fontSize: 16 }
});

export default AnalyticsHomeScreen;
