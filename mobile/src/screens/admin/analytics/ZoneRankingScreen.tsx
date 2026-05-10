import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { analyticsApi } from '../../../api/analytics.api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const ZoneRankingScreen = () => {
  const navigation = useNavigation();
  const { data: rankings, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['zoneRankings'],
    queryFn: analyticsApi.getZoneRankings,
  });

  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Calculating priorities...</Text>
      </SafeAreaView>
    );
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#EF4444'; // Top Priority - Red
    if (rank === 2) return '#F59E0B'; // High - Orange
    if (rank === 3) return '#8B5CF6'; // Medium - Purple
    return '#64748B'; // Normal - Slate
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return '#FEF2F2';
    if (rank === 2) return '#FFFBEB';
    if (rank === 3) return '#F5F3FF';
    return '#F8FAFC';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Zone Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Operational Priority Ranking</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => refetch()} disabled={isFetching}>
          {isFetching ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <Ionicons name="refresh-outline" size={18} color="#0F172A" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {rankings?.map((zone) => {
          const isExpanded = expandedZone === zone.zoneId;
          const rankColor = getRankColor(zone.rank);
          const rankBg = getRankBg(zone.rank);

          return (
            <TouchableOpacity 
              key={zone.zoneId}
              activeOpacity={0.8}
              onPress={() => setExpandedZone(isExpanded ? null : zone.zoneId)}
              style={[
                styles.rankCard,
                isExpanded && styles.expandedCard,
                { borderLeftColor: rankColor, borderLeftWidth: 4 }
              ]}
            >
              <View style={styles.cardMain}>
                <View style={[styles.rankBadge, { backgroundColor: rankBg }]}>
                  <Text style={[styles.rankText, { color: rankColor }]}>#{zone.rank}</Text>
                </View>
                
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName} numberOfLines={1}>{zone.zoneName}</Text>
                  <Text style={styles.recommendation} numberOfLines={1}>
                    {zone.recommendation}
                  </Text>
                </View>

                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>SCORE</Text>
                  <Text style={styles.scoreValue}>{zone.totalScore}</Text>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.breakdownContainer}>
                  <Text style={styles.breakdownTitle}>Priority Breakdown</Text>
                  
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownLabelGroup}>
                      <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                      <Text style={styles.breakdownLabel}>Complaints ({zone.breakdown.openComplaints})</Text>
                    </View>
                    <Text style={styles.breakdownScore}>+{zone.breakdown.complaintsScore}</Text>
                  </View>
                  
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownLabelGroup}>
                      <Ionicons name="leaf-outline" size={14} color="#10B981" />
                      <Text style={styles.breakdownLabel}>Ready Logs ({zone.breakdown.readyLogs})</Text>
                    </View>
                    <Text style={styles.breakdownScore}>+{zone.breakdown.logsScore}</Text>
                  </View>
                  
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownLabelGroup}>
                      <Ionicons name="water-outline" size={14} color="#3B82F6" />
                      <Text style={styles.breakdownLabel}>Wet Waste ({zone.breakdown.wetWasteCount})</Text>
                    </View>
                    <Text style={styles.breakdownScore}>+{zone.breakdown.wetScore}</Text>
                  </View>
                  
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Score</Text>
                    <Text style={styles.totalValue}>{zone.totalScore}</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      (navigation as any).navigate('AdminRoot', {
                        screen: 'RouteManagement',
                        params: { preselectedZoneId: zone.zoneId }
                      });
                    }}
                  >
                    <Ionicons name="map" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Generate Optimized Route</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  headerSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  rankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  expandedCard: {
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  cardMain: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '900',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  recommendation: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
    fontStyle: 'italic',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  breakdownContainer: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 8,
  },
  breakdownScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  actionButton: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ZoneRankingScreen;
