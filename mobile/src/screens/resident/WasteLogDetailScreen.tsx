import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import CategoryBadge from '../../components/common/CategoryBadge';

const Pill = ({ label, variant }: { label: string; variant: 'green' | 'slate' | 'amber' | 'red' }) => {
  const map: Record<typeof variant, { bg: string; text: string; border: string }> = {
    green: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
    slate: { bg: '#F1F5F9', text: '#334155', border: '#E2E8F0' },
    amber: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    red: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  };
  const cfg = map[variant];
  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.pillText, { color: cfg.text }]}>{label}</Text>
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

  const segregationPillVariant =
    wasteLog.segregationStatus === 'CORRECT'
      ? 'green'
      : wasteLog.segregationStatus === 'PARTIAL'
        ? 'amber'
        : wasteLog.segregationStatus === 'NOT_SEGREGATED'
          ? 'red'
          : 'slate';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Waste log</Text>
            <Text style={styles.headerSub}>
              {wasteLog.createdAt ? format(new Date(wasteLog.createdAt), 'MMM d, yyyy') : 'Submitted'}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Log summary</Text>
            <Pill label={segregationStatus || '—'} variant={segregationPillVariant} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Waste categories</Text>
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

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quantity (optional)</Text>
            <Text style={styles.valueText}>{quantityEstimate || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Next steps</Text>
            <View style={{ width: 1, height: 1 }} />
          </View>
          <Text style={styles.mutedLine}>
            Your waste log helps the team plan segregation handling. If your collection schedule changes,
            use “Report missed pickup” from Home.
          </Text>
        </View>

        <View style={{ height: 20 }} />
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
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
  section: { marginTop: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  badgeWrap: { marginRight: 8, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginTop: 14, marginBottom: 10 },
  valueText: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.3 },
  muted: { fontSize: 13, color: '#64748B', marginTop: 10, fontWeight: '600' },
  mutedLine: { fontSize: 13, color: '#64748B', lineHeight: 20, marginTop: 10, fontWeight: '500' },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  errorSub: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 6, textAlign: 'center' },
});

