import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth.store';
import { getUpcomingPickups } from '../../api/schedule.api';
import PickupCard from '../../components/resident/PickupCard';
import CategoryBadge from '../../components/common/CategoryBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useResidentZoneSensorSummary } from '../../hooks/useIoT';
import { ProfileSheet } from '../../components/common/ProfileSheet';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const { width } = Dimensions.get('window');

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statLabel}>{title}</Text>
    <Text style={styles.statValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const shortenZone = (name: string, max = 16) =>
  name.length > max ? `${name.slice(0, max - 1)}…` : name;

export const HomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const zoneId = user?.residentProfile?.zoneId;
  const zoneName =
    user?.residentProfile?.zone?.zoneName || (zoneId ? 'Zone set' : 'Not set');

  const [profileSheetVisible, setProfileSheetVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const {
    data: pickups,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['upcomingPickups', zoneId],
    queryFn: () => getUpcomingPickups(zoneId!),
    enabled: !!zoneId,
  });

  const {
    data: sensorData,
    refetch: refetchSensors,
    isRefetching: sensorsRefetching,
  } = useResidentZoneSensorSummary(zoneId || undefined);

  const nextPickup = pickups?.data?.[0];
  const nextSevenDays = pickups?.data?.slice(1, 8) || [];
  const bins = sensorData?.data?.slice(0, 5) || [];

  const onRefresh = () => {
    refetch();
    if (zoneId) refetchSensors();
  };

  const refreshing = (isRefetching || sensorsRefetching) && !isLoading;

  const nextPickupLabel = () => {
    if (!nextPickup) return '—';
    const d = differenceInDays(parseISO(nextPickup.date), new Date());
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    if (d > 1) return `${d} days`;
    return 'Soon';
  };

  const weekCount = pickups?.data ? pickups.data.slice(0, 8).length : 0;

  const initiateLogout = () => {
    setProfileSheetVisible(false);
    setTimeout(() => setLogoutModalVisible(true), 400);
  };

  const handleLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  const openProfileFromSheet = () => {
    setProfileSheetVisible(false);
    setTimeout(() => navigation.navigate('Profile'), 300);
  };

  const renderSkeleton = () => (
    <View style={{ gap: 16 }}>
      <View style={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <View key={idx} style={styles.statCard}>
            <View style={styles.iconBox}>
              <LoadingSkeleton width={20} height={20} borderRadius={10} />
            </View>
            <LoadingSkeleton width={90} height={10} borderRadius={8} />
            <View style={{ marginTop: 10 }}>
              <LoadingSkeleton width={70} height={20} borderRadius={10} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.shortcutsSection}>
        <View style={styles.shortcutsGroup}>
          <View style={[styles.shortcutRow, styles.shortcutRowLast]}>
            <LoadingSkeleton width={44} height={44} borderRadius={14} />
            <View style={{ flex: 1, marginLeft: 14, gap: 8 }}>
              <LoadingSkeleton width="55%" height={14} borderRadius={8} />
              <LoadingSkeleton width="85%" height={11} borderRadius={6} />
            </View>
          </View>
        </View>
      </View>
      <View style={styles.chartCard}>
        <LoadingSkeleton width={120} height={16} borderRadius={10} />
        <View style={{ marginTop: 16, gap: 10 }}>
          <LoadingSkeleton height={14} borderRadius={8} />
          <LoadingSkeleton height={14} borderRadius={8} width="80%" />
          <LoadingSkeleton height={40} borderRadius={12} />
        </View>
      </View>
    </View>
  );

  const renderScannerCard = () => (
    <View style={styles.shortcutsSection}>
      <TouchableOpacity
        style={styles.scannerCard}
        onPress={() => navigation.navigate('SmartWasteScanner')}
        activeOpacity={0.85}
      >
        <View style={styles.scannerCardContent}>
          <View style={[styles.shortcutIconWrap, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="scan" size={22} color="#10B981" />
          </View>
          <View style={styles.shortcutTextCol}>
            <Text style={styles.shortcutTitle}>Smart Waste Scanner</Text>
            <Text style={styles.shortcutSubtitle}>Identify correct dustbin instantly</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderReportShortcut = () => (
    <View style={styles.shortcutsSection}>
      <View style={styles.shortcutsGroup}>
        <TouchableOpacity
          style={[styles.shortcutRow, styles.shortcutRowLast]}
          onPress={() => navigation.navigate('ReportMissedPickup')}
          activeOpacity={0.65}
          accessibilityRole="button"
          accessibilityLabel="Report a missed pickup"
        >
          <View style={[styles.shortcutIconWrap, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="alert-circle-outline" size={22} color="#DC2626" />
          </View>
          <View style={styles.shortcutTextCol}>
            <Text style={styles.shortcutTitle}>Report missed pickup</Text>
            <Text style={styles.shortcutSubtitle}>Tell us if a scheduled collection did not happen</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsGrid}>
      <StatCard title="Your zone" value={shortenZone(zoneName)} icon="map" color="#3B82F6" />
      <StatCard title="Scheduled" value={zoneId ? weekCount : '—'} icon="calendar" color="#00A36C" />
      <StatCard title="Bin sensors" value={zoneId ? bins.length : '—'} icon="pulse" color="#8B5CF6" />
      <StatCard title="Next pickup" value={zoneId ? nextPickupLabel() : '—'} icon="time" color="#F59E0B" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <TouchableOpacity style={styles.avatarBox} onPress={() => setProfileSheetVisible(true)}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'R'}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userNameText}>{user?.fullName?.split(' ')[0] || 'Resident'}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AddressSetup')}
            accessibilityRole="button"
            accessibilityLabel="Edit service zone"
          >
            <Ionicons name="location-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityRole="button"
            accessibilityLabel="Alerts"
          >
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A36C" />
        }
      >
        {isLoading && zoneId ? (
          renderSkeleton()
        ) : isError && zoneId ? (
          <ErrorCard error={parseError(error)} onRetry={onRefresh} />
        ) : (
          <>
            {renderStats()}
            {renderScannerCard()}
            {renderReportShortcut()}

            <Text style={styles.sectionTitle}>Schedule</Text>
            {!zoneId ? (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>Pickups</Text>
                  <View style={styles.chartPillLight}>
                    <Text style={styles.chartPillTextLight}>Setup</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
                  <EmptyState
                    emoji="📍"
                    title="Set your service zone"
                    subtitle="We use your zone to show pickup dates and bin status for your area."
                  />
                  <TouchableOpacity
                    style={styles.primaryCta}
                    onPress={() => navigation.navigate('AddressSetup')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryCtaText}>Choose zone</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : nextPickup ? (
              <PickupCard
                date={nextPickup.date}
                category={nextPickup.wasteCategory}
                timeWindow={nextPickup.timeWindow}
                showCountdown
              />
            ) : (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>Pickups</Text>
                  <View style={styles.chartPill}>
                    <Text style={styles.chartPillText}>Empty</Text>
                  </View>
                </View>
                <View style={{ padding: 8 }}>
                  <EmptyState
                    emoji="📅"
                    title="No pickups scheduled"
                    subtitle="Contact your administrator if you expected a route."
                  />
                </View>
              </View>
            )}

            {zoneId && nextSevenDays.length > 0 ? (
              <>
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Upcoming week</Text>
                  <TouchableOpacity
                    style={styles.calendarLink}
                    onPress={() => navigation.navigate('PickupCalendar')}
                  >
                    <Text style={styles.calendarLinkText}>Calendar</Text>
                    <Ionicons name="chevron-forward" size={16} color="#00A36C" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.weekStrip}
                >
                  {nextSevenDays.map((item: { id: string; date: string; wasteCategory: string; timeWindow: string }) => (
                    <View key={item.id} style={styles.weekCard}>
                      <Text style={styles.weekCardDate}>
                        {new Date(item.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <View style={{ marginVertical: 8 }}>
                        <CategoryBadge category={item.wasteCategory} />
                      </View>
                      <View style={styles.weekTimeRow}>
                        <Ionicons name="time-outline" size={12} color="#94A3B8" />
                        <Text style={styles.weekTime}>{item.timeWindow}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : null}

            {zoneId && bins.length > 0 ? (
              <View style={[styles.chartCard, { marginTop: 8 }]}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>Bin status</Text>
                  <View style={styles.chartPill}>
                    <Text style={styles.chartPillText}>Your area</Text>
                  </View>
                </View>
                <Text style={styles.binHint}>Fill levels for bins monitored near you</Text>
                <View style={styles.binRow}>
                  {bins.map((bin: { binId: string; fillLevel: number }) => (
                    <View key={bin.binId} style={styles.binItem}>
                      <View
                        style={[
                          styles.binDot,
                          {
                            backgroundColor:
                              bin.fillLevel > 80 ? '#EF4444' : bin.fillLevel >= 50 ? '#F59E0B' : '#10B981',
                          },
                        ]}
                      />
                      <Text style={styles.binPct}>{Math.round(bin.fillLevel)}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <ProfileSheet
        visible={profileSheetVisible}
        user={user}
        onClose={() => setProfileSheetVisible(false)}
        onLogout={initiateLogout}
        roleBadgeText="RESIDENT"
        roleBadgeIcon="home"
        onPersonalInfoPress={openProfileFromSheet}
      />

      <ConfirmModal
        visible={logoutModalVisible}
        title="Sign out?"
        message="You will need to sign in again to view pickups and log waste."
        confirmLabel="Sign out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        isDanger
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
  greetingText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  userNameText: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    width: width / 2 - 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  shortcutsSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shortcutsGroup: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FAFBFC',
    overflow: 'hidden',
  },
  scannerCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#FAFBFC',
    overflow: 'hidden',
  },
  scannerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  shortcutRowLast: {
    borderBottomWidth: 0,
  },
  shortcutIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTextCol: { flex: 1, marginLeft: 14, marginRight: 8 },
  shortcutTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  shortcutSubtitle: { fontSize: 12, color: '#64748B', marginTop: 3, lineHeight: 16 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarLink: { flexDirection: 'row', alignItems: 'center' },
  calendarLinkText: { color: '#00A36C', fontWeight: '800', fontSize: 13 },
  chartCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    margin: -16,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  chartPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.24)',
  },
  chartPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  chartPillLight: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  chartPillTextLight: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  primaryCta: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryCtaText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  weekStrip: { gap: 12, paddingRight: 8, paddingBottom: 8 },
  weekCard: {
    width: 148,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weekCardDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  weekTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  weekTime: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  binHint: { fontSize: 12, color: '#64748B', marginBottom: 14 },
  binRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  binItem: { alignItems: 'center' },
  binDot: { width: 14, height: 14, borderRadius: 7, marginBottom: 6 },
  binPct: { fontSize: 11, fontWeight: '700', color: '#475569' },
});
