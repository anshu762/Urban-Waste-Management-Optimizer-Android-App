import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeableBottomSheet } from '../common/SwipeableBottomSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StopDetailModalProps {
  visible: boolean;
  stop: any;
  onClose: () => void;
  onMarkCompleted: (stopId: string) => void;
  onSkip: (stopId: string, note: string) => void;
  onReportIssue: (stopId: string, note: string) => void;
  isUpdating?: boolean;
}

export const StopDetailModal: React.FC<StopDetailModalProps> = ({
  visible,
  stop,
  onClose,
  onMarkCompleted,
  onSkip,
  onReportIssue,
  isUpdating,
}) => {
  const [action, setAction] = useState<'skip' | 'report' | null>(null);

  if (!stop) return null;

  const resident = stop.residentProfile;
  const address = [
    resident?.houseNumber,
    resident?.buildingName,
    resident?.block,
    resident?.street,
  ]
    .filter(Boolean)
    .join(', ');

  const ActionButton = ({
    icon,
    label,
    color,
    bg,
    onPress,
  }: {
    icon: any;
    label: string;
    color: string;
    bg: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: bg }]}
      onPress={onPress}
      disabled={isUpdating}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  const skipOptions = [
    { label: 'Inaccessible', note: 'Inaccessible location' },
    { label: 'No Waste Out', note: 'No waste kept out' },
  ];

  const reportOptions = [
    { label: 'Overflowing Bin', note: 'Overflowing bin — needs extra capacity' },
    { label: 'Wrong Location', note: 'Wrong pickup location' },
  ];

  const backButton = (onBack: () => void) => (
    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
      <Ionicons name="arrow-back" size={18} color="#0F172A" />
      <Text style={styles.backBtnText}>Back</Text>
    </TouchableOpacity>
  );

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.stopStatusPill,
              {
                backgroundColor:
                  stop.stopStatus === 'COMPLETED'
                    ? '#ECFDF5'
                    : stop.stopStatus === 'SKIPPED'
                      ? '#FEF2F2'
                      : stop.stopStatus === 'DELAYED'
                        ? '#FFFBEB'
                        : '#F8FAFC',
              },
            ]}
          >
            <Text
              style={[
                styles.stopStatusText,
                {
                  color:
                    stop.stopStatus === 'COMPLETED'
                      ? '#059669'
                      : stop.stopStatus === 'SKIPPED'
                        ? '#DC2626'
                        : stop.stopStatus === 'DELAYED'
                          ? '#D97706'
                          : '#64748B',
                },
              ]}
            >
              {stop.stopStatus || 'PENDING'}
            </Text>
          </View>
          <Text style={styles.stopOrder}>Stop #{stop.stopOrder}</Text>
        </View>

        <Text style={styles.residentName}>{resident?.user?.fullName || 'Unknown'}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#64748B" />
          <Text style={styles.infoText}>{address || 'No address'}</Text>
        </View>

        {resident?.landmark ? (
          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={16} color="#64748B" />
            <Text style={styles.infoText}>{resident.landmark}</Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Ionicons name="trending-up-outline" size={16} color="#64748B" />
          <Text style={styles.infoText}>
            Priority Score: <Text style={styles.prioHighlight}>{stop.priorityScore}</Text>
          </Text>
        </View>

        {stop.issueNote ? (
          <View style={styles.issueCard}>
            <Text style={styles.issueLabel}>ISSUE NOTE</Text>
            <Text style={styles.issueText}>{stop.issueNote}</Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        {action === 'skip' ? (
          <>
            {backButton(() => setAction(null))}
            <Text style={styles.actionSectionLabel}>WHY SKIP?</Text>
            {skipOptions.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={styles.optionBtn}
                onPress={() => onSkip(stop.id, opt.note)}
              >
                <Ionicons name="arrow-forward-circle" size={20} color="#DC2626" />
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : action === 'report' ? (
          <>
            {backButton(() => setAction(null))}
            <Text style={styles.actionSectionLabel}>WHAT ISSUE?</Text>
            {reportOptions.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={styles.optionBtn}
                onPress={() => onReportIssue(stop.id, opt.note)}
              >
                <Ionicons name="alert-circle" size={20} color="#D97706" />
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.actionSectionLabel}>ACTIONS</Text>
            <View style={styles.actionsGrid}>
              <ActionButton
                icon="checkmark-circle"
                label="Complete"
                color="#059669"
                bg="#ECFDF5"
                onPress={() => onMarkCompleted(stop.id)}
              />
              <ActionButton
                icon="arrow-forward-circle"
                label="Skip"
                color="#DC2626"
                bg="#FEF2F2"
                onPress={() => setAction('skip')}
              />
              <ActionButton
                icon="alert-circle"
                label="Report Issue"
                color="#D97706"
                bg="#FFFBEB"
                onPress={() => setAction('report')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    maxHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  scroll: {
    padding: 24,
    paddingTop: 0,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stopStatusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stopOrder: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  residentName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  prioHighlight: {
    color: '#10B981',
    fontWeight: '800',
  },
  issueCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  issueLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
    marginBottom: 6,
  },
  issueText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  actionSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    gap: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});
