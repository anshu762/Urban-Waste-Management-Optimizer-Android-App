import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { updateProfileApi } from '../../api/user.api';
import { useAuthStore } from '../../stores/auth.store';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    buildingName: user?.residentProfile?.buildingName || '',
    block: user?.residentProfile?.block || '',
    street: user?.residentProfile?.street || '',
  });

  const updateMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => setIsEditing(false),
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-5">
        <View className="bg-white p-5 rounded-2xl border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">{user?.fullName}</Text>
          <Text className="text-gray-500 mt-1">{user?.email || user?.mobile || 'No contact added'}</Text>
          <View className="self-start bg-emerald-100 px-3 py-1 rounded-full mt-4">
            <Text className="text-emerald-700 font-bold text-xs">{user?.role}</Text>
          </View>
        </View>

        <View className="bg-white p-5 rounded-2xl border border-gray-100 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Address Details</Text>
          <Text className="text-gray-600">Zone: {user?.residentProfile?.zoneId || 'Not assigned'}</Text>
          <Text className="text-gray-600 mt-2">Building: {user?.residentProfile?.buildingName || 'Not set'}</Text>
          <Text className="text-gray-600 mt-2">Block: {user?.residentProfile?.block || 'Not set'}</Text>
          <Text className="text-gray-600 mt-2">Street: {user?.residentProfile?.street || 'Not set'}</Text>

          <TouchableOpacity onPress={() => setIsEditing(true)} className="bg-emerald-600 py-3 rounded-xl items-center mt-5">
            <Text className="text-white font-bold">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-auto p-5">
        <TouchableOpacity onPress={logout} className="bg-red-600 py-4 rounded-xl items-center">
          <Text className="text-white font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isEditing} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-5">
            <Text className="text-xl font-bold text-gray-900 mb-4">Edit Profile</Text>
            {(['buildingName', 'block', 'street'] as const).map((field) => (
              <View key={field} className="mb-3">
                <Text className="text-gray-700 font-medium mb-2">{field}</Text>
                <TextInput
                  value={form[field]}
                  onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                />
              </View>
            ))}
            <View className="flex-row mt-4 mb-4">
              <TouchableOpacity onPress={() => setIsEditing(false)} className="flex-1 py-4 items-center">
                <Text className="text-gray-500 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateMutation.mutate(form)}
                className="flex-1 bg-emerald-600 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">{updateMutation.isPending ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
