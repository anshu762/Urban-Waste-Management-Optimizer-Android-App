import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboardStats, useWeeklyLogVolume, useCategoryBreakdown } from '../../hooks/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import Svg, { Rect, Text as SvgText, G, Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportDashboardCsvApi } from '../../api/dashboard.api';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ProfileSheet } from '../../components/common/ProfileSheet';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 200;
const CHART_TOP_PADDING = 30;

// --- Inline Bar Chart ---
const BarChart = ({ data }: { data: { date: string; count: number }[] }) => {
  const allZero = !data || data.length === 0 || data.every(d => d.count === 0);

  if (allZero) {
    return (
      <View style={{ height: CHART_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>No waste logs in the last 7 days</Text>
        <Text style={{ color: '#D1D5DB', fontSize: 11, marginTop: 4 }}>Residents need to submit logs first</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = (CHART_WIDTH - 40) / data.length - 8;
  const chartInnerHeight = CHART_HEIGHT - 40;

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {data.map((item, index) => {
        const barHeight = (item.count / maxCount) * (chartInnerHeight - CHART_TOP_PADDING);
        const x = 20 + index * (barWidth + 8);
        const y = chartInnerHeight - barHeight;

        return (
          <React.Fragment key={index}>
            <SvgText
              x={x + barWidth / 2}
              y={y - 8}
              fontSize="12"
              fontWeight="900"
              fill={item.count > 0 ? '#0F172A' : '#9CA3AF'}
              textAnchor="middle"
            >
              {item.count}
            </SvgText>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={item.count > 0 ? '#0F172A' : '#F3F4F6'}
              rx={6}
            />
            <SvgText
              x={x + barWidth / 2}
              y={CHART_HEIGHT - 5}
              fontSize="8"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {item.date}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

// --- Inline Donut/Pie Chart ---
const PALETTE = ['#0F172A', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const PieChart = ({ data }: { data: { category: string; count: number }[] }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#9CA3AF' }}>No data available</Text>
      </View>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const cx = 80;
  const cy = 80;
  const r = 55;
  const innerR = 30;
  let cumulativeAngle = -Math.PI / 2;

  const slices = data.map((item, i) => {
    const angle = (item.count / total) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const xi1 = cx + innerR * Math.cos(startAngle);
    const yi1 = cy + innerR * Math.sin(startAngle);
    const xi2 = cx + innerR * Math.cos(endAngle);
    const yi2 = cy + innerR * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${xi1} ${yi1}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      'Z',
    ].join(' ');

    return { d, color: PALETTE[i % PALETTE.length] };
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Svg width={160} height={160}>
        {slices.map((slice, i) => (
          <Path key={i} d={slice.d} fill={slice.color} />
        ))}
      </Svg>
      <View style={{ flex: 1, paddingLeft: 8 }}>
        {data.slice(0, 6).map((item, index) => (
          <View key={item.category} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: PALETTE[index % PALETTE.length], marginRight: 6 }} />
            <Text style={{ fontSize: 11, color: '#4B5563', flex: 1 }}>{item.category}</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827' }}>{item.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// --- Stat Card ---
const StatCard = ({
  title, value, icon, color,
}: { title: string; value: string | number; icon: any; color: string }) => (
  <View style={styles.statCard}>
    <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statLabel}>{title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

// --- Main Screen ---
const AdminDashboardScreen = ({ navigation }: any) => {
  const [zoneId] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);

  const { data: statsData, isLoading: statsLoading, isError: statsError, error: statsErr, refetch: refetchStats } = useDashboardStats({ zone_id: zoneId });
  const { data: weeklyData, isLoading: weeklyLoading, isError: weeklyError, error: weeklyErr, refetch: refetchWeekly } = useWeeklyLogVolume(zoneId);
  const { data: categoryData, isLoading: categoryLoading, isError: categoryError, error: categoryErr, refetch: refetchCategory } = useCategoryBreakdown({ zone_id: zoneId });

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const onRefresh = () => { refetchStats(); refetchWeekly(); refetchCategory(); };
  const hasError = statsError || weeklyError || categoryError;
  const isInitialLoading = statsLoading || weeklyLoading || categoryLoading;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const csv = await exportDashboardCsvApi({ zone_id: zoneId });
      const file = new File(Paths.document, 'dashboard_stats.csv');
      file.create({ overwrite: true });
      file.write(csv);
      const fileUri = file.uri;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export dashboard CSV' });
      } else {
        Alert.alert('Export ready', fileUri);
      }
    } catch (error) {
      Alert.alert('Export failed', 'Unable to export dashboard CSV right now.');
    } finally {
      setIsExporting(false);
    }
  };

  const initiateLogout = () => {
    setProfileSheetVisible(false);
    // Standard practice: Show one final confirmation even after clicking logout in profile
    setTimeout(() => {
      setLogoutModalVisible(true);
    }, 400);
  };

  const handleLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  const stats = statsData?.data || {
    totalHouseholds: 0,
    activeLogsToday: 0,
    openComplaints: 0,
    resolvedComplaintsThisWeek: 0,
    segregationCompliance: 0,
    pickupsDueToday: 0,
  };

  const chartData = (weeklyData?.data ?? []).map((item: any) => ({
    date: item.date ? item.date.split('-').slice(1).join('/') : '',
    count: item.count || 0,
  })).slice(-7);

  const pieData = categoryData?.data ?? [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <TouchableOpacity 
            style={styles.avatarBox}
            onPress={() => setProfileSheetVisible(true)}
          >
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0) || 'A'}
            </Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userNameText}>{user?.fullName?.split(' ')[0] || 'Admin'}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Ionicons name="download-outline" size={20} color={isExporting ? '#94A3B8' : '#0F172A'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={statsLoading || weeklyLoading || categoryLoading} onRefresh={onRefresh} tintColor="#00A36C" />}
      >
        {isInitialLoading ? (
          <View style={{ gap: 16, marginBottom: 16 }}>
            {/* Stats grid skeleton (same statCard container) */}
            <View style={styles.statsGrid}>
              {Array.from({ length: 6 }).map((_, idx) => (
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

            {/* Control Center skeleton (same nav cards) */}
            <View style={styles.controlCenter}>
              <Text style={styles.sectionTitle}>Control Center</Text>
              <View style={styles.navRow}>
                <View style={styles.navItemDark}>
                  <LoadingSkeleton width={28} height={28} borderRadius={14} baseColor="rgba(255,255,255,0.12)" highlightColor="rgba(255,255,255,0.22)" />
                  <View style={{ marginTop: 12 }}>
                    <LoadingSkeleton width={60} height={12} borderRadius={8} baseColor="rgba(255,255,255,0.12)" highlightColor="rgba(255,255,255,0.22)" />
                    <View style={{ marginTop: 8 }}>
                      <LoadingSkeleton width={80} height={10} borderRadius={8} baseColor="rgba(255,255,255,0.10)" highlightColor="rgba(255,255,255,0.18)" />
                    </View>
                  </View>
                </View>

                <View style={styles.navItemLight}>
                  <LoadingSkeleton width={28} height={28} borderRadius={14} />
                  <View style={{ marginTop: 12 }}>
                    <LoadingSkeleton width={60} height={12} borderRadius={8} />
                    <View style={{ marginTop: 8 }}>
                      <LoadingSkeleton width={80} height={10} borderRadius={8} />
                    </View>
                  </View>
                </View>

                <View style={styles.navItemLight}>
                  <LoadingSkeleton width={28} height={28} borderRadius={14} />
                  <View style={{ marginTop: 12 }}>
                    <LoadingSkeleton width={60} height={12} borderRadius={8} />
                    <View style={{ marginTop: 8 }}>
                      <LoadingSkeleton width={80} height={10} borderRadius={8} />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Performance Overview</Text>

            {/* Weekly Log Volume card skeleton */}
            <View style={styles.chartCard}>
              <LoadingSkeleton width={150} height={16} borderRadius={10} />
              <View style={{ marginTop: 18, gap: 10 }}>
                <LoadingSkeleton height={12} borderRadius={8} />
                <LoadingSkeleton height={12} borderRadius={8} width="92%" />
                <LoadingSkeleton height={12} borderRadius={8} width="84%" />
                <LoadingSkeleton height={12} borderRadius={8} width="76%" />
                <LoadingSkeleton height={12} borderRadius={8} width="88%" />
              </View>
              <View style={{ marginTop: 16 }}>
                <LoadingSkeleton height={90} borderRadius={20} />
              </View>
            </View>

            {/* Waste Categories card skeleton */}
            <View style={styles.chartCard}>
              <LoadingSkeleton width={140} height={16} borderRadius={10} />
              <View style={{ marginTop: 18, flexDirection: 'row', gap: 12 }}>
                <LoadingSkeleton width={160} height={160} borderRadius={80} />
                <View style={{ flex: 1, gap: 10, paddingTop: 10 }}>
                  <LoadingSkeleton height={10} borderRadius={8} />
                  <LoadingSkeleton height={10} borderRadius={8} width="92%" />
                  <LoadingSkeleton height={10} borderRadius={8} width="78%" />
                  <LoadingSkeleton height={10} borderRadius={8} width="86%" />
                  <LoadingSkeleton height={10} borderRadius={8} width="70%" />
                </View>
              </View>
            </View>
          </View>
        ) : hasError ? (
          <ErrorCard error={parseError(statsErr || weeklyErr || categoryErr)} onRetry={onRefresh} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard title="Total Households" value={stats.totalHouseholds} icon="people" color="#3B82F6" />
              <StatCard title="Logs Today" value={stats.activeLogsToday} icon="leaf" color="#00A36C" />
              <StatCard title="Open Complaints" value={stats.openComplaints} icon="warning" color="#EF4444" />
              <StatCard title="Resolved (Wk)" value={stats.resolvedComplaintsThisWeek} icon="checkmark-circle" color="#10B981" />
              <StatCard title="Compliance" value={`${(stats.segregationCompliance || 0).toFixed(1)}%`} icon="analytics" color="#F59E0B" />
              <StatCard title="Pickups Due" value={stats.pickupsDueToday} icon="calendar" color="#8B5CF6" />
            </View>

            <View style={styles.controlCenter}>
              <Text style={styles.sectionTitle}>Control Center</Text>
              <View style={styles.navRow}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('RouteManagement')}
                  style={styles.navItemDark}
                >
                  <Ionicons name="map" size={24} color="#10B981" />
                  <Text style={styles.navItemTextLight}>Routes</Text>
                  <Text style={styles.navItemSubtextLight}>Optimize Plan</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => navigation.navigate('VehicleManagement')}
                  style={styles.navItemLight}
                >
                  <Ionicons name="bus" size={24} color="#3B82F6" />
                  <Text style={styles.navItemTextDark}>Fleet</Text>
                  <Text style={styles.navItemSubtextDark}>Manage Trucks</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('ZoneManagement')}
                  style={styles.navItemLight}
                >
                  <Ionicons name="location" size={24} color="#F59E0B" />
                  <Text style={styles.navItemTextDark}>Zones</Text>
                  <Text style={styles.navItemSubtextDark}>Service Areas</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Performance Overview</Text>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Weekly Log Volume</Text>
                <View style={styles.chartPill}>
                  <Text style={styles.chartPillText}>Last 7 days</Text>
                </View>
              </View>
              <BarChart data={chartData} />
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Waste Categories</Text>
                <View style={styles.chartPillLight}>
                  <Text style={styles.chartPillTextLight}>Distribution</Text>
                </View>
              </View>
              <PieChart data={pieData} />
            </View>
          </>
        )}
      </ScrollView>

      {/* Elite Profile Bottom Sheet */}
      <ProfileSheet 
        visible={profileSheetVisible}
        user={user}
        onClose={() => setProfileSheetVisible(false)}
        onLogout={initiateLogout}
      />

      {/* Premium Logout Confirmation */}
      <ConfirmModal
        visible={logoutModalVisible}
        title="Sign Out?"
        message="Are you sure you want to log out of your admin account? You will need to sign in again to access the dashboard."
        confirmLabel="Sign Out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        isDanger={true}
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
    borderBottomColor: '#F8FAFC'
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
    borderColor: '#E2E8F0'
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
    borderColor: '#F1F5F9' 
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
    borderColor: '#fff' 
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
    marginBottom: 12
  },
  statLabel: { color: '#64748B', fontSize: 11, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  controlCenter: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  navRow: { flexDirection: 'row', gap: 12 },
  navItemDark: { 
    flex: 1, 
    backgroundColor: '#0F172A', 
    borderRadius: 20, 
    padding: 18, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10, 
    elevation: 5 
  },
  navItemLight: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 18, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    shadowColor: '#000', 
    shadowOpacity: 0.02, 
    elevation: 1 
  },
  navItemTextLight: { marginTop: 8, fontWeight: 'bold', color: '#fff', fontSize: 14 },
  navItemSubtextLight: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  navItemTextDark: { marginTop: 8, fontWeight: 'bold', color: '#0F172A', fontSize: 14 },
  navItemSubtextDark: { color: '#64748B', fontSize: 10, marginTop: 2 },
  chartCard: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#F3F4F6' 
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
});

export default AdminDashboardScreen;