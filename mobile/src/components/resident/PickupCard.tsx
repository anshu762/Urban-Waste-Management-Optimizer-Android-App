import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryBadge from '../common/CategoryBadge';
import { format, parseISO, differenceInDays } from 'date-fns';

interface PickupCardProps {
  date: string;
  category: string;
  timeWindow: string;
  showCountdown?: boolean;
}

const PickupCard: React.FC<PickupCardProps> = ({ date, category, timeWindow, showCountdown }) => {
  const pickupDate = parseISO(date);
  const daysUntil = differenceInDays(pickupDate, new Date());

  const getDayLabel = () => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return format(pickupDate, 'EEEE, MMM do');
  };

  return (
    <View style={styles.card}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Next pickup</Text>
        <View style={styles.chartPill}>
          <Text style={styles.chartPillText}>Scheduled</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.rowTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayLabel}>{getDayLabel()}</Text>
            <Text style={styles.dateTitle}>{format(pickupDate, 'MMMM do')}</Text>
          </View>
          <CategoryBadge category={category} />
        </View>

        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
          <Text style={styles.timeText}>{timeWindow}</Text>
        </View>

        {showCountdown && daysUntil >= 0 && (
          <View style={styles.countdown}>
            <Text style={styles.countdownText}>
              {daysUntil === 0 ? 'Happening today' : `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  chartPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.24)',
  },
  chartPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  body: {
    padding: 16,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  timeText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  countdown: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  countdownText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

export default PickupCard;
