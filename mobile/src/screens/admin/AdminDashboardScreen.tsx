import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboardStats, useWeeklyLogVolume, useCategoryBreakdown } from '../../hooks/useDashboard';
import Svg, { Rect, Text as SvgText, G, Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportDashboardCsvApi } from '../../api/dashboard.api';
import { ErrorCard } from '../../components/common/ErrorCard';
import { FullScreenError } from '../../components/common/FullScreenError';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 200;
const CHART_TOP_PADDING = 30;

// --- Inline Bar Chart (no reanimated needed) ---
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
  const chartInnerHeight = CHART_HEIGHT - 40; // More space for labels/dates

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {data.map((item, index) => {
        const barHeight = (item.count / maxCount) * (chartInnerHeight - CHART_TOP_PADDING);
        const x = 20 + index * (barWidth + 8);
        const y = chartInnerHeight - barHeight;

        return (
          <React.Fragment key={index}>
            {/* Exact Count Text above bar - Larger & Clearer */}
            <SvgText
              x={x + barWidth / 2}
              y={y - 8}
              fontSize="12"
              fontWeight="900"
              fill={item.count > 0 ? '#064E3B' : '#9CA3AF'} // Darker emerald for contrast
              textAnchor="middle"
            >
              {item.count}
            </SvgText>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={item.count > 0 ? '#10B981' : '#F3F4F6'}
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
const PALETTE = ['#00A36C', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
  <View style={{
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width / 2 - 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  }}>
    <View>
      <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '500', marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{value}</Text>
    </View>
    <View style={{ padding: 8, borderRadius: 999, backgroundColor: `${color}22` }}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
  </View>
);

// --- Main Screen ---
const AdminDashboardScreen = ({ navigation }: any) => {
  const [zoneId] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const { data: statsData, isLoading: statsLoading, isError: statsError, error: statsErr, refetch: refetchStats } = useDashboardStats({ zone_id: zoneId });
  const { data: weeklyData, isLoading: weeklyLoading, isError: weeklyError, error: weeklyErr, refetch: refetchWeekly } = useWeeklyLogVolume(zoneId);
  const { data: categoryData, isLoading: categoryLoading, isError: categoryError, error: categoryErr, refetch: refetchCategory } = useCategoryBreakdown({ zone_id: zoneId });

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

  const stats = statsData?.data || {
    totalHouseholds: 0,
    activeLogsToday: 0,
    openComplaints: 0,
    resolvedComplaintsThisWeek: 0,
    segregationCompliance: 0,
    pickupsDueToday: 0,
  };

  // Backend returns { success: true, data: [...] }
  const rawWeekly = weeklyData?.data ?? [];
  const rawCategory = categoryData?.data ?? [];

  // Logic to show exactly the last 7 days ending TODAY
  const chartData = rawWeekly.map((item: any) => ({
    date: item.date ? item.date.split('-').slice(1).join('/') : '',
    count: item.count || 0,
  })).slice(-7); // Keep only the latest 7 days including today

  const pieData = rawCategory;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>Admin Dashboard</Text>
          <Text style={{ color: '#6B7280', fontSize: 13 }}>Waste Management Overview</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Ionicons name="download" size={15} color="white" />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 12 }}>{isExporting ? 'Exporting' : 'CSV'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#00A36C', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('RouteManagement')}
          >
            <Ionicons name="map" size={15} color="white" />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 12 }}>Routes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('VehicleManagement')}
          >
            <Ionicons name="bus" size={15} color="white" />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 12 }}>Fleet</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={statsLoading || weeklyLoading || categoryLoading} onRefresh={onRefresh} tintColor="#00A36C" />}
      >
        {isInitialLoading ? (
          <View style={{ gap: 16, marginBottom: 16 }}>
            {/* Stats Grid Skeleton */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <LoadingSkeleton width={width / 2 - 24} height={72} borderRadius={16} />
              <LoadingSkeleton width={width / 2 - 24} height={72} borderRadius={16} />
              <LoadingSkeleton width={width / 2 - 24} height={72} borderRadius={16} />
              <LoadingSkeleton width={width / 2 - 24} height={72} borderRadius={16} />
            </View>

            {/* Nav Grid Skeleton */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><LoadingSkeleton height={80} borderRadius={16} /></View>
              <View style={{ flex: 1 }}><LoadingSkeleton height={80} borderRadius={16} /></View>
              <View style={{ flex: 1 }}><LoadingSkeleton height={80} borderRadius={16} /></View>
            </View>

            {/* Chart Skeleton */}
            <LoadingSkeleton height={220} borderRadius={24} />
            <LoadingSkeleton height={180} borderRadius={24} />
          </View>
        ) : hasError ? (
          <ErrorCard error={parseError(statsErr || weeklyErr || categoryErr)} onRetry={onRefresh} />
        ) : (
          <>
        {/* Quick Stats Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <StatCard title="Total Households" value={stats.totalHouseholds} icon="people" color="#3B82F6" />
          <StatCard title="Logs Today" value={stats.activeLogsToday} icon="leaf" color="#00A36C" />
          <StatCard title="Open Complaints" value={stats.openComplaints} icon="warning" color="#EF4444" />
          <StatCard title="Resolved (Wk)" value={stats.resolvedComplaintsThisWeek} icon="checkmark-circle" color="#10B981" />
          <StatCard title="Compliance" value={`${(stats.segregationCompliance || 0).toFixed(1)}%`} icon="analytics" color="#F59E0B" />
          <StatCard title="Pickups Due" value={stats.pickupsDueToday} icon="calendar" color="#8B5CF6" />
        </View>


        {/* Weekly Log Volume Chart */}
        <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>Weekly Log Volume</Text>
          <BarChart data={chartData} />
        </View>

        {/* Category Breakdown Chart */}
        <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 32, borderWidth: 1, borderColor: '#F3F4F6' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>Waste Categories</Text>
          <PieChart data={pieData} />
        </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;
