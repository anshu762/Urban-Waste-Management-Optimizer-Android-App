import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVehicles, useCreateVehicle, useDeleteVehicle } from '../../hooks/useVehicles';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { parseError } from '../../lib/error-parser';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { width, height } = Dimensions.get('window');

const VehicleManagementScreen = () => {
  const { showError, showSuccess } = useErrorHandler();
  const { data: vehiclesData, isLoading, isError, error, refetch } = useVehicles(true);
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('100');

  const vehicles = vehiclesData?.data || [];

  const summary = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter((v: any) => v.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [vehicles]);

  const handleCreate = async () => {
    if (!newVehicleNumber) return showError('Vehicle number is required');
    try {
      await createVehicle.mutateAsync({ 
        vehicleNumber: newVehicleNumber, 
        capacityUnits: parseInt(newCapacity) 
      });
      setModalVisible(false);
      setNewVehicleNumber('');
      setNewCapacity('100');
      showSuccess('Vehicle added successfully');
    } catch (err: any) {
      showError(err);
    }
  };

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteVehicle.mutateAsync(vehicleToDelete);
      showSuccess('Vehicle removed');
    } catch (err: any) {
      showError(err);
    } finally {
      setDeleteModalVisible(false);
      setVehicleToDelete(null);
    }
  };

  const renderVehicleItem = ({ item }: any) => (
    <View style={styles.vehicleCard}>
      <View style={styles.cardMain}>
        <View style={[styles.vehicleIconBox, { backgroundColor: item.isActive ? '#ECFDF5' : '#F8FAFC' }]}>
          <Ionicons name="bus" size={24} color={item.isActive ? '#10B981' : '#94A3B8'} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
          <View style={styles.specRow}>
            <Ionicons name="layers-outline" size={12} color="#94A3B8" />
            <Text style={styles.specText}>{item.capacityUnits} Capacity Units</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#ECFDF5' : '#F1F5F9' }]}>
            <Text style={[styles.statusText, { color: item.isActive ? '#059669' : '#64748B' }]}>
              {item.isActive ? 'ACTIVE' : 'OFF-DUTY'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Fleet Control</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>OPERATIONS ACTIVE</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Syncing fleet data...</Text>
        </View>
      ) : isError ? (
        <ErrorCard error={parseError(error)} onRetry={refetch} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderVehicleItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text style={styles.summaryTitle}>Fleet Overview</Text>
              </View>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{summary.total}</Text>
                  <Text style={styles.statLabel}>TOTAL FLEET</Text>
                </View>
                <View style={[styles.statItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' }]}>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>{summary.active}</Text>
                  <Text style={styles.statLabel}>OPERATIONAL</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#64748B' }]}>{summary.inactive}</Text>
                  <Text style={styles.statLabel}>OFF-DUTY</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState emoji="🚛" title="No vehicles in the fleet" subtitle="Add a collection vehicle to assign routes." />
          }
        />
      )}

      {/* Premium Add Vehicle Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register Vehicle</Text>
                <Text style={styles.modalSubtitle}>Add new asset to the fleet</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>VEHICLE NUMBER</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. MH-01-AB-1234"
                  placeholderTextColor="#94A3B8"
                  value={newVehicleNumber}
                  onChangeText={setNewVehicleNumber}
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 20 }]}>
                <Text style={styles.inputLabel}>CAPACITY (UNITS)</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="100"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={newCapacity}
                  onChangeText={setNewCapacity}
                />
              </View>

              <TouchableOpacity 
                style={[styles.confirmBtn, createVehicle.isPending && { opacity: 0.8 }]}
                onPress={handleCreate}
                disabled={createVehicle.isPending}
              >
                {createVehicle.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmBtnText}>ADD TO FLEET</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Premium Delete Confirmation */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Decommission Vehicle"
        message="Are you sure you want to remove this vehicle from the active fleet? This action cannot be undone."
        confirmLabel="Decommission"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        isLoading={deleteVehicle.isPending}
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  specText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '600',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingBottom: 40,
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
  confirmBtn: {
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
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default VehicleManagementScreen;
