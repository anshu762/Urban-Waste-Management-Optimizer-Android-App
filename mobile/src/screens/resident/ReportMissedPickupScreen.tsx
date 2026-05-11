import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { useSubmitComplaint } from '../../hooks/useComplaints';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { InlineError } from '../../components/common/InlineError';
import { useAuthStore } from '../../stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { getSchedulesByZone } from '../../api/schedule.api';

export const ReportMissedPickupScreen = () => {
  const navigation = useNavigation();
  const submitComplaintMutation = useSubmitComplaint();
  const { showError, showSuccess } = useErrorHandler();

  const user = useAuthStore((state) => state.user);
  const zoneId = user?.residentProfile?.zoneId;

  const { data: schedulesResponse, isLoading, isError } = useQuery({
    queryKey: ['zoneSchedules', zoneId],
    queryFn: () => getSchedulesByZone(zoneId!),
    enabled: !!zoneId,
  });

  const schedules = schedulesResponse?.data || [];

  const [note, setNote] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ note?: string }>({});

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (note.length > 500) {
      setErrors({ note: 'Note cannot exceed 500 characters' });
      return;
    }

    const formData = new FormData();
    if (note) formData.append('note', note);
    if (selectedScheduleId) formData.append('relatedScheduleId', selectedScheduleId);

    if (imageUri) {
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('image', { uri: imageUri, name: filename, type } as any);
    }

    submitComplaintMutation.mutate(formData, {
      onSuccess: () => {
        showSuccess('Report submitted.', 'Admin will review it soon.');
        navigation.goBack();
      },
      onError: (err: any) => {
        showError(err);
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.65}
        >
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="alert-circle" size={28} color="#DC2626" />
          </View>
          <Text style={styles.heroTitle}>Report missed pickup</Text>
          <Text style={styles.heroSub}>
            Help us follow up if your waste was not collected on schedule.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Related schedule</Text>
        <View style={styles.card}>
          <View style={styles.cardHeaderDark}>
            <Text style={styles.cardHeaderTitle}>Link a route slot</Text>
            <View style={styles.cardPillLight}>
              <Text style={styles.cardPillLightText}>Optional</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            {!zoneId ? (
              <Text style={styles.muted}>Set your service zone in profile to load schedules.</Text>
            ) : isLoading ? (
              <ActivityIndicator color="#0F172A" style={{ paddingVertical: 12 }} />
            ) : isError ? (
              <InlineError message="Could not load schedules" />
            ) : schedules.length === 0 ? (
              <Text style={styles.muted}>No active schedules for your zone.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.scheduleRow}>
                  {schedules.map((schedule: any) => {
                    const on = selectedScheduleId === schedule.id;
                    return (
                      <TouchableOpacity
                        key={schedule.id}
                        onPress={() =>
                          setSelectedScheduleId(schedule.id === selectedScheduleId ? null : schedule.id)
                        }
                        style={[styles.scheduleChip, on && styles.scheduleChipOn]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.scheduleChipText, on && styles.scheduleChipTextOn]} numberOfLines={2}>
                          {schedule.wasteCategory} • Day {schedule.pickupDay}
                        </Text>
                        <Text style={[styles.scheduleChipSub, on && styles.scheduleChipSubOn]} numberOfLines={1}>
                          {schedule.pickupTimeWindow}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        </View>

        <Text style={styles.sectionLabel}>What happened</Text>
        <View style={styles.card}>
          <View style={styles.cardHeaderDark}>
            <Text style={styles.cardHeaderTitle}>Description</Text>
            <View style={styles.cardPill}>
              <Text style={styles.cardPillText}>{note.length}/500</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <TextInput
              style={[styles.textArea, errors.note && styles.textAreaErr]}
              placeholder="Describe the missed collection, date observed, bags left out…"
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={(text) => {
                setNote(text);
                if (errors.note && text.length <= 500) setErrors({});
              }}
              maxLength={500}
            />
            {errors.note ? <Text style={styles.errText}>{errors.note}</Text> : null}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Evidence</Text>
        <View style={styles.card}>
          <View style={styles.cardHeaderDark}>
            <Text style={styles.cardHeaderTitle}>Photo</Text>
            <View style={styles.cardPillLight}>
              <Text style={styles.cardPillLightText}>Optional</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            {imageUri ? (
              <View>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhoto} onPress={() => setImageUri(null)} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addPhoto} onPress={pickImage} activeOpacity={0.75}>
                <View style={styles.addPhotoIcon}>
                  <Ionicons name="camera-outline" size={26} color="#64748B" />
                </View>
                <Text style={styles.addPhotoTitle}>Add a photo</Text>
                <Text style={styles.addPhotoSub}>Street or bin context helps the team verify</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <AppButton
          title={submitComplaintMutation.isPending ? 'Submitting…' : 'Submit report'}
          onPress={handleSubmit}
          disabled={submitComplaintMutation.isPending}
        />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backText: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginLeft: 2 },
  hero: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  heroSub: { fontSize: 14, color: '#64748B', lineHeight: 20, marginTop: 8, maxWidth: '98%' },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 6,
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
  muted: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  scheduleRow: { flexDirection: 'row', paddingVertical: 2 },
  scheduleChip: {
    maxWidth: 200,
    marginRight: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scheduleChipOn: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  scheduleChipText: { fontSize: 13, fontWeight: '800', color: '#334155' },
  scheduleChipTextOn: { color: '#fff' },
  scheduleChipSub: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: '600' },
  scheduleChipSubOn: { color: '#CBD5E1' },
  textArea: {
    minHeight: 120,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 22,
  },
  textAreaErr: { borderColor: '#F87171' },
  errText: { color: '#DC2626', fontSize: 13, marginTop: 8, fontWeight: '600' },
  preview: { width: '100%', height: 200, borderRadius: 16 },
  removePhoto: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  removePhotoText: { color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 6 },
  addPhoto: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 18,
    backgroundColor: '#FAFBFC',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  addPhotoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addPhotoTitle: { fontSize: 15, fontWeight: '800', color: '#334155' },
  addPhotoSub: { fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center' },
});
