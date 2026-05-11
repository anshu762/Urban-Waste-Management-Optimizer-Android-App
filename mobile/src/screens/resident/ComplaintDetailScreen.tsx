import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { StatusBadge } from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

type TimelineKind = 'done' | 'active' | 'pending';

const TimelineRow = ({
  title,
  dateStr,
  iconName,
  kind,
  isLast,
}: {
  title: string;
  dateStr: string;
  iconName: keyof typeof Ionicons.glyphMap;
  kind: TimelineKind;
  isLast?: boolean;
}) => {
  const colors =
    kind === 'done'
      ? { iconBg: '#0F172A', iconFg: '#FFFFFF', label: '#0F172A', sub: '#64748B', line: '#E2E8F0' }
      : kind === 'active'
        ? { iconBg: '#059669', iconFg: '#FFFFFF', label: '#0F172A', sub: '#059669', line: '#A7F3D0' }
        : { iconBg: '#F1F5F9', iconFg: '#CBD5E1', label: '#64748B', sub: '#94A3B8', line: '#E2E8F0' };

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineIcon, { backgroundColor: colors.iconBg, borderColor: colors.line }]}>
          <Ionicons name={iconName} size={16} color={colors.iconFg} />
        </View>
        {!isLast ? <View style={[styles.timelineLine, { backgroundColor: colors.line }]} /> : null}
      </View>
      <View style={styles.timelineRight}>
        <Text style={[styles.timelineTitle, { color: colors.label }]}>{title}</Text>
        <Text style={[styles.timelineDate, { color: colors.sub }]}>{dateStr}</Text>
      </View>
    </View>
  );
};

export const ComplaintDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const complaint = route.params?.complaint;

  if (!complaint) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Report not found</Text>
          <Text style={styles.errorSub}>Please go back and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' = complaint.status;
  const createdAtStr = complaint.createdAt
    ? format(new Date(complaint.createdAt), 'MMM dd, yyyy • hh:mm a')
    : '—';
  const updatedAtStr =
    complaint.updatedAt && complaint.updatedAt !== complaint.createdAt
      ? format(new Date(complaint.updatedAt), 'MMM dd, yyyy • hh:mm a')
      : '';
  const resolvedAtStr = complaint.resolvedAt
    ? format(new Date(complaint.resolvedAt), 'MMM dd, yyyy • hh:mm a')
    : '';

  const isOpen = status === 'OPEN';
  const isInProgress = status === 'IN_PROGRESS';
  const isResolved = status === 'RESOLVED' || status === 'REJECTED';

  const processingLabel =
    status === 'IN_PROGRESS' ? 'Processing' : isOpen ? 'Awaiting review' : 'Processed';
  const processingDate = isInProgress
    ? updatedAtStr || '—'
    : isOpen
      ? 'Pending admin action'
      : updatedAtStr || resolvedAtStr || '—';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Report details</Text>
            <Text style={styles.headerSub}>ID: #{String(complaint.id || '').slice(-8).toUpperCase()}</Text>
          </View>
          <View style={{ width: 40 }}>
            <StatusBadge status={status} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Activity timeline</Text>
            <View style={styles.headerPill} />
          </View>

          <TimelineRow
            title="Reported"
            dateStr={createdAtStr}
            iconName="clipboard-outline"
            kind="done"
            isLast={false}
          />

          <TimelineRow
            title={processingLabel}
            dateStr={processingDate}
            iconName="sync"
            kind={isInProgress ? 'active' : isOpen ? 'pending' : 'done'}
            isLast={false}
          />

          <TimelineRow
            title={status === 'REJECTED' ? 'Rejected' : status === 'RESOLVED' ? 'Resolved' : 'Awaiting resolution'}
            dateStr={resolvedAtStr || 'Pending admin action'}
            iconName={status === 'REJECTED' ? 'close-circle' : 'checkmark-circle'}
            kind={isResolved ? 'active' : 'pending'}
            isLast
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Report details</Text>
          </View>

          {complaint.relatedSchedule ? (
            <View style={styles.relatedCard}>
              <Text style={styles.relatedLabel}>Related schedule</Text>
              <View style={styles.relatedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.relatedValue}>
                    {complaint.relatedSchedule.wasteCategory} Pickup
                  </Text>
                  <Text style={styles.relatedSub}>{complaint.relatedSchedule.pickupTimeWindow}</Text>
                </View>
                <CategoryBadge category={complaint.relatedSchedule.wasteCategory} />
              </View>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Your description</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{complaint.note || 'No description provided.'}</Text>
          </View>
        </View>

        {complaint.imageUrl ? (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Attached photo</Text>
            </View>
            <Image source={{ uri: complaint.imageUrl }} style={styles.photo} resizeMode="cover" />
          </View>
        ) : null}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  headerSub: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  headerPill: { width: 1, height: 1 },
  timelineRow: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  timelineLeft: { width: 24, alignItems: 'center' },
  timelineIcon: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, marginTop: 4, marginBottom: -4, borderRadius: 1 },
  timelineRight: { flex: 1 },
  timelineTitle: { fontSize: 13, fontWeight: '900', marginBottom: 4 },
  timelineDate: { fontSize: 12, fontWeight: '700' },
  relatedCard: {
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    padding: 12,
  },
  relatedLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  relatedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 12 },
  relatedValue: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  relatedSub: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  noteBox: { marginTop: 10, borderRadius: 18, backgroundColor: '#F8FAFC', padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  noteText: { fontSize: 14, color: '#0F172A', fontWeight: '700', lineHeight: 20 },
  photo: { width: '100%', height: 240, borderRadius: 18, backgroundColor: '#F1F5F9' },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  errorTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  errorSub: { marginTop: 6, fontSize: 13, color: '#64748B', fontWeight: '600', textAlign: 'center' },
});

