import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDriverRoutes } from '../../hooks/useDriver';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { parseError } from '../../lib/error-parser';

const TAB_OPTIONS = ['Today', 'Upcoming', 'Past'];

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  ASSIGNED: { label: 'Assigned', bg: '#EFF6FF', text: '#2563EB' },
  IN_PROGRESS: { label: 'Active', bg: '#ECFDF5', text: '#059669' },
  COMPLETED: { label: 'Done', bg: '#F8FAFC', text: '#64748B' },
  DRAFT: { label: 'Draft', bg: '#F8FAFC', text: '#94A3B8' },
};

const DriverRoutesScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState(0);
  const { data, isLoading, isError, error, refetch, isRefetching } = useDriverRoutes();

  const allRoutes = data?.data || [];
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredRoutes = allRoutes.filter((r: any) => {
    const routeDate = r.routeDate?.split('T')[0];
    if (tab === 0) return routeDate === todayStr;
    if (tab === 1) return routeDate > todayStr;
    return routeDate < todayStr;
  });

  const getCardStyle = (status: string) => {
    if (status === 'IN_PROGRESS') return styles.routeCardActive;
    if (status === 'COMPLETED') return styles.routeCardDone;
    return styles.routeCard;
  };

  const renderItem = ({ item }: { item: any }) => {
    const cfg = statusConfig[item.status] || statusConfig.DRAFT;
    const completed = item.routeStops?.filter((s: any) => s.stopStatus === 'COMPLETED').length || 0;
    const total = item.totalEstimatedStops || item.routeStops?.length || 0;

    return (
      <TouchableOpacity
        style={[styles.routeCard, getCardStyle(item.status)]}
        onPress={() => navigation.navigate('DriverRoot', { screen: 'DriverHome' })}
        activeOpacity={0.7}
      >
        <View style={styles.routeTop}>
          <View style={styles.routeLeft}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>
                {new Date(item.routeDate).getDate()}
              </Text>
              <Text style={styles.dateMonth}>
                {new Date(item.routeDate).toLocaleDateString('en-IN', { month: 'short' })}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.zoneName}>{item.zone?.zoneName || 'Unknown Zone'}</Text>
              <View style={styles.stopsRow}>
                <Ionicons name="flag-outline" size={12} color="#94A3B8" />
                <Text style={styles.stopsText}>
                  {completed}/{total} stops
                </Text>
                {item.vehicle?.vehicleNumber ? (
                  <>
                    <Ionicons name="bus-outline" size={12} color="#94A3B8" style={{ marginLeft: 12 }} />
                    <Text style={styles.stopsText}>{item.vehicle.vehicleNumber}</Text>
                  </>
                ) : null}
              </View>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        {item.status === 'IN_PROGRESS' && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completed / total) * 100}%` }]} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <View style={{ gap: 12, paddingHorizontal: 16, paddingTop: 16 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.routeCard}>
          <LoadingSkeleton height={70} borderRadius={16} />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Routes</Text>
      </View>

      {/* Segmented Tabs */}
      <View style={styles.tabRow}>
        {TAB_OPTIONS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, i === tab && styles.tabActive]}
            onPress={() => setTab(i)}
          >
            <Text style={[styles.tabText, i === tab && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : isError ? (
        <View style={{ padding: 16 }}>
          <ErrorCard error={parseError(error)} onRetry={refetch} />
        </View>
      ) : (
        <FlatList
          data={filteredRoutes}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} tintColor="#10B981" />
          }
          ListEmptyComponent={
            <EmptyState
              emoji=""
              title={
                tab === 0
                  ? 'No Routes Today'
                  : tab === 1
                    ? 'No Upcoming Routes'
                    : 'No Past Routes'
              }
              subtitle={
                tab === 0
                  ? 'You have no pickup routes scheduled for today.'
                  : tab === 1
                    ? 'No future routes have been assigned to you yet.'
                    : 'Your completed route history will appear here.'
              }
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { fontWeight: '800', color: '#0F172A' },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  routeCardActive: {
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  routeCardDone: {
    opacity: 0.8,
  },
  routeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateDay: { fontSize: 18, fontWeight: '900', color: '#0F172A', lineHeight: 22 },
  dateMonth: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  zoneName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  stopsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stopsText: { fontSize: 11, color: '#64748B', fontWeight: '600', marginLeft: 4 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});

export default DriverRoutesScreen;
