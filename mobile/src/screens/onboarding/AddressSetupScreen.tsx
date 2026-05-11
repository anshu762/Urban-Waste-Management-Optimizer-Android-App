import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { updateProfileApi } from '../../api/user.api';
import { getZonesApi } from '../../api/zone.api';
import { useAuthStore } from '../../stores/auth.store';
import { useErrorHandler } from '../../hooks/useErrorHandler';

export const AddressSetupScreen = ({ navigation }: any) => {
  const [zones, setZones] = useState<any[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(true);

  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useErrorHandler();

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await getZonesApi();
      if (res.success) {
        setZones(res.data);
        if (res.data.length > 0) {
          setSelectedZoneId(res.data[0].id);
        }
      }
    } catch (error) {
      showError('Failed to load zones');
    } finally {
      setIsLoadingZones(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        zoneId: selectedZoneId,
        buildingName,
        block,
        street,
        houseNumber,
        landmark,
      };
      const res = await updateProfileApi(payload);

      if (res.success) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            residentProfile: res.data,
          };
          const token = useAuthStore.getState().token;
          if (token) {
            await useAuthStore.getState().setAuth(updatedUser, token);
          }
        }

        await useAuthStore.getState().completeOnboarding();
        showSuccess('Address updated successfully');
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormField = ({ label, icon, value, onChangeText, placeholder }: any) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <View style={styles.fieldIconBox}>
          <Ionicons name={icon} size={16} color="#64748B" />
        </View>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#CBD5E1"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Zone</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Update Profile & Zone</Text>
        <Text style={styles.pageSubtitle}>We use this info to schedule your pickups.</Text>

        {/* Zone Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>SELECT YOUR ZONE</Text>

          {isLoadingZones ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.loadingText}>Loading zones…</Text>
            </View>
          ) : (
            <View style={styles.zoneList}>
              {zones.map((z) => {
                const selected = selectedZoneId === z.id;
                return (
                  <TouchableOpacity
                    key={z.id}
                    onPress={() => setSelectedZoneId(z.id)}
                    style={[styles.zoneItem, selected && styles.zoneItemActive]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.zoneRadio, selected && styles.zoneRadioActive]}>
                      {selected && <View style={styles.zoneRadioInner} />}
                    </View>
                    <View style={styles.zoneInfo}>
                      <Text style={[styles.zoneName, selected && styles.zoneNameActive]}>{z.zoneName}</Text>
                      <Text style={styles.zoneDesc}>{z.description || z.address || 'Service area'}</Text>
                    </View>
                    {selected && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Address Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>ADDRESS DETAILS</Text>

          <FormField label="Building Name" icon="business-outline" placeholder="e.g. Green Valley Apts" value={buildingName} onChangeText={setBuildingName} />
          <FormField label="Block / Wing" icon="grid-outline" placeholder="e.g. Block A" value={block} onChangeText={setBlock} />
          <FormField label="House / Flat Number" icon="home-outline" placeholder="e.g. 101" value={houseNumber} onChangeText={setHouseNumber} />
          <FormField label="Street" icon="navigate-outline" placeholder="e.g. Main Street" value={street} onChangeText={setStreet} />
          <FormField label="Landmark" icon="pin-outline" placeholder="e.g. Near City Park" value={landmark} onChangeText={setLandmark} />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.helperText}>You can update these details later from your profile.</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  backBtn: {
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  zoneList: {
    gap: 0,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  zoneItemActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  zoneRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  zoneRadioActive: {
    borderColor: '#10B981',
  },
  zoneRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  zoneNameActive: {
    color: '#065F46',
  },
  zoneDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 14,
    gap: 10,
  },
  fieldIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    gap: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  helperText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
    textAlign: 'center',
  },
});
