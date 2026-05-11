import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Animated, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { analyticsApi } from '../../../api/analytics.api';
import Svg, { Line, Circle, Polyline } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const ComplianceTrendScreen = ({ route }: any) => {
  const { zoneId } = route.params;
  const navigation = useNavigation();

  const { data: trend, isLoading, refetch, isFetching } = useQuery({
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
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Analyzing segregation accuracy...</Text>
      </SafeAreaView>
    );
  }

  const chartWidth = width - 72; // Adjusted padding
  const chartHeight = 160;

  const arrowRotation = arrowAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: ['0deg', '90deg', '180deg']
  });

  const arrowColor = trend?.trend === 'IMPROVING' ? '#10B981' : 
                     trend?.trend === 'DECLINING' ? '#EF4444' : '#64748B';

  const history = trend?.history || [0, 0, 0, 0];
  const maxVal = 100;
  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * chartWidth;
    const y = chartHeight - ((val / maxVal) * chartHeight);
    return { x, y, val };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compliance Trends</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Performance Card */}
        <View style={styles.heroCard}>
          <View style={styles.trendIconContainer}>
            <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
              <Ionicons name="arrow-up" size={48} color={arrowColor} />
            </Animated.View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>LAST WEEK</Text>
              <Text style={styles.statValueSmall}>{trend?.lastWeekRate}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>THIS WEEK</Text>
              <Text style={[styles.statValueLarge, { color: arrowColor }]}>{trend?.thisWeekRate}%</Text>
            </View>
          </View>

          <View style={[styles.changeBadge, {
            backgroundColor: trend?.trend === 'IMPROVING' ? '#ECFDF5' :
                             trend?.trend === 'DECLINING' ? '#FEF2F2' : '#F8FAFC'
          }]}>
            <Text style={[styles.changeText, {
              color: trend?.trend === 'IMPROVING' ? '#065F46' :
                     trend?.trend === 'DECLINING' ? '#991B1B' : '#475569'
            }]}>
              {trend?.changePercent !== undefined && trend.changePercent > 0 ? '+' : ''}
              {trend?.changePercent}% {trend?.trend === 'IMPROVING' ? 'Improvement' : 
                                       trend?.trend === 'DECLINING' ? 'Decline' : 'Stability'}
            </Text>
          </View>
        </View>

        {/* Data Visualization Section */}
        <Text style={styles.sectionTitle}>4-Week Performance</Text>
        <View style={styles.chartCard}>
          <View style={{ height: chartHeight + 40 }}>
            <Svg height={chartHeight} width={chartWidth}>
              {[0, 25, 50, 75, 100].map(v => (
                <Line 
                  key={v}
                  x1="0" 
                  y1={chartHeight - (v / 100) * chartHeight} 
                  x2={chartWidth} 
                  y2={chartHeight - (v / 100) * chartHeight} 
                  stroke="#F1F5F9" 
                  strokeWidth="1" 
                />
              ))}
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p, i) => (
                <Circle
                  key={`p-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#3B82F6"
                  strokeWidth="3"
                />
              ))}
            </Svg>
            <View style={styles.xAxis}>
              <Text style={styles.axisText}>Week 1</Text>
              <Text style={styles.axisText}>Week 2</Text>
              <Text style={styles.axisText}>Last Wk</Text>
              <Text style={[styles.axisText, { color: '#3B82F6', fontWeight: '800' }]}>Today</Text>
            </View>
          </View>
        </View>

        {/* AI Insight Section */}
        <Text style={styles.sectionTitle}>AI Insight Dashboard</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.aiIconBox}>
              <Ionicons name="sparkles" size={16} color="#8B5CF6" />
            </View>
            <Text style={styles.insightTitle}>Pattern Analysis</Text>
          </View>
          <Text style={styles.insightBody}>{trend?.insight}</Text>
          
          {trend?.trend === 'DECLINING' && (
            <View style={styles.recommendationBox}>
              <Ionicons name="bulb" size={16} color="#D97706" />
              <Text style={styles.recommendationText}>
                Identify residents in this zone who haven't logged waste recently. A targeted reminder often boosts compliance.
              </Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 24,
  },
  trendIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValueSmall: {
    fontSize: 24,
    fontWeight: '700',
    color: '#475569',
  },
  statValueLarge: {
    fontSize: 32,
    fontWeight: '900',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    elevation: 1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  axisText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  insightBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  recommendationBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default ComplianceTrendScreen;
