import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMyComplaints } from '../../hooks/useComplaints';
import { useMyWasteLogs } from '../../hooks/useWasteLog';
import { StatusBadge } from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import { format } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';

export const MyReportsScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'logs' | 'complaints'>('logs');

  const {
    data: complaintsData,
    isLoading: complaintsLoading,
    isError: complaintsError,
    error: complaintsErr,
    refetch: refetchComplaints,
    fetchNextPage: fetchMoreComplaints,
    hasNextPage: hasMoreComplaints,
  } = useMyComplaints();
  const {
    data: logsData,
    isLoading: logsLoading,
    isError: logsError,
    error: logsErr,
    refetch: refetchLogs,
    fetchNextPage: fetchMoreLogs,
    hasNextPage: hasMoreLogs,
  } = useMyWasteLogs();

  const complaints = complaintsData?.pages.flatMap((page) => page.data.data) || [];
  const wasteLogs = logsData?.pages.flatMap((page: any) => page.data?.data || page.data || []) || [];

  const isLoading = activeTab === 'logs' ? logsLoading : complaintsLoading;
  const isError = activeTab === 'logs' ? logsError : complaintsError;
  const error = activeTab === 'logs' ? logsErr : complaintsErr;
  const refetch = activeTab === 'logs' ? refetchLogs : refetchComplaints;

  const renderWasteLog = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.rowCardTouchable}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('WasteLogDetail', { wasteLog: item })}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.rowHeader}>
          <View style={styles.kindPill}>
            <Ionicons name="leaf-outline" size={14} color="#059669" />
            <Text style={[styles.kindPillText, { marginLeft: 6 }]}>WASTE LOG</Text>
          </View>
          <Text style={styles.metaDate}>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</Text>
        </View>
        <View style={styles.badgeRow}>
          {(item.wasteCategories || []).map((cat: string) => (
            <View key={cat} style={styles.badgeWrap}>
              <CategoryBadge category={cat} />
            </View>
          ))}
        </View>
        <Text style={styles.detailLine} numberOfLines={2}>
          {(item.segregationStatus || '').replace(/_/g, ' ')}
          {item.quantityEstimate ? ` • ${item.quantityEstimate}` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  const renderComplaint = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.rowCardTouchable}
      onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id, complaint: item })}
      activeOpacity={0.65}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.rowHeader}>
          <StatusBadge status={item.status} />
          <Text style={styles.metaDate}>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</Text>
        </View>
        <Text style={styles.complaintPreview} numberOfLines={2}>
          {item.note || 'No description provided'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSub}>Your submissions and updates</Text>
      </View>

      <View style={styles.segmentWrap}>
        <View style={styles.segmentBg}>
          <TouchableOpacity
            style={[styles.segmentChip, activeTab === 'logs' && styles.segmentChipOn]}
            onPress={() => setActiveTab('logs')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="leaf"
              size={16}
              color={activeTab === 'logs' ? '#fff' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentText, activeTab === 'logs' && styles.segmentTextOn]}>Waste logs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentChip, activeTab === 'complaints' && styles.segmentChipOn]}
            onPress={() => setActiveTab('complaints')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="document-text"
              size={16}
              color={activeTab === 'complaints' ? '#fff' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentText, activeTab === 'complaints' && styles.segmentTextOn]}>
              Complaints
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : isError ? (
        <View style={styles.errorPad}>
          <ErrorCard error={parseError(error)} onRetry={() => refetch()} />
        </View>
      ) : activeTab === 'logs' ? (
        <FlatList
          data={wasteLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderWasteLog}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              emoji=""
              title="No waste logs yet"
              subtitle="Log waste from the Log tab when bags are ready for pickup."
            />
          }
          onEndReached={() => {
            if (hasMoreLogs) fetchMoreLogs();
          }}
          onEndReachedThreshold={0.5}
        />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id}
          renderItem={renderComplaint}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              emoji=""
              title="No complaints yet"
              subtitle="Use Report missed pickup from home if a collection was missed."
            />
          }
          onEndReached={() => {
            if (hasMoreComplaints) fetchMoreComplaints();
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 4 },
  segmentWrap: { paddingHorizontal: 16, paddingVertical: 14 },
  segmentBg: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  segmentChipOn: { backgroundColor: '#0F172A' },
  segmentText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  segmentTextOn: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 6 },
  rowCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  rowCardTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  kindPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  kindPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.6,
  },
  metaDate: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  badgeWrap: { marginRight: 8, marginBottom: 8 },
  detailLine: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  complaintPreview: { fontSize: 14, color: '#334155', lineHeight: 20, marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorPad: { padding: 16, flex: 1 },
});
