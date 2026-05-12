import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSchedulesByZone, createSchedule, deleteSchedule } from '../../api/schedule.api';
import CategoryBadge from '../../components/common/CategoryBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { parseError } from '../../lib/error-parser';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Ionicons } from '@expo/vector-icons';
import { SwipeableBottomSheet } from '../../components/common/SwipeableBottomSheet';

const { height } = Dimensions.get('window');

export const ZoneDetailScreen = ({ route, navigation }: any) => {
  const { zoneId, zoneName } = route.params;
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  // Form State
  const [wasteCategory, setWasteCategory] = useState('WET');
  const [pickupDay, setPickupDay] = useState(1);
  const [timeWindow, setTimeWindow] = useState('08:00 AM - 10:00 AM');

  const { showError, showSuccess } = useErrorHandler();
  const { data: schedules, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['schedules', zoneId],
    queryFn: () => getSchedulesByZone(zoneId),
  });

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', zoneId] });
      setIsModalVisible(false);
      showSuccess('Schedule added successfully.');
    },
    onError: (err: any) => {
      showError(err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', zoneId] });
      showSuccess('Schedule deleted.');
      setDeleteModalVisible(false);
      setScheduleToDelete(null);
    },
    onError: (err: any) => {
      showError(err);
      setDeleteModalVisible(false);
    },
  });

  const categories = ['WET', 'DRY', 'RECYCLABLE', 'HAZARDOUS', 'SANITARY', 'EWASTE'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleAddSchedule = () => {
    createMutation.mutate({
      zoneId,
      wasteCategory,
      pickupDay,
      pickupTimeWindow: timeWindow,
    });
  };

  const openDeleteModal = (id: string) => {
    setScheduleToDelete(id);
    setDeleteModalVisible(true);
  };

  const renderScheduleItem = ({ item }: any) => (
    <View style={styles.scheduleCard}>
      <View style={styles.dayBadge}>
        <Text style={styles.dayText}>{days[item.pickupDay]}</Text>
      </View>
      <View style={styles.scheduleInfo}>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.timeText}>{item.pickupTimeWindow}</Text>
        </View>
        <CategoryBadge category={item.wasteCategory} />
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => openDeleteModal(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{zoneName}</Text>
          <Text style={styles.headerSubtitle}>Service Area Management</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.zoneIconBox}>
              <Ionicons name="map" size={24} color="#10B981" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Zone Overview</Text>
              <Text style={styles.heroSubtitle}>Active Pickup Operations</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.statValue}>{schedules?.data?.length || 0}</Text>
              <Text style={styles.statLabel}>SCHEDULES</Text>
            </View>
            <View style={[styles.heroStatItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' }]}>
              <Text style={[styles.statValue, { color: '#0F172A' }]}>ACTIVE</Text>
              <Text style={styles.statLabel}>STATUS</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Ionicons name="notifications-outline" size={20} color="#8B5CF6" />
              <Text style={styles.statLabel}>ALERTS</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PICKUP SCHEDULES</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>ADD NEW</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : isError ? (
          <ErrorCard error={parseError(error)} onRetry={refetch} />
        ) : (
          <FlatList
            data={schedules?.data}
            keyExtractor={(item) => item.id}
            renderItem={renderScheduleItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <EmptyState emoji="📅" title="No schedules set" subtitle="Add a pickup schedule for this zone." />
            }
          />
        )}
      </ScrollView>

      {/* Add Schedule Modal */}
      <SwipeableBottomSheet visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <View style={styles.modalBody}>
          <Text style={styles.modalTitle}>New Schedule</Text>
          <Text style={styles.modalSubtitle}>Configure collection window</Text>

          <Text style={styles.inputLabel}>WASTE CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setWasteCategory(cat)}
                style={[
                  styles.categoryPill,
                  wasteCategory === cat && styles.activeCategoryPill
                ]}
              >
                <Text style={[styles.categoryPillText, wasteCategory === cat && styles.activeCategoryPillText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.inputLabel, { marginTop: 24 }]}>PICKUP DAY</Text>
          <View style={styles.dayGrid}>
            {days.map((day, idx) => (
              <TouchableOpacity
                key={day}
                onPress={() => setPickupDay(idx)}
                style={[
                  styles.dayCircle,
                  pickupDay === idx && styles.activeDayCircle
                ]}
              >
                <Text style={[styles.dayCircleText, pickupDay === idx && styles.activeDayCircleText]}>{day[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.inputLabel, { marginTop: 24 }]}>TIME WINDOW</Text>
          <TextInput
            style={styles.input}
            value={timeWindow}
            onChangeText={setTimeWindow}
            placeholder="e.g. 08:00 AM - 10:00 AM"
            placeholderTextColor="#94A3B8"
          />

          <TouchableOpacity 
            style={[styles.saveBtn, createMutation.isPending && { opacity: 0.8 }]}
            onPress={handleAddSchedule}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveBtnText}>SAVE SCHEDULE</Text>
            )}
          </TouchableOpacity>
        </View>
      </SwipeableBottomSheet>

      {/* Premium Delete Confirmation */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Schedule"
        message="Are you sure you want to remove this pickup window? Residents in this zone will no longer see this schedule."
        confirmLabel="Delete"
        onConfirm={() => scheduleToDelete && deleteMutation.mutate(scheduleToDelete)}
        onCancel={() => setDeleteModalVisible(false)}
        isLoading={deleteMutation.isPending}
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  zoneIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  addBtn: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dayBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleInfo: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
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
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeCategoryPill: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeCategoryPillText: {
    color: '#FFFFFF',
  },
  dayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeDayCircle: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  dayCircleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  activeDayCircleText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  saveBtn: {
    marginTop: 32,
    backgroundColor: '#0F172A',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ZoneDetailScreen;
