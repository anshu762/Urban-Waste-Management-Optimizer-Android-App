import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { analyticsApi } from '../../../api/analytics.api';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  ZoneRanking: undefined;
  RoutePlanner: { preselectedZoneId?: string }; // Assuming RoutePlanner accepts this
};

type Props = NativeStackScreenProps<RootStackParamList, 'ZoneRanking'>;

export const ZoneRankingScreen: React.FC<any> = ({ navigation }) => {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['zoneRankings'],
    queryFn: analyticsApi.getZoneRankings,
  });

  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading Rankings...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Zone Priority Rankings</Text>

      {rankings?.map((zone) => {
        const isExpanded = expandedZone === zone.zoneId;

        return (
          <TouchableOpacity 
            key={zone.zoneId}
            activeOpacity={0.8}
            onPress={() => setExpandedZone(isExpanded ? null : zone.zoneId)}
            className={`bg-white rounded-xl shadow-sm border mb-4 overflow-hidden ${
              zone.rank === 1 ? 'border-red-200' :
              zone.rank === 2 ? 'border-orange-200' :
              zone.rank === 3 ? 'border-yellow-200' : 'border-gray-100'
            }`}
          >
            <View className="p-4 flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  zone.rank === 1 ? 'bg-red-100' :
                  zone.rank === 2 ? 'bg-orange-100' :
                  zone.rank === 3 ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Text className={`font-black text-lg ${
                    zone.rank === 1 ? 'text-red-700' :
                    zone.rank === 2 ? 'text-orange-700' :
                    zone.rank === 3 ? 'text-yellow-700' : 'text-gray-600'
                  }`}>#{zone.rank}</Text>
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800 truncate" numberOfLines={1}>{zone.zoneName}</Text>
                  <Text className="text-sm text-gray-500 italic mt-0.5" numberOfLines={1}>{zone.recommendation}</Text>
                </View>
              </View>

              <View className="items-end ml-2">
                <Text className="text-xs text-gray-400 font-bold mb-0.5">SCORE</Text>
                <Text className="text-2xl font-black text-gray-800">{zone.totalScore}</Text>
              </View>
            </View>

            {isExpanded && (
              <View className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                <Text className="font-bold text-gray-700 mb-2">Score Breakdown:</Text>
                
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">📝 Complaints: {zone.breakdown.openComplaints} × 5pts</Text>
                  <Text className="font-bold text-gray-700">={zone.breakdown.complaintsScore}</Text>
                </View>
                
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">✅ Ready logs: {zone.breakdown.readyLogs} × 2pts</Text>
                  <Text className="font-bold text-gray-700">={zone.breakdown.logsScore}</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">💧 Wet waste: {zone.breakdown.wetWasteCount} × 3pts</Text>
                  <Text className="font-bold text-gray-700">={zone.breakdown.wetScore}</Text>
                </View>
                
                <View className="flex-row justify-between border-t border-gray-200 pt-2 mb-4">
                  <Text className="font-bold text-gray-800">Total Priority Score</Text>
                  <Text className="font-black text-gray-800">{zone.totalScore}</Text>
                </View>

                {/* We assume RoutePlanner is a valid screen in the admin stack that takes params */}
                <TouchableOpacity 
                  className="bg-green-600 py-3 rounded-lg items-center flex-row justify-center"
                  onPress={() => {
                  // Navigate to AdminRoot -> RouteManagement with params
                  (navigation as any).navigate('AdminRoot', {
                    screen: 'RouteManagement',
                    params: { preselectedZoneId: zone.zoneId }
                  });
                  }}
                >
                  <Ionicons name="map-outline" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Generate Route</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
      <View className="h-10" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#4b5563', fontSize: 16 }
});

export default ZoneRankingScreen;
