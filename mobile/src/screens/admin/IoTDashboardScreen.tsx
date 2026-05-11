import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
import { useZones } from '../../hooks/useZones';
import { useGenerateMockSensorData, useZoneSensorSummary } from '../../hooks/useIoT';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Ionicons } from '@expo/vector-icons';

export const IoTDashboardScreen = () => {
  const { data: zonesData, isLoading: zonesLoading, isError: zonesError, error: zonesErr, refetch: refetchZones } = useZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const { data: sensorData, isLoading: sensorLoading, refetch: refetchSensors } = useZoneSensorSummary(selectedZoneId || undefined);
  const generateMock = useGenerateMockSensorData();

  const zones = zonesData?.data || [];
  const selectedZone = useMemo(() => zones.find((z: any) => z.id === selectedZoneId) || zones[0], [zones, selectedZoneId]);

  // Set default zone
  React.useEffect(() => {
    if (zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones]);

  const bins = sensorData?.data || [];

  // Summary Logic
  const summary = useMemo(() => {
    const total = bins.length;
    const overfilled = bins.filter((b: any) => b.fillLevel > 85).length;
    const alerting = bins.filter((b: any) => b.fillLevel > 60 && b.fillLevel <= 85).length;
    return { total, overfilled, alerting };
  }, [bins]);

  const getFillColor = (level: number) => {
    if (level > 85) return '#EF4444'; // Red
    if (level > 60) return '#F59E0B'; // Orange
    return '#10B981'; // Emerald
  };

  const renderBinItem = ({ item }: { item: any }) => {
    const fillColor = getFillColor(item.fillLevel);
    return (
      <View style={styles.binCard}>
        <View style={styles.binHeader}>
          <View style={styles.binIdBadge}>
            <Ionicons name="cube-outline" size={14} color="#64748B" />
            <Text style={styles.binIdText}>#{item.binId.slice(-4).toUpperCase()}</Text>
          </View>
          <View style={styles.connectivity}>
            <Ionicons name="battery-full" size={14} color="#10B981" style={{ marginRight: 8 }} />
            <Ionicons name="cellular" size={14} color="#64748B" />
          </View>
        </View>

        <View style={styles.fillSection}>
          <View style={styles.fillTextContainer}>
            <Text style={styles.fillLabel}>Fill Level</Text>
            <Text style={[styles.fillValue, { color: fillColor }]}>{Math.round(item.fillLevel)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${Math.min(item.fillLevel, 100)}%`, backgroundColor: fillColor }
              ]} 
            />
          </View>
        </View>

        <View style={styles.binFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="thermometer-outline" size={12} color="#94A3B8" />
            <Text style={styles.footerText}>24°C</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text style={styles.footerText}>Last sync: Just now</Text>
          </View>
        </View>
      </View>
    );
  };

  if (zonesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 20 }}>
          <LoadingSkeleton height={60} borderRadius={12} />
          <View style={{ marginTop: 20, gap: 12 }}>
            <LoadingSkeleton height={100} borderRadius={20} />
            <LoadingSkeleton height={100} borderRadius={20} />
            <LoadingSkeleton height={100} borderRadius={20} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bin Monitor</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE SENSOR DATA</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.mockButton}
          onPress={() => selectedZoneId && generateMock.mutate(selectedZoneId)}
          disabled={generateMock.isPending || !selectedZoneId}
        >
          <Ionicons name="flash" size={16} color="#F59E0B" />
          <Text style={styles.mockButtonText}>
            {generateMock.isPending ? 'Syncing...' : 'Generate Mock'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.total}</Text>
          <Text style={styles.summaryLabel}>Total Bins</Text>
        </View>
        <View style={[styles.summaryItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' }]}>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{summary.overfilled}</Text>
          <Text style={styles.summaryLabel}>Overfilled</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{summary.alerting}</Text>
          <Text style={styles.summaryLabel}>Warning</Text>
        </View>
      </View>

      {/* Zone Pill Selector */}
      <View style={styles.zoneSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zoneScroll}>
          {zones.map((zone: any) => (
            <TouchableOpacity
              key={zone.id}
              onPress={() => setSelectedZoneId(zone.id)}
              style={[
                styles.zonePill,
                selectedZoneId === zone.id && styles.activeZonePill
              ]}
            >
              <Text style={[
                styles.zoneText,
                selectedZoneId === zone.id && styles.activeZoneText
              ]}>
                {zone.zoneName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={bins}
        keyExtractor={(item: any) => item.binId}
        renderItem={renderBinItem}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={
          <EmptyState
            emoji="📡"
            title="Searching for sensors..."
            subtitle="No bins connected in this zone yet."
          />
        }
      />
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  mockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  mockButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 6,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  zoneSelector: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  zoneScroll: {
    paddingHorizontal: 16,
  },
  zonePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeZonePill: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  zoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeZoneText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  binCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: width / 2 - 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  binHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  binIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  binIdText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    marginLeft: 4,
  },
  connectivity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fillSection: {
    marginBottom: 16,
  },
  fillTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  fillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  fillValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  binFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
    gap: 4,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '500',
  },
});
