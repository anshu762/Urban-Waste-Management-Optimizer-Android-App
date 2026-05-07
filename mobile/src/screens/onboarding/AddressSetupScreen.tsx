import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateProfileApi } from '../../api/user.api';
import { getZonesApi } from '../../api/zone.api';
import { AppToast } from '../../components/common/AppToast';
import { useAuthStore } from '../../stores/auth.store';

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
      AppToast.showError('Error', 'Failed to load zones');
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
      await updateProfileApi(payload);
      
      // Mark onboarding as complete
      await useAuthStore.getState().completeOnboarding();
      AppToast.showSuccess('Success', 'Address updated successfully');
      
      // The RootNavigator should react to this state change or we can manually navigate
      navigation.replace('ResidentHome'); // Assuming ResidentHome is the next screen
    } catch (error) {
      AppToast.showError('Submission Failed', 'Could not update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-primary mb-2">Setup Address</Text>
          <Text className="text-gray-500">We need this to schedule your pickups.</Text>
        </View>

        {isLoadingZones ? (
          <ActivityIndicator size="small" color="#16a34a" />
        ) : (
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Select Zone</Text>
            {/* Simple fallback: rendering them as text inputs or buttons. Ideally use a Picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
              {zones.map((z) => (
                <Text 
                  key={z.id} 
                  onPress={() => setSelectedZoneId(z.id)}
                  className={`px-4 py-2 border rounded-full mr-2 overflow-hidden ${selectedZoneId === z.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  {z.zoneName}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

        <AppInput label="Building Name" placeholder="e.g. Green Valley Apts" value={buildingName} onChangeText={setBuildingName} />
        <AppInput label="Block / Wing" placeholder="e.g. Block A" value={block} onChangeText={setBlock} />
        <AppInput label="House/Flat Number" placeholder="e.g. 101" value={houseNumber} onChangeText={setHouseNumber} />
        <AppInput label="Street" placeholder="e.g. Main Street" value={street} onChangeText={setStreet} />
        <AppInput label="Landmark" placeholder="e.g. Near City Park" value={landmark} onChangeText={setLandmark} />

        <View className="mt-6">
          <AppButton title="Complete Setup" onPress={handleSubmit} isLoading={isSubmitting} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
