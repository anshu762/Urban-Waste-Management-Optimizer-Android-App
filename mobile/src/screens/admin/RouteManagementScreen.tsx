import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Modal, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGenerateRoute, useRoutePlans } from '../../hooks/useRoutes';
import { useZones } from '../../hooks/useZones';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { width, height } = Dimensions.get('window');

const RouteManagementScreen = ({ route, navigation }: any) => {
  const { preselectedZoneId } = route?.params || {};
  const { showError, showSuccess } = useErrorHandler();
  const { data: zonesData, isLoading: zonesLoading, isError: zonesError, refetch: refetchZones } = useZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(preselectedZoneId || null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { data: plansData, isLoading: plansLoading, isError: plansError, error: plansErr, refetch, isFetching } = useRoutePlans({ 
    zoneId: selectedZoneId || '' 
  });
  
  const generateRoute = useGenerateRoute();

  useEffect(() => {
    if (preselectedZoneId) {
      setSelectedZoneId(preselectedZoneId);
    }
  }, [preselectedZoneId]);

  useEffect(() => {
    if (zonesData?.data?.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zonesData.data[0].id);
    }
  }, [zonesData]);

  const activeZones = zonesData?.data || [];
  const currentZoneData = activeZones.find((z: any) => z.id === selectedZoneId);

  const handleGenerate = async () => {
    if (!selectedZoneId) return showError('Please select a zone first');
    
    try {
      await generateRoute.mutateAsync({ zoneId: selectedZoneId });
      showSuccess('Route plan generated successfully');
      refetch();
    } catch (err: any) {
      showError(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return '#3B82F6';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'COMPLETED': return '#10B981';
      default: return '#64748B';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return '#EFF6FF';
      case 'IN_PROGRESS': return '#FFFBEB';
      case 'COMPLETED': return '#ECFDF5';
      default: return '#F8FAFC';
    }
  };

  const renderRouteItem = ({ item }: any) => {
    const statusColor = getStatusColor(item.status);
    const statusBg = getStatusBg(item.status);
    const routeDate = new Date(item.routeDate);
    const dateLabel = format(routeDate, 'dd MMM yyyy');
    const stops = item.totalEstimatedStops;
    const driver = item.driverProfile?.user?.fullName;
    const vehicle = item.vehicle?.vehicleNumber;

    return (
      <TouchableOpacity
        style={styles.routeCard}
        onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
          <View style={styles.dateGroup}>
            <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
            <Text style={styles.dateText}>{dateLabel}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stops}</Text>
            <Text style={styles.statLabel}>{stops === 1 ? 'STOP' : 'STOPS'}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' }]}>
            <Text style={[styles.statValue, { color: '#0F172A' }]}>{item.totalPriorityScore}</Text>
            <Text style={styles.statLabel}>PRIORITY</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#8B5CF6' }]}>AI</Text>
            <Text style={styles.statLabel}>OPTIMIZED</Text>
          </View>
        </View>

        <View style={[styles.assignmentBox, { backgroundColor: driver ? '#F8FAFC' : '#FFFBEB' }]}>
          <Ionicons
            name={driver ? 'person-circle-outline' : 'help-circle-outline'}
            size={18}
            color={driver ? '#475569' : '#D97706'}
          />
          <Text style={[styles.assignmentText, { color: driver ? '#475569' : '#B45309' }]}>
            {driver
              ? `${driver}  •  ${vehicle || 'No vehicle'}`
              : 'Requires Personnel Assignment'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerAction}>View Full Logistics Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#10B981" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Route Planning</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>OPERATIONS ACTIVE</Text>
          </View>
        </View>
      </View>

      <View style={styles.selectorWrapper}>
        <TouchableOpacity 
          style={styles.selectorTrigger}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="location" size={18} color="#10B981" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.selectorLabel}>OPTIMIZATION ZONE</Text>
            <Text style={styles.selectorValue}>
              {currentZoneData ? `${currentZoneData.zoneName} (${currentZoneData.city})` : 'Select a Zone'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optimizeButton, (!selectedZoneId || generateRoute.isPending) && { opacity: 0.7 }]}
          onPress={handleGenerate}
          disabled={generateRoute.isPending || !selectedZoneId}
        >
          {generateRoute.isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="flash" size={16} color="white" />
              <Text style={styles.optimizeText}>GENERATE SMART ROUTE</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {plansLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Syncing logistics data...</Text>
        </View>
      ) : plansError ? (
        <ErrorCard error={parseError(plansErr)} onRetry={refetch} />
      ) : (
        <FlatList
          data={plansData?.data || []}
          keyExtractor={(item) => item.id}
          renderItem={renderRouteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              emoji="🗺️"
              title={selectedZoneId ? 'No active routes' : 'Ready for planning'}
              subtitle={selectedZoneId ? 'Tap Generate to optimize collection for this zone.' : 'Select a zone to begin route optimization.'}
            />
          }
        />
      )}

      {/* Zone Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Service Areas</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={activeZones}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.zoneItem,
                    selectedZoneId === item.id && styles.activeZoneItem
                  ]}
                  onPress={() => {
                    setSelectedZoneId(item.id);
                    setIsModalVisible(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.zoneItemName,
                      selectedZoneId === item.id && styles.activeZoneItemText
                    ]}>{item.zoneName}</Text>
                    <Text style={styles.zoneItemCity}>{item.city}</Text>
                  </View>
                  {selectedZoneId === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    gap: 12,
  },
  backBtn: {
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  selectorWrapper: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  selectorLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  optimizeButton: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optimizeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  assignmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  assignmentText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  footerAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginRight: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
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

export default RouteManagementScreen;
