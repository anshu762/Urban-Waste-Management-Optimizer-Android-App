import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyticsApi } from '../../../api/analytics.api';
import { getZonesApi } from '../../../api/zone.api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeableBottomSheet } from '../../../components/common/SwipeableBottomSheet';

const { width, height } = Dimensions.get('window');

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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: getZonesApi,
  });

  const zonesArray = zones?.data || zones || [];
  const activeZones = Array.isArray(zonesArray) ? zonesArray.filter((z: any) => z.isActive) : [];

  React.useEffect(() => {
    if (!selectedZone && activeZones.length > 0) {
      setSelectedZone(activeZones[0].id);
    }
  }, [activeZones, selectedZone]);

  const currentZoneData = activeZones.find((z: any) => z.id === selectedZone);

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
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Synthesizing Insights...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header - Clean Version */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Smart Insights</Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={10} color="#8B5CF6" />
            <Text style={styles.aiText}>AI-POWERED ANALYTICS</Text>
          </View>
        </View>
        {/* Right side icon removed as requested */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Premium Zone Selector Trigger */}
        <TouchableOpacity 
          style={styles.selectorTrigger}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.selectorIconBox}>
            <Ionicons name="location" size={18} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectorLabel}>SERVICE AREA</Text>
            <Text style={styles.selectorValue}>
              {currentZoneData ? `${currentZoneData.zoneName} (${currentZoneData.city})` : 'Select a Zone'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Insights Grid */}
        <View style={styles.grid}>
          {/* Card 1: Demand Forecast */}
          <TouchableOpacity 
            style={[styles.card, { borderColor: '#ECFDF5' }]}
            onPress={() => navigation.navigate('DemandForecast', { zoneId: selectedZone })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Demand Forecast</Text>
            {demandLoading ? <ActivityIndicator size="small" color="#10B981" /> : (
              <>
                <Text style={styles.cardValue}>{demandEstimate?.estimatedLogs || 0}</Text>
                <Text style={styles.cardSubValue}>EST. LOGS TOMORROW</Text>
                <View style={[styles.badge, { 
                  backgroundColor: demandEstimate?.confidence === 'HIGH' ? '#ECFDF5' : 
                                   demandEstimate?.confidence === 'MEDIUM' ? '#FFFBEB' : '#FEF2F2'
                }]}>
                  <Text style={[styles.badgeText, {
                    color: demandEstimate?.confidence === 'HIGH' ? '#059669' : 
                           demandEstimate?.confidence === 'MEDIUM' ? '#D97706' : '#DC2626'
                  }]}>{demandEstimate?.confidence || 'UNKNOWN'}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Card 2: Zone Rankings */}
          <TouchableOpacity 
            style={[styles.card, { borderColor: '#F5F3FF' }]}
            onPress={() => navigation.navigate('ZoneRanking')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="trophy" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.cardTitle}>Zone Rankings</Text>
            {rankLoading ? <ActivityIndicator size="small" color="#8B5CF6" /> : (
              <>
                <View style={styles.rankingList}>
                  {Array.isArray(zoneRankings) && zoneRankings.slice(0, 3).map((zone: any, idx: number) => (
                    <View key={zone.zoneId} style={styles.rankItem}>
                      <Text style={styles.rankText} numberOfLines={1}>{idx+1}. {zone.zoneName}</Text>
                      <Text style={styles.rankScore}>{zone.totalScore}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.cardSubValue}>TOP PRIORITY AREAS</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Card 3: Compliance Trend */}
          <TouchableOpacity 
            style={[styles.card, { borderColor: '#EFF6FF' }]}
            onPress={() => navigation.navigate('ComplianceTrend', { zoneId: selectedZone })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="leaf" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Compliance</Text>
            {trendLoading ? <ActivityIndicator size="small" color="#3B82F6" /> : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.cardValue, { color: '#3B82F6' }]}>{complianceTrend?.thisWeekRate || 0}%</Text>
                  <Ionicons 
                    name={complianceTrend?.trend === 'IMPROVING' ? 'arrow-up' : complianceTrend?.trend === 'DECLINING' ? 'arrow-down' : 'remove'} 
                    size={14} 
                    color={complianceTrend?.trend === 'IMPROVING' ? '#10B981' : '#EF4444'} 
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <Text style={styles.cardSubValue}>SEGREGATION ACCURACY</Text>
                <Text style={styles.insightText} numberOfLines={2}>{complianceTrend?.insight}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Card 4: Inactive Residents */}
          <TouchableOpacity 
            style={[styles.card, { borderColor: '#FDF2F8' }]}
            onPress={() => navigation.navigate('InactiveResidents', { zoneId: selectedZone })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
              <Ionicons name="people" size={20} color="#EC4899" />
            </View>
            <Text style={styles.cardTitle}>Inactive Users</Text>
            {inactiveLoading ? <ActivityIndicator size="small" color="#EC4899" /> : (
              <>
                <Text style={[styles.cardValue, { color: '#EC4899' }]}>{inactiveResidents?.totalInactive || 0}</Text>
                <Text style={styles.cardSubValue}>OUT OF {inactiveResidents?.totalResidents || 0} TOTAL</Text>
                <View style={[styles.badge, { backgroundColor: '#FDF2F8', marginTop: 12 }]}>
                  <Text style={[styles.badgeText, { color: '#BE185D' }]}>ACTION REQUIRED</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Ionicons name="shield-checkmark" size={12} color="#94A3B8" />
          <Text style={styles.footerText}>Insights are generated based on historical waste logging patterns.</Text>
        </View>
      </ScrollView>

      {/* Premium Zone Selection Modal */}
      <SwipeableBottomSheet visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <View style={{ padding: 20 }}>
          <Text style={styles.modalTitle}>Select Service Area</Text>
          <FlatList
            data={activeZones}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.zoneItem,
                  selectedZone === item.id && styles.activeZoneItem
                ]}
                onPress={() => {
                  setSelectedZone(item.id);
                  setIsModalVisible(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.zoneItemName,
                    selectedZone === item.id && styles.activeZoneItemText
                  ]}>{item.zoneName}</Text>
                  <Text style={styles.zoneItemCity}>{item.city}</Text>
                </View>
                {selectedZone === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </SwipeableBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  aiText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
    marginLeft: 4,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
  },
  selectorTrigger: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  selectorIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: width / 2 - 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
  },
  cardSubValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rankingList: {
    marginTop: 4,
    marginBottom: 12,
  },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rankText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  rankScore: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  insightText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeZoneItem: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  zoneItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  activeZoneItemText: {
    color: '#065F46',
  },
  zoneItemCity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

export default AnalyticsHomeScreen;
