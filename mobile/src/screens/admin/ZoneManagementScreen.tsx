import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getZonesApi } from '../../api/zone.api';
import { apiClient } from '../../config/api.config';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { parseError } from '../../lib/error-parser';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const ZoneManagementScreen = ({ navigation }: any) => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useErrorHandler();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<{ id: string, name: string } | null>(null);

  const [zoneName, setZoneName] = useState('');
  const [city, setCity] = useState('');
  const [areaCode, setAreaCode] = useState('');

  const { data: zones, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['zones'],
    queryFn: getZonesApi,
  });

  const createZoneMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/zones', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setIsModalVisible(false);
      setZoneName('');
      setCity('');
      setAreaCode('');
      showSuccess('Zone created successfully.');
    },
    onError: (err: any) => {
      showError(err);
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      showSuccess('Zone deactivated successfully.');
      setDeleteModalVisible(false);
      setZoneToDelete(null);
    },
    onError: (err: any) => {
      showError(err);
      setDeleteModalVisible(false);
    },
  });

  const handleOpenDelete = (id: string, name: string) => {
    setZoneToDelete({ id, name });
    setDeleteModalVisible(true);
  };

  const handleCreateZone = () => {
    if (!zoneName || !city) {
      showError('Zone Name and City are required');
      return;
    }
    createZoneMutation.mutate({ zoneName, city, areaCode });
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ZoneDetail', { zoneId: item.id, zoneName: item.zoneName })}
      style={styles.zoneCard}
      activeOpacity={0.7}
    >
      <View style={styles.cardMain}>
        <View style={styles.zoneInfo}>
          <Text style={styles.zoneNameText}>{item.zoneName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={12} color="#94A3B8" />
            <Text style={styles.locationText}>{item.city} • {item.areaCode || 'Global'}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#ECFDF5' : '#FEF2F2' }]}>
            <Text style={[styles.statusText, { color: item.isActive ? '#059669' : '#EF4444' }]}>
              {item.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => handleOpenDelete(item.id, item.zoneName)}
            style={styles.deleteIconBtn}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>Manage Schedules & Residents</Text>
        <Ionicons name="chevron-forward" size={12} color="#10B981" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Jurisdictions</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CITY SERVICE AREAS</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.addZoneBtn}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Syncing service zones...</Text>
        </View>
      ) : isError ? (
        <ErrorCard error={parseError(error)} onRetry={refetch} />
      ) : (
        <FlatList
          data={zones?.data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MANAGED REGIONS</Text>
              <Text style={styles.sectionCount}>{zones?.data?.length || 0} Total</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState emoji="📍" title="No zones found" subtitle="Create your first service zone to start scheduling pickups." />
          }
        />
      )}

      {/* Premium Create Zone Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>New Jurisdiction</Text>
                <Text style={styles.modalSubtitle}>Define a new service area</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ZONE NAME</Text>
                <TextInput
                  style={styles.input}
                  value={zoneName}
                  onChangeText={setZoneName}
                  placeholder="e.g. Sector 15"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 20 }]}>
                <Text style={styles.inputLabel}>CITY</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. New Delhi"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 20 }]}>
                <Text style={styles.inputLabel}>AREA CODE (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={areaCode}
                  onChangeText={setAreaCode}
                  placeholder="e.g. 110001"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <TouchableOpacity 
                style={[styles.createBtn, createZoneMutation.isPending && { opacity: 0.8 }]}
                onPress={handleCreateZone}
                disabled={createZoneMutation.isPending}
              >
                {createZoneMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.createBtnText}>ESTABLISH ZONE</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Premium Delete Confirmation */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Deactivate Zone"
        message={`Are you sure you want to deactivate ${zoneToDelete?.name}? This will suspend all collection operations in this area.`}
        confirmLabel="Deactivate"
        onConfirm={() => zoneToDelete && deleteZoneMutation.mutate(zoneToDelete.id)}
        onCancel={() => setDeleteModalVisible(false)}
        isLoading={deleteZoneMutation.isPending}
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
    fontSize: 24,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complaintsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  complaintsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 6,
  },
  addZoneBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  zoneCard: {
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
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  deleteIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
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
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
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
  createBtn: {
    marginTop: 32,
    backgroundColor: '#0F172A',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default ZoneManagementScreen;
