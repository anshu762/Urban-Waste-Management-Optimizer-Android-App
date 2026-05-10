import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Animated, StyleSheet, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { analyticsApi } from '../../../api/analytics.api';
import Svg, { Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';

type RootStackParamList = {
  ComplianceTrend: { zoneId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ComplianceTrend'>;

export const ComplianceTrendScreen: React.FC<any> = ({ route }) => {
  const { zoneId } = route.params;

  const { data: trend, isLoading } = useQuery({
    queryKey: ['complianceTrend', zoneId],
    queryFn: () => analyticsApi.getComplianceTrend(zoneId),
  });

  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trend) {
      let toValue = 0;
      if (trend.trend === 'DECLINING') toValue = 180;
      else if (trend.trend === 'STABLE') toValue = 90;

      Animated.timing(arrowAnim, {
        toValue,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [trend, arrowAnim]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Analyzing Compliance Data...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Padding
  const chartHeight = 150;

  const arrowRotation = arrowAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: ['0deg', '90deg', '180deg']
  });

  const arrowColor = trend?.trend === 'IMPROVING' ? '#22c55e' : 
                     trend?.trend === 'DECLINING' ? '#ef4444' : '#9ca3af';

  // SVG Chart Calculation
  const history = trend?.history || [0, 0, 0, 0];
  const maxVal = 100;
  
  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * chartWidth;
    const y = chartHeight - ((val / maxVal) * chartHeight);
    return { x, y, val };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Segregation Compliance</Text>

      {/* Big Trend Display */}
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 items-center">
        <Animated.Text style={{ fontSize: 60, color: arrowColor, transform: [{ rotate: arrowRotation }] }}>
          ↑
        </Animated.Text>
        
        <View className="flex-row justify-around w-full mt-4">
          <View className="items-center">
            <Text className="text-gray-500 text-sm font-bold">LAST WEEK</Text>
            <Text className="text-3xl font-black text-gray-700">{trend?.lastWeekRate}%</Text>
          </View>
          <View className="w-[1px] bg-gray-200" />
          <View className="items-center">
            <Text className="text-gray-500 text-sm font-bold">THIS WEEK</Text>
            <Text className={`text-3xl font-black ${
              trend?.trend === 'IMPROVING' ? 'text-green-600' :
              trend?.trend === 'DECLINING' ? 'text-red-600' : 'text-gray-700'
            }`}>{trend?.thisWeekRate}%</Text>
          </View>
        </View>

        <View className={`mt-6 px-4 py-2 rounded-full ${
          trend?.trend === 'IMPROVING' ? 'bg-green-100' :
          trend?.trend === 'DECLINING' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <Text className={`font-bold ${
            trend?.trend === 'IMPROVING' ? 'text-green-800' :
            trend?.trend === 'DECLINING' ? 'text-red-800' : 'text-gray-800'
          }`}>
            {trend?.changePercent !== undefined && trend.changePercent > 0 ? '+' : ''}
            {trend?.changePercent}% {trend?.trend === 'IMPROVING' ? 'improvement 🎉' : 
                                     trend?.trend === 'DECLINING' ? 'decline' : 'change'}
          </Text>
        </View>
      </View>

      {/* SVG Line Chart */}
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <Text className="text-sm font-bold text-gray-500 mb-4">4-WEEK COMPLIANCE TREND</Text>
        
        <View style={{ height: chartHeight + 20, width: chartWidth }}>
          <Svg height={chartHeight} width={chartWidth}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(v => (
              <Line 
                key={v}
                x1="0" 
                y1={chartHeight - (v / 100) * chartHeight} 
                x2={chartWidth} 
                y2={chartHeight - (v / 100) * chartHeight} 
                stroke="#f3f4f6" 
                strokeWidth="1" 
              />
            ))}
            
            {/* The line */}
            <Polyline
              points={polylinePoints}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
            
            {/* The dots */}
            {points.map((p, i) => (
              <Circle
                key={`p-${i}`}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#fff"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            ))}
          </Svg>
          
          {/* X-axis labels */}
          <View className="flex-row justify-between mt-2">
            <Text className="text-xs text-gray-400">Week 1</Text>
            <Text className="text-xs text-gray-400">Week 2</Text>
            <Text className="text-xs text-gray-400">Last Wk</Text>
            <Text className="text-xs text-blue-500 font-bold">This Wk</Text>
          </View>
        </View>
      </View>

      {/* Insight Card */}
      <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <Text className="text-lg font-bold text-gray-800 mb-2">AI Insight</Text>
        <Text className="text-gray-700 leading-6">{trend?.insight}</Text>
        
        {trend?.trend === 'DECLINING' && (
          <View className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 text-sm">
              <Text className="font-bold">💡 Tip:</Text> Send a reminder notification to residents about proper segregation. Go to "Inactive Users" to identify who might need a nudge.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#4b5563', fontSize: 16 }
});

export default ComplianceTrendScreen;
