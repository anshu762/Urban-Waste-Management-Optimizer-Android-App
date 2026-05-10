import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { analyticsApi } from '../../../api/analytics.api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const InactiveResidentsScreen = ({ route }: any) => {
  const { zoneId } = route.params;
  const navigation = useNavigation();
  const [sending, setSending] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['inactiveResidents', zoneId],
    queryFn: () => analyticsApi.getInactiveResidents(zoneId),
  });

  const handleSendReminder = async () => {
    if (!data || data.residents.length === 0) return;

    Alert.alert(
      "Send Bulk Reminder",
      `Are you sure you want to send a push notification to ${data.residents.length} inactive residents?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send", 
          onPress: async () => {
            setSending(true);
            try {
              const userIds = data.residents.map(r => r.userId);
              await analyticsApi.sendBulkNotification(
                userIds, 
                "We miss you! 🗑️", 
                "Hi! Don't forget to log your waste before pickup day to keep our city clean."
              );
              Alert.alert("Success", `Reminder sent to ${userIds.length} residents`);
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || err.message || "Failed to send reminders");
            } finally {
              setSending(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const isVeryInactive = item.daysSinceLastLog >= 14;
    const initial = item.fullName?.charAt(0) || 'U';

    return (
      <View style={styles.residentCard}>
        <View style={styles.cardMain}>
          <View style={[styles.avatar, { backgroundColor: isVeryInactive ? '#FEF2F2' : '#F8FAFC' }]}>
            <Text style={[styles.avatarText, { color: isVeryInactive ? '#EF4444' : '#475569' }]}>{initial}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
            <View style={styles.statusRow}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.lastLogText}>
                {item.lastLogDate 
                  ? `${item.daysSinceLastLog} days since last log` 
                  : 'Never logged waste'}
              </Text>
            </View>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: isVeryInactive ? '#FEF2F2' : '#FFFBEB' }]}>
            <Text style={[styles.riskText, { color: isVeryInactive ? '#EF4444' : '#D97706' }]}>
              {isVeryInactive ? 'HIGH RISK' : 'INACTIVE'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Analyzing user retention...</Text>
      </SafeAreaView>
    );
  }

  const activeRatio = data ? ((data.totalResidents - data.totalInactive) / data.totalResidents) * 100 : 0;
  const inactiveRatio = data ? (data.totalInactive / data.totalResidents) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inactive Residents</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => refetch()} disabled={isFetching}>
          {isFetching ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <Ionicons name="refresh-outline" size={18} color="#0F172A" />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.residents}
        keyExtractor={item => item.userId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconBox}>
                <Ionicons name="people" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={styles.summaryTitle}>Retention Overview</Text>
                <Text style={styles.summarySubtitle}>
                  <Text style={{ fontWeight: '800', color: '#0F172A' }}>{data?.totalInactive}</Text> of {data?.totalResidents} users are inactive
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${activeRatio}%`, backgroundColor: '#10B981' }]} />
                <View style={[styles.progressFill, { width: `${inactiveRatio}%`, backgroundColor: '#EF4444' }]} />
              </View>
              <View style={styles.progressLabels}>
                <View style={styles.labelGroup}>
                  <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.labelText}>Active ({Math.round(activeRatio)}%)</Text>
                </View>
                <View style={styles.labelGroup}>
                  <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.labelText}>Inactive ({Math.round(inactiveRatio)}%)</Text>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </View>
            <Text style={styles.emptyTitle}>Everyone is active!</Text>
            <Text style={styles.emptySubtitle}>All residents in this zone have logged waste recently.</Text>
          </View>
        }
      />

      {/* Premium Floating Action Button */}
      {data?.residents && data.residents.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            onPress={handleSendReminder}
            disabled={sending}
            style={[styles.fab, sending && { opacity: 0.8 }]}
          >
            {sending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="white" />
                <Text style={styles.fabText}>
                  Send Bulk Reminder ({data.residents.length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  residentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  lastLogText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  fab: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default InactiveResidentsScreen;
