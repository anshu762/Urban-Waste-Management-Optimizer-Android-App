import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { analyticsApi } from '../../../api/analytics.api';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  DemandForecast: { zoneId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'DemandForecast'>;

export const DemandForecastScreen: React.FC<any> = ({ route }) => {
  const { zoneId } = route.params;

  const { data: demandEstimate, isLoading: demandLoading } = useQuery({
    queryKey: ['demandEstimate', zoneId],
    queryFn: () => analyticsApi.getDemandEstimate(zoneId),
  });

  const { data: weeklyForecast, isLoading: forecastLoading } = useQuery({
    queryKey: ['weeklyForecast', zoneId],
    queryFn: () => analyticsApi.getWeeklyForecast(zoneId),
  });

  if (demandLoading || forecastLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading Forecast Data...</Text>
      </View>
    );
  }

  // Find max predicted logs to scale the bar chart appropriately
  const maxLogs = Math.max(...(weeklyForecast?.forecast.map(f => f.predictedLogs) || [1]));

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Top section: Tomorrow's demand */}
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 items-center">
        <Text className="text-gray-500 font-bold mb-2">TOMORROW'S PREDICTED LOAD</Text>
        <Text className="text-6xl font-black text-gray-800">{demandEstimate?.estimatedLogs}</Text>
        <Text className="text-gray-500 mb-4">Waste Logs</Text>

        <View className={`flex-row items-center px-3 py-2 rounded-full ${
          demandEstimate?.confidence === 'HIGH' ? 'bg-green-100' :
          demandEstimate?.confidence === 'MEDIUM' ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          <Ionicons name="information-circle" size={16} color={
            demandEstimate?.confidence === 'HIGH' ? '#15803d' :
            demandEstimate?.confidence === 'MEDIUM' ? '#a16207' : '#b91c1c'
          } />
          <Text className={`ml-2 text-xs font-bold ${
            demandEstimate?.confidence === 'HIGH' ? 'text-green-800' :
            demandEstimate?.confidence === 'MEDIUM' ? 'text-yellow-800' : 'text-red-800'
          }`}>
            {demandEstimate?.confidence === 'HIGH' ? 'Based on 14+ days of solid data' :
             demandEstimate?.confidence === 'MEDIUM' ? 'Based on 7-14 days of data' :
             'Not enough history yet (Low Confidence)'}
          </Text>
        </View>
      </View>

      {/* Warning banner */}
      {weeklyForecast?.dataQuality === 'INSUFFICIENT' && (
        <View className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <Text className="text-yellow-800 font-bold mb-1">⚠️ Limited Historical Data</Text>
          <Text className="text-yellow-700 text-sm">
            Keep collecting log data for more accurate and reliable future predictions.
          </Text>
        </View>
      )}

      <Text className="text-lg font-bold text-gray-800 mb-4">7-Day Load Forecast</Text>

      {/* Bar Chart Section */}
      <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
        {weeklyForecast?.forecast.map((day, idx) => {
          // Calculate width percentage (min 5% so bar is visible)
          const barWidth = Math.max(5, (day.predictedLogs / maxLogs) * 100);

          return (
            <View key={idx} className="mb-5">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-700 font-semibold">{day.dayLabel}</Text>
                <Text className="text-gray-500 font-bold">{day.predictedLogs}</Text>
              </View>
              
              <View className="h-4 bg-gray-100 rounded-full w-full flex-row">
                <View 
                  style={{ width: `${barWidth}%` }} 
                  className={`h-4 rounded-full ${day.hasScheduledPickup ? 'bg-green-500' : 'bg-gray-300'}`} 
                />
              </View>
              
              <View className="flex-row mt-1 flex-wrap">
                {day.hasScheduledPickup ? (
                  day.wasteCategories.map((cat, cIdx) => (
                    <View key={cIdx} className="bg-green-100 px-2 py-0.5 rounded mr-1 mt-1">
                      <Text className="text-green-800 text-xs font-bold">{cat}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-400 text-xs mt-1 italic">No pickup scheduled</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#4b5563', fontSize: 16 }
});

export default DemandForecastScreen;
