import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { analyticsApi } from '../../../api/analytics.api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DemandForecastScreen = ({ route }: any) => {
  const { zoneId } = route.params;
  const navigation = useNavigation();

  const { data: demandEstimate, isLoading: demandLoading, refetch: refetchDemand, isFetching: isFetchingDemand } = useQuery({
    queryKey: ['demandEstimate', zoneId],
    queryFn: () => analyticsApi.getDemandEstimate(zoneId),
  });

  const { data: weeklyForecast, isLoading: forecastLoading, refetch: refetchForecast, isFetching: isFetchingForecast } = useQuery({
    queryKey: ['weeklyForecast', zoneId],
    queryFn: () => analyticsApi.getWeeklyForecast(zoneId),
  });

  const isRefreshing = isFetchingDemand || isFetchingForecast;

  const handleRefresh = () => {
    refetchDemand();
    refetchForecast();
  };

  if (demandLoading || forecastLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Projecting future load...</Text>
      </SafeAreaView>
    );
  }

  const maxLogs = Math.max(...(weeklyForecast?.forecast.map(f => f.predictedLogs) || [1]));

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demand Forecast</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Prediction Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Ionicons name="sparkles" size={16} color="#8B5CF6" />
            <Text style={styles.heroLabel}>TOMORROW'S PREDICTION</Text>
          </View>
          <Text style={styles.heroValue}>{demandEstimate?.estimatedLogs}</Text>
          <Text style={styles.heroUnit}>Expected Waste Logs</Text>

          <View style={[styles.confidenceBadge, {
            backgroundColor: demandEstimate?.confidence === 'HIGH' ? '#ECFDF5' :
                             demandEstimate?.confidence === 'MEDIUM' ? '#FFFBEB' : '#FEF2F2'
          }]}>
            <Ionicons name="shield-checkmark" size={14} color={
              demandEstimate?.confidence === 'HIGH' ? '#059669' :
              demandEstimate?.confidence === 'MEDIUM' ? '#D97706' : '#DC2626'
            } />
            <Text style={[styles.confidenceText, {
              color: demandEstimate?.confidence === 'HIGH' ? '#065F46' :
                     demandEstimate?.confidence === 'MEDIUM' ? '#92400E' : '#991B1B'
            }]}>
              {demandEstimate?.confidence} RELIABILITY
            </Text>
          </View>
        </View>

        {/* Forecast Timeline */}
        <Text style={styles.sectionTitle}>7-Day Outlook</Text>
        <View style={styles.forecastList}>
          {weeklyForecast?.forecast.map((day, idx) => {
            const barWidth = Math.max(8, (day.predictedLogs / maxLogs) * 100);
            return (
              <View key={idx} style={styles.forecastItem}>
                <View style={styles.forecastTop}>
                  <Text style={styles.dayLabel}>{day.dayLabel}</Text>
                  <View style={styles.predictedGroup}>
                    <Text style={styles.predictedValue}>{day.predictedLogs}</Text>
                    <Text style={styles.predictedUnit}>logs</Text>
                  </View>
                </View>

                <View style={styles.barContainer}>
                  <View style={[styles.barBg]}>
                    <View 
                      style={[
                        styles.barFill, 
                        { width: `${barWidth}%`, backgroundColor: day.hasScheduledPickup ? '#10B981' : '#E2E8F0' }
                      ]} 
                    />
                  </View>
                </View>

                <View style={styles.categoryContainer}>
                  {day.hasScheduledPickup ? (
                    day.wasteCategories.map((cat, cIdx) => (
                      <View key={cIdx} style={styles.catBadge}>
                        <Text style={styles.catText}>{cat}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noPickupText}>No collection scheduled</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Data Quality Warning */}
        {weeklyForecast?.dataQuality === 'INSUFFICIENT' && (
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={18} color="#D97706" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.warningTitle}>Initial Phase Insights</Text>
              <Text style={styles.warningText}>
                We are still gathering historical patterns. Predictions will become more accurate as residents log more waste.
              </Text>
            </View>
          </View>
        )}
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
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B5CF6',
    marginLeft: 6,
    letterSpacing: 1,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroUnit: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 16,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  forecastList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  forecastItem: {
    marginBottom: 24,
  },
  forecastTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  predictedGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  predictedValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  predictedUnit: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 2,
    fontWeight: '600',
  },
  barContainer: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barBg: {
    flex: 1,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  catBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  catText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  noPickupText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
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
});

export default DemandForecastScreen;
