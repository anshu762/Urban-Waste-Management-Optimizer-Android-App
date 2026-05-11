import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth.store';
import { getUpcomingPickups } from '../../api/schedule.api';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import CategoryBadge from '../../components/common/CategoryBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

const { width: SCREEN_W } = Dimensions.get('window');
const H_PAD = 16;
const GRID_W = SCREEN_W - H_PAD * 2;
const CELL_W = GRID_W / 7;
const CELL_H = 52;

const CATEGORY_DOT: Record<string, string> = {
  WET: '#10B981',
  DRY: '#F59E0B',
  RECYCLABLE: '#3B82F6',
  HAZARDOUS: '#EF4444',
  SANITARY: '#EC4899',
  EWASTE: '#F97316',
};

export const PickupCalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const user = useAuthStore((state) => state.user);
  const zoneId = user?.residentProfile?.zoneId;

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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getPickupsForDate = (date: Date) => {
    if (!pickups?.data) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return pickups.data.filter((p: { date: string }) => p.date === dateStr);
  };

  const daysOfWeek = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  if (!zoneId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Calendar</Text>
          <Text style={styles.pageSubtitle}>Your pickup schedule</Text>
        </View>
        <View style={styles.zoneEmptyWrap}>
          <EmptyState
            emoji="📍"
            title="Set your service zone first"
            subtitle="We need your zone to load collection dates for your area."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Calendar</Text>
        <Text style={styles.pageSubtitle}>{format(currentDate, 'MMMM yyyy')}</Text>
      </View>

      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.navCircle} onPress={() => setCurrentDate(subMonths(currentDate, 1))}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{format(currentDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity style={styles.navCircle} onPress={() => setCurrentDate(addMonths(currentDate, 1))}>
          <Ionicons name="chevron-forward" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarShell}>
        <View style={styles.weekRow}>
          {daysOfWeek.map((day) => (
            <View key={day} style={styles.weekCell}>
              <Text style={styles.weekDow}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.gridRowWrap}>
          {calendarDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const dayPickups = getPickupsForDate(day);

            return (
              <TouchableOpacity
                key={day.toISOString()}
                onPress={() => setSelectedDate(day)}
                style={[
                  styles.dayCell,
                  !isCurrentMonth && styles.dayCellMuted,
                  isSelected && styles.dayCellSelected,
                ]}
              >
                <Text
                  style={[styles.dayNum, isToday && styles.dayNumToday, !isCurrentMonth && styles.dayNumMuted]}
                >
                  {format(day, 'd')}
                </Text>
                <View style={styles.dotRow}>
                  {dayPickups.slice(0, 3).map((p: { wasteCategory: string }, i: number) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        { backgroundColor: CATEGORY_DOT[p.wasteCategory] || '#94A3B8' },
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.detailScroll}
        contentContainerStyle={styles.detailContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={() => refetch()} tintColor="#00A36C" />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Details</Text>

        {isLoading ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Selected day</Text>
              <View style={styles.cardPill}>
                <Text style={styles.cardPillText}>Loading</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <ActivityIndicator size="small" color="#0F172A" style={{ marginBottom: 14 }} />
              <LoadingSkeleton height={56} borderRadius={16} />
              <View style={{ height: 10 }} />
              <LoadingSkeleton height={56} borderRadius={16} width="92%" />
            </View>
          </View>
        ) : isError ? (
          <ErrorCard error={parseError(error)} onRetry={() => refetch()} />
        ) : selectedDate ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Pickups</Text>
              <View style={styles.cardPillLight}>
                <Text style={styles.cardPillLightText}>{format(selectedDate, 'MMM d')}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              {getPickupsForDate(selectedDate).length > 0 ? (
                getPickupsForDate(selectedDate).map((p: { wasteCategory: string; timeWindow: string }, i: number) => (
                  <View key={i} style={styles.pickupRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.pickupMeta}>
                        <Ionicons name="time-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
                        <Text style={styles.pickupTime}>{p.timeWindow}</Text>
                      </View>
                    </View>
                    <CategoryBadge category={p.wasteCategory} />
                  </View>
                ))
              ) : (
                <EmptyState
                  emoji="📅"
                  title="Nothing scheduled"
                  subtitle="No pickups for this day in your zone."
                />
              )}
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Pickups</Text>
            </View>
            <View style={styles.cardBody}>
              <EmptyState
                emoji="📅"
                title="Select a date"
                subtitle="Tap any day to see collection details for your area."
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  pageHeader: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  pageSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 4 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
  },
  navCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  monthLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  calendarShell: {
    marginHorizontal: H_PAD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FAFBFC',
    overflow: 'hidden',
  },
  weekRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#fff' },
  weekCell: { width: CELL_W, paddingVertical: 10, alignItems: 'center' },
  weekDow: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  gridRowWrap: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff' },
  dayCell: {
    width: CELL_W,
    height: CELL_H,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  dayCellMuted: { opacity: 0.35, backgroundColor: '#F8FAFC' },
  dayCellSelected: { backgroundColor: '#ECFDF5' },
  dayNum: { fontSize: 15, fontWeight: '600', color: '#334155' },
  dayNumToday: { color: '#059669', fontWeight: '800' },
  dayNumMuted: { color: '#94A3B8' },
  dotRow: { flexDirection: 'row', marginTop: 4 },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginHorizontal: 1.5 },
  zoneEmptyWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: H_PAD },
  detailScroll: { flex: 1 },
  detailContent: { paddingHorizontal: H_PAD, paddingTop: 20, paddingBottom: 100 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeaderTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },
  cardPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.24)',
  },
  cardPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  cardPillLight: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  cardPillLightText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  cardBody: { padding: 16 },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pickupMeta: { flexDirection: 'row', alignItems: 'center' },
  pickupTime: { fontSize: 14, fontWeight: '600', color: '#475569' },
});
