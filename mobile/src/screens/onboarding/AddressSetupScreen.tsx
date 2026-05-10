import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { updateProfileApi } from '../../api/user.api';
import { getZonesApi } from '../../api/zone.api';
import { useAuthStore } from '../../stores/auth.store';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { AuthBranding } from '../../components/auth/AuthBranding';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';
import { tokens } from '../../theme/tokens';

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
        // Update user data in store with the new profile info
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
           const updatedUser = { 
             ...currentUser, 
             residentProfile: res.data 
           };
           // We need to re-set auth to update the local storage and state
           const token = useAuthStore.getState().token;
           if (token) {
             await useAuthStore.getState().setAuth(updatedUser, token);
           }
        }
        
        await useAuthStore.getState().completeOnboarding();
        showSuccess('Address updated successfully');
      }
      
      // The RootNavigator will automatically react to the state change and switch to ResidentStack
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreen
      footer={<AuthPrimaryButton label="COMPLETE SETUP" onPress={handleSubmit} isLoading={isSubmitting} />}
    >
      <AuthBranding />

      <View style={styles.formContainer}>
        <View style={styles.headerTextSection}>
          <Text style={styles.titleText}>Setup Address</Text>
          <Text style={styles.subtitleText}>We need this to schedule your pickups.</Text>
        </View>

        <View style={styles.zoneSection}>
          <Text style={styles.zoneLabel}>SELECT ZONE</Text>

          {isLoadingZones ? (
            <View style={styles.zoneLoadingRow}>
              <ActivityIndicator size="small" color={tokens.colors.brand} />
              <Text style={styles.zoneLoadingText}>Loading zones…</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zoneScroll}>
              {zones.map((z) => {
                const selected = selectedZoneId === z.id;
                return (
                  <TouchableOpacity
                    key={z.id}
                    onPress={() => setSelectedZoneId(z.id)}
                    style={[styles.zonePill, selected && styles.zonePillActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.zoneText, selected && styles.zoneTextActive]}>{z.zoneName}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        <AuthTextField
          label="BUILDING NAME"
          leftIcon="business-outline"
          placeholder="e.g. Green Valley Apts"
          value={buildingName}
          onChangeText={setBuildingName}
        />

        <View style={{ marginTop: 16 }}>
          <AuthTextField
            label="BLOCK / WING"
            leftIcon="grid-outline"
            placeholder="e.g. Block A"
            value={block}
            onChangeText={setBlock}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <AuthTextField
            label="HOUSE / FLAT NUMBER"
            leftIcon="home-outline"
            placeholder="e.g. 101"
            value={houseNumber}
            onChangeText={setHouseNumber}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <AuthTextField
            label="STREET"
            leftIcon="navigate-outline"
            placeholder="e.g. Main Street"
            value={street}
            onChangeText={setStreet}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <AuthTextField
            label="LANDMARK"
            leftIcon="pin-outline"
            placeholder="e.g. Near City Park"
            value={landmark}
            onChangeText={setLandmark}
          />
        </View>

        <Text style={styles.helperText}>You can update these details later from your profile.</Text>
      </View>
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  headerTextSection: {
    marginBottom: 18,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: tokens.colors.text,
  },
  subtitleText: {
    fontSize: 13,
    color: tokens.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  zoneSection: {
    marginBottom: 14,
  },
  zoneLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: tokens.colors.textSubtle,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  zoneLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  zoneLoadingText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.textMuted,
  },
  zoneScroll: {
    paddingLeft: 2,
    paddingRight: 8,
    paddingVertical: 2,
  },
  zonePill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: tokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.10)',
    marginRight: 10,
  },
  zonePillActive: {
    backgroundColor: tokens.colors.text,
    borderColor: tokens.colors.text,
  },
  zoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.textMuted,
  },
  zoneTextActive: {
    color: tokens.colors.surface,
  },
  helperText: {
    fontSize: 12,
    color: tokens.colors.textSubtle,
    fontWeight: '600',
    marginTop: 14,
    marginLeft: 4,
  },
});
