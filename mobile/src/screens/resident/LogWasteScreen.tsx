import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { CategoryChip } from '../../components/resident/CategoryChip';
import { useSubmitWasteLog } from '../../hooks/useWasteLog';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const WASTE_CATEGORIES = ['WET', 'DRY', 'RECYCLABLE', 'SANITARY', 'EWASTE', 'HAZARDOUS'] as const;

const SEGREGATION_OPTIONS: {
  value: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}[] = [
  {
    value: 'CORRECT',
    label: 'Correctly segregated',
    description: 'All waste types are separated properly.',
    icon: 'checkmark-circle',
    iconColor: '#059669',
  },
  {
    value: 'PARTIAL',
    label: 'Partially segregated',
    description: 'Some waste types are mixed.',
    icon: 'alert-circle',
    iconColor: '#D97706',
  },
  {
    value: 'NOT_SEGREGATED',
    label: 'Not segregated',
    description: 'All waste is mixed together.',
    icon: 'close-circle',
    iconColor: '#DC2626',
  },
];

export const LogWasteScreen = () => {
  const navigation = useNavigation();
  const submitWasteLogMutation = useSubmitWasteLog();
  const { showError, showSuccess: showSuccessToast } = useErrorHandler();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [segregationStatus, setSegregationStatus] = useState<string | null>(null);
  const [quantityEstimate, setQuantityEstimate] = useState<string>('');
  const [errors, setErrors] = useState<{ categories?: string; status?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleCategory = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
    if (errors.categories) setErrors((prev) => ({ ...prev, categories: undefined }));
  };

  const handleSelectStatus = (status: string) => {
    setSegregationStatus(status);
    if (errors.status) setErrors((prev) => ({ ...prev, status: undefined }));
  };

  const handleSubmit = () => {
    let hasError = false;
    const newErrors: { categories?: string; status?: string } = {};

    if (!selectedCategory) {
      newErrors.categories = 'Please select at least one category.';
      hasError = true;
    }

    if (!segregationStatus) {
      newErrors.status = 'Please select segregation status.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    submitWasteLogMutation.mutate(
      {
        wasteCategories: selectedCategory ? [selectedCategory] : [],
        segregationStatus: segregationStatus as 'CORRECT' | 'PARTIAL' | 'NOT_SEGREGATED',
        quantityEstimate: quantityEstimate || undefined,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          showSuccessToast('Waste logged successfully!');
        },
        onError: (error: unknown) => {
          showError(error);
        },
      }
    );
  };

  const handleDone = () => {
    setShowSuccess(false);
    (navigation as { goBack: () => void }).goBack();
  };

  const segregationLabel =
    SEGREGATION_OPTIONS.find((o) => o.value === segregationStatus)?.label || '';

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Log waste</Text>
          <Text style={styles.headerSub}>Tell us what is ready for collection</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.card}>
            <View style={styles.cardHeaderDark}>
              <Text style={styles.cardHeaderTitle}>What are you logging?</Text>
              <View style={styles.cardPill}>
                <Text style={styles.cardPillText}>Step 1</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.chipWrap}>
                {WASTE_CATEGORIES.map((category) => (
                  <CategoryChip
                    key={category}
                    category={category}
                    selected={selectedCategory === category}
                    onPress={() => toggleCategory(category)}
                  />
                ))}
              </View>
              {errors.categories ? (
                <Text style={styles.errorSmall}>{errors.categories}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Segregation</Text>
          <View style={styles.card}>
            <View style={styles.cardHeaderDark}>
              <Text style={styles.cardHeaderTitle}>How it is sorted</Text>
              <View style={styles.cardPill}>
                <Text style={styles.cardPillText}>Step 2</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              {SEGREGATION_OPTIONS.map((option) => {
                const active = segregationStatus === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelectStatus(option.value)}
                    activeOpacity={0.7}
                    style={[styles.optionRow, active ? styles.optionRowActive : styles.optionRowIdle]}
                  >
                    <View style={[styles.optionIconWrap, { backgroundColor: `${option.iconColor}18` }]}>
                      <Ionicons name={option.icon} size={22} color={option.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>{option.label}</Text>
                      <Text style={styles.optionSub}>{option.description}</Text>
                    </View>
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={active ? '#0F172A' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                );
              })}
              {errors.status ? <Text style={styles.errorSmall}>{errors.status}</Text> : null}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.card}>
            <View style={styles.cardHeaderDark}>
              <Text style={styles.cardHeaderTitle}>Estimate (optional)</Text>
              <View style={styles.cardPillLight}>
                <Text style={styles.cardPillLightText}>Step 3</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Small bag, one bin, two bags..."
                placeholderTextColor="#94A3B8"
                value={quantityEstimate}
                onChangeText={setQuantityEstimate}
              />
            </View>
          </View>

          <AppButton
            title={submitWasteLogMutation.isPending ? 'Submitting…' : 'Submit waste log'}
            onPress={handleSubmit}
            disabled={submitWasteLogMutation.isPending || !selectedCategory || !segregationStatus}
          />
          <View style={{ height: 96 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDone} />
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="checkmark-circle" size={48} color="#059669" />
            </View>
            <Text style={styles.modalTitle}>Logged</Text>
            <Text style={styles.modalSub}>
              Your report was sent. The collection team can plan using this information.
            </Text>

            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>CATEGORIES</Text>
              <View style={styles.summaryChips}>
                {selectedCategory ? (
                  <View style={styles.summaryChip}>
                    <Text style={styles.summaryChipText}>{selectedCategory}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.summaryDivider} />
              <Text style={styles.summaryMuted}>Segregation</Text>
              <Text style={styles.summaryValue}>{segregationLabel}</Text>
              {quantityEstimate ? (
                <>
                  <View style={styles.summaryDivider} />
                  <Text style={styles.summaryMuted}>Quantity</Text>
                  <Text style={styles.summaryValue}>{quantityEstimate}</Text>
                </>
              ) : null}
            </View>

            <TouchableOpacity style={styles.modalCta} onPress={handleDone} activeOpacity={0.85}>
              <Text style={styles.modalCtaText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },
  sectionTitle: {
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
    marginBottom: 8,
  },
  cardHeaderDark: {
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
  cardPillText: { fontSize: 10, fontWeight: '900', color: '#34D399', letterSpacing: 0.5 },
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
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 0, justifyContent: 'flex-start' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  optionRowIdle: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' },
  optionRowActive: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  optionSub: { fontSize: 12, color: '#64748B', marginTop: 3, lineHeight: 16 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  errorSmall: { color: '#DC2626', fontSize: 13, marginTop: 10, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  modalSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22,
  },
  summary: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 22,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 10,
  },
  summaryChips: { flexDirection: 'row', flexWrap: 'wrap' },
  summaryChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  summaryChipText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  summaryDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  summaryMuted: { fontSize: 12, color: '#64748B' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  modalCta: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCtaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
