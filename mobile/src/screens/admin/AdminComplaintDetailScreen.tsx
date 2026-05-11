import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';
import { useUpdateComplaintStatus } from '../../hooks/useComplaints';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const { width } = Dimensions.get('window');

export const AdminComplaintDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { complaint } = route.params;
  const updateStatusMutation = useUpdateComplaintStatus();
  const { showError, showSuccess } = useErrorHandler();
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  if (!complaint) return null;

  const doUpdateStatus = (status: string) => {
    updateStatusMutation.mutate(
      { id: complaint.id, status },
      {
        onSuccess: () => {
          setConfirmStatus(null);
          showSuccess('Status updated.');
          navigation.goBack();
        },
        onError: (err: any) => {
          setConfirmStatus(null);
          showError(err);
        },
      }
    );
  };

  const handleUpdateStatus = (status: string) => {
    if (status === 'IN_PROGRESS') {
      doUpdateStatus(status);
    } else {
      setConfirmStatus(status);
    }
  };

  const isResolvedOrRejected = complaint.status === 'RESOLVED' || complaint.status === 'REJECTED';

  const renderStatusStep = (step: string, label: string, icon: any, isActive: boolean, isDone: boolean) => (
    <View style={styles.statusStep}>
      <View style={[
        styles.stepIconContainer,
        isDone ? styles.stepDone : isActive ? styles.stepActive : styles.stepPending
      ]}>
        <Ionicons 
          name={isDone ? 'checkmark' : icon} 
          size={16} 
          color={isDone || isActive ? '#FFFFFF' : '#94A3B8'} 
        />
      </View>
      <Text style={[
        styles.stepLabel,
        (isDone || isActive) ? styles.stepLabelActive : styles.stepLabelPending
      ]}>
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Case #{complaint.id.slice(-6).toUpperCase()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Tracker */}
        <View style={styles.trackerContainer}>
          {renderStatusStep('OPEN', 'Reported', 'radio-button-on', complaint.status === 'OPEN', complaint.status !== 'OPEN')}
          <View style={[styles.trackerLine, complaint.status !== 'OPEN' && styles.trackerLineDone]} />
          {renderStatusStep('IN_PROGRESS', 'Processing', 'sync', complaint.status === 'IN_PROGRESS', (complaint.status === 'RESOLVED' || complaint.status === 'REJECTED'))}
          <View style={[styles.trackerLine, (complaint.status === 'RESOLVED' || complaint.status === 'REJECTED') && styles.trackerLineDone]} />
          {renderStatusStep('RESOLVED', complaint.status === 'REJECTED' ? 'Rejected' : 'Resolved', complaint.status === 'REJECTED' ? 'close-circle' : 'checkmark-circle', isResolvedOrRejected, false)}
        </View>

        {/* Case Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="person-outline" size={14} color="#64748B" />
              <Text style={styles.infoLabel}>Resident</Text>
            </View>
            <Text style={styles.infoValue}>{complaint.user?.fullName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <Text style={styles.infoLabel}>Zone</Text>
            </View>
            <Text style={styles.infoValue}>{complaint.zone?.zoneName}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.infoLabel}>Reported On</Text>
            </View>
            <Text style={styles.infoValue}>
              {format(new Date(complaint.createdAt), 'MMM dd, yyyy • hh:mm a')}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoLabelGroup}>
              <Ionicons name="alert-circle-outline" size={14} color="#64748B" />
              <Text style={styles.infoLabel}>Current Status</Text>
            </View>
            <StatusBadge status={complaint.status} />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Description</Text>
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              {complaint.note || 'No detailed description provided by the resident.'}
            </Text>
          </View>
        </View>

        {/* Photo Proof Section */}
        {complaint.imageUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo Evidence</Text>
            <Image
              source={{ uri: complaint.imageUrl }}
              style={styles.proofImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Action Controls */}
        {!isResolvedOrRejected && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Administrative Actions</Text>
            
            <View style={{ gap: 12, marginTop: 4 }}>
              {complaint.status === 'OPEN' && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus('IN_PROGRESS')}
                  style={[styles.actionButton, styles.buttonProcessing]}
                >
                  <Ionicons name="sync" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Start Processing</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleUpdateStatus('RESOLVED')}
                style={[styles.actionButton, styles.buttonResolved]}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Mark as Resolved</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleUpdateStatus('REJECTED')}
                style={[styles.actionButton, styles.buttonRejected]}
              >
                <Ionicons name="close-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Reject Case</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={confirmStatus !== null}
        title={confirmStatus === 'RESOLVED' ? 'Resolve Complaint' : 'Reject Case'}
        message={
          confirmStatus === 'RESOLVED'
            ? 'This will mark the complaint as resolved. The resident will be notified.'
            : 'This will reject the complaint. The resident will be notified.'
        }
        confirmLabel={confirmStatus === 'RESOLVED' ? 'Resolve' : 'Reject'}
        isDanger={confirmStatus === 'REJECTED'}
        isLoading={updateStatusMutation.isPending}
        onConfirm={() => confirmStatus && doUpdateStatus(confirmStatus)}
        onCancel={() => setConfirmStatus(null)}
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
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
  },
  trackerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  statusStep: {
    alignItems: 'center',
    zIndex: 1,
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  stepPending: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  stepActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  stepDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepLabelPending: {
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: '#0F172A',
  },
  trackerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: -20,
    marginHorizontal: -10,
  },
  trackerLineDone: {
    backgroundColor: '#10B981',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  noteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  proofImage: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  actionSection: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonProcessing: {
    backgroundColor: '#3B82F6',
  },
  buttonResolved: {
    backgroundColor: '#10B981',
  },
  buttonRejected: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
