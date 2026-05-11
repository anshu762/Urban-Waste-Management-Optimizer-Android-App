import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import CategoryBadge from '../../components/common/CategoryBadge';

type PillVariant = 'green' | 'slate' | 'amber' | 'red';

const Pill = ({ label, variant }: { label: string; variant: PillVariant }) => {
  const map: Record<PillVariant, { bg: string; text: string; border: string }> = {
    green: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
    slate: { bg: '#F1F5F9', text: '#334155', border: '#E2E8F0' },
    amber: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    red: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  };
  const cfg = map[variant];

  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.pillText, { color: cfg.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

export const WasteLogDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const wasteLog = route.params?.wasteLog;

  if (!wasteLog) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Waste log not found</Text>
          <Text style={styles.errorSub}>Please go back and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const segregationStatus = String(wasteLog.segregationStatus || '').replace(/_/g, ' ');
  const wasteCategories: string[] = wasteLog.wasteCategories || [];
  const quantityEstimate: string | undefined = wasteLog.quantityEstimate;
  const submittedDate = wasteLog.createdAt ? format(new Date(wasteLog.createdAt), 'MMM d, yyyy') : 'Submitted';

  const segregationPillVariant: PillVariant =
    wasteLog.segregationStatus === 'CORRECT'
      ? 'green'
      : wasteLog.segregationStatus === 'PARTIAL'
        ? 'amber'
        : wasteLog.segregationStatus === 'NOT_SEGREGATED'
          ? 'red'
          : 'slate';

  const statusTone =
    wasteLog.segregationStatus === 'CORRECT'
      ? { icon: 'checkmark-circle' as const, bg: '#ECFDF5', fg: '#047857', label: 'Ready for pickup' }
      : wasteLog.segregationStatus === 'PARTIAL'
        ? { icon: 'alert-circle' as const, bg: '#FFFBEB', fg: '#B45309', label: 'Needs review' }
        : wasteLog.segregationStatus === 'NOT_SEGREGATED'
          ? { icon: 'close-circle' as const, bg: '#FEF2F2', fg: '#B91C1C', label: 'Segregation issue' }
          : { icon: 'information-circle' as const, bg: '#F1F5F9', fg: '#475569', label: 'Submitted' };

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

          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Waste log</Text>
            <Text style={styles.headerSub}>{submittedDate}</Text>
          </View>

          <View style={[styles.headerStatusIcon, { backgroundColor: statusTone.bg }]}>
            <Ionicons name={statusTone.icon} size={20} color={statusTone.fg} />
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: statusTone.bg }]}>
              <Ionicons name={statusTone.icon} size={24} color={statusTone.fg} />
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>Log summary</Text>
              <Text style={styles.heroTitle}>{statusTone.label}</Text>
            </View>

            <Pill label={segregationStatus || '-'} variant={segregationPillVariant} />
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Categories</Text>
              <Text style={styles.summaryValue}>{wasteCategories.length || 0}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Quantity</Text>
              <Text style={styles.summaryValue}>{quantityEstimate ? 'Added' : 'None'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Waste categories</Text>
          </View>

          <View style={styles.categoryPanel}>
            <View style={styles.categoryRow}>
              {wasteCategories.length > 0 ? (
                wasteCategories.map((cat) => (
                  <View key={cat} style={styles.badgeWrap}>
                    <CategoryBadge category={cat} />
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>No categories</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="cube-outline" size={18} color="#0F766E" />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.sectionLabel}>Quantity (optional)</Text>
              <Text style={styles.valueText}>{quantityEstimate || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Next steps</Text>
            <View style={styles.nextIcon}>
              <Ionicons name="sparkles-outline" size={16} color="#7C3AED" />
            </View>
          </View>
          <Text style={styles.mutedLine}>
            Your waste log helps the team plan segregation handling. If your collection schedule changes,
            use "Report missed pickup" from Home.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
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
  headerCopy: { flex: 1, paddingHorizontal: 12 },
  headerStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  headerSub: { fontSize: 12, color: '#94A3B8', fontWeight: '700', marginTop: 2 },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroCopy: { flex: 1, paddingRight: 10 },
  heroLabel: { fontSize: 11, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { fontSize: 17, fontWeight: '900', color: '#FFFFFF', marginTop: 3 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 16 },
  summaryGrid: { flexDirection: 'row', gap: 10 },
  summaryItem: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 12,
  },
  summaryLabel: { fontSize: 11, fontWeight: '800', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: 0.6 },
  summaryValue: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', marginTop: 6 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  categoryPanel: {
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap' },
  badgeWrap: { marginRight: 8, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCopy: { flex: 1 },
  valueText: { fontSize: 14, fontWeight: '900', color: '#0F172A', marginTop: 8 },
  pill: {
    maxWidth: 104,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.3 },
  muted: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  mutedLine: { fontSize: 13, color: '#64748B', lineHeight: 20, marginTop: 2, fontWeight: '500' },
  nextIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: { height: 20 },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  errorSub: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 6, textAlign: 'center' },
});

