import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth.store';
import { useTodayRoute, useMarkRouteInProgress, useMarkRouteComplete, useUpdateStop } from '../../hooks/useDriver';
import { ProgressRing } from '../../components/driver/ProgressRing';
import { StopDetailModal } from '../../components/driver/StopDetailModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorCard } from '../../components/common/ErrorCard';
import { EmptyState } from '../../components/common/EmptyState';
import { parseError } from '../../lib/error-parser';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const DriverHomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [stopModalVisible, setStopModalVisible] = useState(false);

  const { data: routeData, isLoading, isError, error, refetch, isRefetching } = useTodayRoute();
  const markInProgress = useMarkRouteInProgress();
  const markComplete = useMarkRouteComplete();
  const updateStop = useUpdateStop();

  const plan = routeData?.data?.[0] || null;
  const stops = plan?.routeStops || [];
  const completedStops = stops.filter((s: any) => s.stopStatus === 'COMPLETED').length;
  const pendingStops = stops.filter((s: any) => s.stopStatus === 'PENDING').length;
  const totalStops = stops.length;

  const handleStartRoute = () => {
    if (!plan?.id) return;
    markInProgress.mutate({ id: plan.id });
  };

  const handleCompleteRoute = () => {
    if (!plan?.id) return;
    markComplete.mutate({ id: plan.id });
  };

  const handleMarkStopCompleted = useCallback(
    (stopId: string) => {
      updateStop.mutate({ stopId, data: { status: 'COMPLETED' } });
      setStopModalVisible(false);
      setSelectedStop(null);
    },
    [updateStop]
  );

  const handleSkipStop = useCallback(
    (stopId: string, note: string) => {
      updateStop.mutate({ stopId, data: { status: 'SKIPPED', note } });
      setStopModalVisible(false);
      setSelectedStop(null);
    },
    [updateStop]
  );

  const handleReportIssue = useCallback(
    (stopId: string, note: string) => {
      updateStop.mutate({ stopId, data: { status: 'DELAYED', note } });
      setStopModalVisible(false);
      setSelectedStop(null);
    },
    [updateStop]
  );

  const openStopDetail = (stop: any) => {
    setSelectedStop(stop);
    setStopModalVisible(true);
  };

  const getStopIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { name: 'checkmark-circle', color: '#10B981', bg: '#ECFDF5' };
      case 'SKIPPED':
        return { name: 'close-circle', color: '#EF4444', bg: '#FEF2F2' };
      case 'DELAYED':
        return { name: 'time', color: '#D97706', bg: '#FFFBEB' };
      default:
        return { name: 'ellipse', color: '#94A3B8', bg: '#F8FAFC' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'D'}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'Driver'}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('DriverRoot', { screen: 'DriverNotifications' })}
          >
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor="#10B981"
          />
        }
      >
        {isLoading ? (
          <View style={{ gap: 16 }}>
            <LoadingSkeleton height={200} borderRadius={24} />
            <LoadingSkeleton height={80} borderRadius={20} />
            <LoadingSkeleton height={60} borderRadius={20} />
            <LoadingSkeleton height={60} borderRadius={20} />
            <LoadingSkeleton height={60} borderRadius={20} />
          </View>
        ) : isError ? (
          <ErrorCard error={parseError(error)} onRetry={refetch} />
        ) : !plan ? (
          <EmptyState
            emoji=""
            title="No Route Assigned Today"
            subtitle="You don't have any pickup routes scheduled for today. Check back later or contact your admin."
          />
        ) : (
          <>
            {/* Hero Progress Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroInfo}>
                  <View style={styles.zonePill}>
                    <Ionicons name="location" size={12} color="#10B981" />
                    <Text style={styles.zonePillText}>{plan?.zone?.zoneName || 'Zone'}</Text>
                  </View>
                  <Text style={styles.heroDate}>
                    {new Date(plan.routeDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <ProgressRing
                  completed={completedStops}
                  total={totalStops}
                  size={100}
                  strokeWidth={8}
                />
              </View>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Ionicons name="checkmark-done" size={16} color="#10B981" />
                  <Text style={styles.heroStatValue}>{completedStops}</Text>
                  <Text style={styles.heroStatLabel}>Done</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Ionicons name="time" size={16} color="#F59E0B" />
                  <Text style={styles.heroStatValue}>{totalStops - completedStops}</Text>
                  <Text style={styles.heroStatLabel}>Left</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Ionicons name="flag" size={16} color="#3B82F6" />
                  <Text style={styles.heroStatValue}>{plan.totalPriorityScore}</Text>
                  <Text style={styles.heroStatLabel}>Priority</Text>
                </View>
              </View>

              {/* Route Action Buttons */}
              {(plan.status === 'ASSIGNED' || plan.status === 'DRAFT') && (
                <TouchableOpacity
                  style={styles.startRouteBtn}
                  onPress={handleStartRoute}
                  disabled={markInProgress.isPending}
                >
                  {markInProgress.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="play" size={18} color="#FFFFFF" />
                      <Text style={styles.startRouteText}>Start Route</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {plan.status === 'IN_PROGRESS' && (
                <TouchableOpacity
                  style={[styles.completeRouteBtn, pendingStops > 0 && styles.completeRouteBtnDisabled]}
                  onPress={handleCompleteRoute}
                  disabled={markComplete.isPending || pendingStops > 0}
                >
                  {markComplete.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done" size={18} color={pendingStops > 0 ? '#94A3B8' : '#FFFFFF'} />
                      <Text style={[styles.startRouteText, pendingStops > 0 && { color: '#94A3B8' }]}>
                        {pendingStops > 0 ? `${pendingStops} Stop(s) Remaining` : 'Complete Route'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {plan.status === 'COMPLETED' && (
                <View style={styles.completedBanner}>
                  <Ionicons name="trophy" size={18} color="#F59E0B" />
                  <Text style={styles.completedBannerText}>Route Completed</Text>
                </View>
              )}
            </View>

            {/* Next Stop Preview (only if route is in progress and there's a next stop) */}
            {plan.status === 'IN_PROGRESS' && completedStops < totalStops && (
              <TouchableOpacity
                style={styles.nextStopCard}
                onPress={() => {
                  const next = stops.find((s: any) => s.stopStatus === 'PENDING');
                  if (next) openStopDetail(next);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.nextStopHeader}>
                  <Text style={styles.nextStopLabel}>NEXT STOP</Text>
                  <Ionicons name="chevron-forward" size={16} color="#10B981" />
                </View>
                {(() => {
                  const next = stops.find((s: any) => s.stopStatus === 'PENDING');
                  if (!next) return null;
                  const rp = next.residentProfile;
                  return (
                    <>
                      <Text style={styles.nextStopName}>{rp?.user?.fullName || 'Unknown'}</Text>
                      <View style={styles.nextStopAddress}>
                        <Ionicons name="location-outline" size={12} color="#94A3B8" />
                        <Text style={styles.nextStopAddressText} numberOfLines={1}>
                          {[rp?.houseNumber, rp?.buildingName, rp?.block].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </TouchableOpacity>
            )}

            {/* Timeline */}
            <Text style={styles.sectionTitle}>
              {plan.status === 'COMPLETED' ? 'ALL STOPS' : 'STOP TIMELINE'}
            </Text>
            <View style={styles.timeline}>
              {stops.map((stop: any, idx: number) => {
                const isLast = idx === stops.length - 1;
                const icon = getStopIcon(stop.stopStatus);
                const rp = stop.residentProfile;
                return (
                  <TouchableOpacity
                    key={stop.id}
                    style={styles.timelineItem}
                    onPress={() => openStopDetail(stop)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: icon.bg }]}>
                        <Ionicons name={icon.name as any} size={14} color={icon.color} />
                      </View>
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineCard}>
                      <View style={styles.timelineTop}>
                        <Text style={styles.timelineOrder}>#{stop.stopOrder}</Text>
                        <Text style={styles.timelineName} numberOfLines={1}>
                          {rp?.user?.fullName || 'Unknown'}
                        </Text>
                      </View>
                      <View style={styles.timelineAddress}>
                        <Ionicons name="location-outline" size={10} color="#94A3B8" />
                        <Text style={styles.timelineAddressText} numberOfLines={1}>
                          {[rp?.houseNumber, rp?.buildingName, rp?.block].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                      {stop.issueNote ? (
                        <View style={styles.timelineNote}>
                          <Ionicons name="information-circle" size={12} color="#D97706" />
                          <Text style={styles.timelineNoteText}>{stop.issueNote}</Text>
                        </View>
                      ) : null}
                      {stop.stopStatus === 'PENDING' && plan.status === 'IN_PROGRESS' && (
                        <TouchableOpacity
                          style={styles.quickCompleteBtn}
                          onPress={() => handleMarkStopCompleted(stop.id)}
                        >
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          <Text style={styles.quickCompleteText}>Mark Done</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Stop Detail Modal */}
      <StopDetailModal
        visible={stopModalVisible}
        stop={selectedStop}
        onClose={() => {
          setStopModalVisible(false);
          setSelectedStop(null);
        }}
        onMarkCompleted={handleMarkStopCompleted}
        onSkip={handleSkipStop}
        onReportIssue={handleReportIssue}
        isUpdating={updateStop.isPending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerProfile: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: { color: '#0F172A', fontWeight: 'bold', fontSize: 16 },
  greeting: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  scrollContent: { paddingBottom: 32 },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroInfo: {},
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.24)',
  },
  zonePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  heroDate: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  heroStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  startRouteBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  startRouteText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  completeRouteBtn: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
    gap: 8,
  },
  completeRouteBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.24)',
    gap: 8,
  },
  completedBannerText: {
    color: '#FBBF24',
    fontSize: 15,
    fontWeight: '800',
  },
  nextStopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextStopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextStopLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  nextStopName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  nextStopAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextStopAddressText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: 10,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  timelineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineOrder: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    marginRight: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timelineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  timelineAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timelineAddressText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '500',
  },
  timelineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    gap: 4,
  },
  timelineNoteText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
    flex: 1,
  },
  quickCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 4,
  },
  quickCompleteText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DriverHomeScreen;
