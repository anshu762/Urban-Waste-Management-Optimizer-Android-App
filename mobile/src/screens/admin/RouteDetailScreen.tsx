import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutePlanById, useAssignRoute } from '../../hooks/useRoutes';
import { useVehicles } from '../../hooks/useVehicles';
import { getDriversApi } from '../../api/user.api';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { FullScreenError } from '../../components/common/FullScreenError';
import { parseError } from '../../lib/error-parser';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { SwipeableBottomSheet } from '../../components/common/SwipeableBottomSheet';

const { width, height } = Dimensions.get('window');

const RouteDetailScreen = ({ route, navigation }: any) => {
  const { routeId } = route.params;
  const { showError, showSuccess } = useErrorHandler();
  const { data: planData, isLoading, isError, error, refetch } = useRoutePlanById(routeId);
  const { data: vehiclesData, isError: vehiclesError, error: vehiclesErr, refetch: refetchVehicles } = useVehicles();
  const assignRoute = useAssignRoute();

  const { data: driversData, isLoading: driversLoading, isError: driversError, error: driversErr, refetch: refetchDrivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDriversApi,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Syncing mission details...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return <FullScreenError error={parseError(error)} onRetry={refetch} />;
  }

  const plan = planData?.data;
  const drivers = driversData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const handleAssign = async () => {
    if (!selectedDriverId || !selectedVehicleId) {
      return Alert.alert('Error', 'Please select both a driver and a vehicle');
    }

    try {
      await assignRoute.mutateAsync({
        id: routeId,
        data: {
          driverProfileId: selectedDriverId,
          vehicleId: selectedVehicleId,
        }
      });
      showSuccess('Route assigned successfully!');
      setModalVisible(false);
      refetch();
    } catch (err: any) {
      showError(err);
    }
  };

  const renderStopItem = (item: any, isLast: boolean) => {
    const resident = item.residentProfile;
    const address = `${resident.houseNumber || ''}, ${resident.buildingName || ''}, ${resident.block || ''}`;
    
    return (
      <View key={item.id} style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.orderCircle, { backgroundColor: item.stopStatus === 'COMPLETED' ? '#10B981' : '#F1F5F9' }]}>
            {item.stopStatus === 'COMPLETED' ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : (
              <Text style={styles.orderText}>{item.stopOrder}</Text>
            )}
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        <View style={styles.stopCard}>
          <View style={styles.stopHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.residentName}>{resident.user?.fullName}</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={12} color="#94A3B8" />
                <Text style={styles.addressText} numberOfLines={1}>{address}</Text>
              </View>
            </View>
            <View style={[styles.stopStatusBadge, { backgroundColor: item.stopStatus === 'COMPLETED' ? '#ECFDF5' : '#FFFBEB' }]}>
              <Text style={[styles.stopStatusText, { color: item.stopStatus === 'COMPLETED' ? '#059669' : '#D97706' }]}>
                {item.stopStatus}
              </Text>
            </View>
          </View>

          <View style={styles.stopFooter}>
            <View style={styles.prioBadge}>
              <Text style={styles.prioText}>Prio: {item.priorityScore}</Text>
            </View>
            <TouchableOpacity style={styles.contactBtn}>
              <Ionicons name="call" size={12} color="#10B981" />
              <Text style={styles.contactBtnText}>CONTACT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const getStatusStep = (status: string) => {
    if (status === 'DRAFT') return 1;
    if (status === 'ASSIGNED') return 2;
    if (status === 'IN_PROGRESS') return 3;
    if (status === 'COMPLETED') return 4;
    return 1;
  };

  const currentStep = getStatusStep(plan?.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Mission Details</Text>
          <Text style={styles.headerSubtitle}>#{plan?.id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Tracker */}
        <View style={styles.trackerContainer}>
          <View style={styles.trackerLine}>
            <View style={[styles.trackerFill, { width: `${(currentStep - 1) * 33.3}%` }]} />
          </View>
          <View style={styles.trackerSteps}>
            {['Draft', 'Assigned', 'Active', 'Done'].map((s, i) => (
              <View key={s} style={styles.stepItem}>
                <View style={[
                  styles.stepDot, 
                  currentStep > i && styles.activeStepDot,
                  currentStep === i + 1 && styles.currentStepDot
                ]} />
                <Text style={[styles.stepLabel, currentStep > i && styles.activeStepLabel]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hero Logistics Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroMain}>
              <Text style={styles.heroLabel}>DATE</Text>
              <Text style={styles.heroValue}>{format(new Date(plan?.routeDate), 'dd MMM yyyy')}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: '#F8FAFC' }]}>
              <Text style={styles.statusTagText}>{plan?.status}</Text>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.statLabel}>STOPS</Text>
              <Text style={styles.statValue}>{plan?.totalEstimatedStops}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.statLabel}>PRIORITY</Text>
              <Text style={styles.statValue}>{plan?.totalPriorityScore}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.statLabel}>VEHICLE</Text>
              <Text style={styles.statValue}>{plan?.vehicle?.vehicleNumber || '---'}</Text>
            </View>
          </View>
        </View>

        {/* Deployment Section */}
        {plan?.status !== 'DRAFT' ? (
          <View style={styles.deploymentSection}>
            <Text style={styles.sectionTitle}>DEPLOYED PERSONNEL</Text>
            <View style={styles.personnelCard}>
              <View style={styles.personRow}>
                <View style={styles.personIcon}>
                  <Ionicons name="person" size={16} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.personRole}>Primary Driver</Text>
                  <Text style={styles.personName}>{plan?.driverProfile?.user?.fullName}</Text>
                </View>
              </View>
              <View style={[styles.personRow, { marginTop: 16 }]}>
                <View style={[styles.personIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="bus" size={16} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.personRole}>Assigned Vehicle</Text>
                  <Text style={styles.personName}>{plan?.vehicle?.vehicleNumber} ({plan?.vehicle?.type})</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.assignHeroBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.assignHeroText}>Assign Personnel to Start</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>MISSION TIMELINE</Text>
        <View style={styles.timelineContainer}>
          {plan?.routeStops?.map((item: any, index: number) => (
            renderStopItem(item, index === plan.routeStops.length - 1)
          ))}

          {(!plan?.routeStops || plan.routeStops.length === 0) && (
            <EmptyState emoji="🗺️" title="No stops defined" subtitle="Generate a route with ready households to create stops." />
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Premium Assign Modal */}
      <SwipeableBottomSheet visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={{ padding: 24 }}>
          <Text style={styles.modalTitle}>Assign Mission</Text>
          <Text style={styles.modalSubtitle}>Deploy personnel and fleet</Text>

          <Text style={styles.modalSectionLabel}>1. SELECT PRIMARY DRIVER</Text>
          {driversLoading ? <ActivityIndicator color="#10B981" /> : (
            <View style={styles.selectionGrid}>
              {drivers.map((d: any) => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setSelectedDriverId(d.id)}
                  style={[
                    styles.selectionPill,
                    selectedDriverId === d.id && styles.activePill
                  ]}
                >
                  <Text style={[styles.pillText, selectedDriverId === d.id && styles.activePillText]}>{d.user.fullName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.modalSectionLabel, { marginTop: 24 }]}>2. SELECT FLEET VEHICLE</Text>
          <View style={styles.selectionGrid}>
            {vehicles.filter((v: any) => v.isActive).map((v: any) => (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVehicleId(v.id)}
                style={[
                  styles.selectionPill,
                  selectedVehicleId === v.id && styles.activePill
                ]}
              >
                <Text style={[styles.pillText, selectedVehicleId === v.id && styles.activePillText]}>{v.vehicleNumber}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            onPress={handleAssign}
            disabled={assignRoute.isPending}
            style={[styles.confirmBtn, assignRoute.isPending && { opacity: 0.8 }]}
          >
            {assignRoute.isPending ? <ActivityIndicator color="white" /> : (
              <Text style={styles.confirmBtnText}>CONFIRM DEPLOYMENT</Text>
            )}
          </TouchableOpacity>
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
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
  },
  trackerContainer: {
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  trackerLine: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: 20,
    right: 20,
  },
  trackerFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  trackerSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  activeStepDot: {
    borderColor: '#10B981',
  },
  currentStepDot: {
    backgroundColor: '#10B981',
    borderColor: '#D1FAE5',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  activeStepLabel: {
    color: '#0F172A',
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 20,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 16,
  },
  deploymentSection: {
    marginBottom: 32,
  },
  personnelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  personRole: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  personName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  assignHeroBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  assignHeroText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 12,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
    marginRight: 10,
  },
  orderCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  orderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  stopCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  residentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  addressText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '500',
  },
  stopStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stopStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  stopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  prioBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prioText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    marginLeft: 4,
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
    maxHeight: height * 0.8,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 16,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectionPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginRight: 8,
    marginBottom: 8,
  },
  activePill: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  confirmBtn: {
    marginTop: 24,
    backgroundColor: '#0F172A',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
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

export default RouteDetailScreen;
