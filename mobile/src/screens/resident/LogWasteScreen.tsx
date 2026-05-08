import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AppButton } from '../../components/common/AppButton';
import { CategoryChip } from '../../components/resident/CategoryChip';
import { useSubmitWasteLog } from '../../hooks/useWasteLog';

const WASTE_CATEGORIES = ['WET', 'DRY', 'RECYCLABLE', 'SANITARY', 'EWASTE', 'HAZARDOUS'];

const SEGREGATION_OPTIONS = [
  { value: 'CORRECT', label: '✅ Correctly Segregated', description: 'All waste types are separated properly.' },
  { value: 'PARTIAL', label: '⚠️ Partially Segregated', description: 'Some waste types are mixed.' },
  { value: 'NOT_SEGREGATED', label: '❌ Not Segregated', description: 'All waste is mixed together.' },
];

export const LogWasteScreen = () => {
  const navigation = useNavigation();
  const submitWasteLogMutation = useSubmitWasteLog();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [segregationStatus, setSegregationStatus] = useState<string | null>(null);
  const [quantityEstimate, setQuantityEstimate] = useState<string>('');
  const [errors, setErrors] = useState<{ categories?: string; status?: string }>({});

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    if (errors.categories) setErrors(prev => ({ ...prev, categories: undefined }));
  };

  const handleSelectStatus = (status: string) => {
    setSegregationStatus(status);
    if (errors.status) setErrors(prev => ({ ...prev, status: undefined }));
  };

  const handleSubmit = () => {
    let hasError = false;
    const newErrors: { categories?: string; status?: string } = {};

    if (selectedCategories.length === 0) {
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
        wasteCategories: selectedCategories,
        segregationStatus: segregationStatus as any,
        quantityEstimate: quantityEstimate || undefined,
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Waste logged! ♻️',
            text2: 'Thank you for helping keep our city clean.',
          });
          navigation.goBack();
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error?.response?.data?.message || 'Failed to log waste',
          });
        },
      }
    );
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6 mt-4">Log Waste</Text>

      <View className="mb-6">
        <Text className="text-base font-semibold text-gray-800 mb-2">1. Waste Categories</Text>
        <View className="flex-row flex-wrap">
          {WASTE_CATEGORIES.map(category => (
            <CategoryChip
              key={category}
              category={category}
              selected={selectedCategories.includes(category)}
              onPress={() => toggleCategory(category)}
            />
          ))}
        </View>
        {errors.categories && <Text className="text-red-500 text-sm mt-1">{errors.categories}</Text>}
      </View>

      <View className="mb-6">
        <Text className="text-base font-semibold text-gray-800 mb-2">2. Segregation Status</Text>
        {SEGREGATION_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelectStatus(option.value)}
            className={`p-4 mb-2 rounded-xl border ${
              segregationStatus === option.value ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <Text className="text-base font-semibold text-gray-900">{option.label}</Text>
            <Text className="text-sm text-gray-600 mt-1">{option.description}</Text>
          </TouchableOpacity>
        ))}
        {errors.status && <Text className="text-red-500 text-sm mt-1">{errors.status}</Text>}
      </View>

      <View className="mb-8">
        <Text className="text-base font-semibold text-gray-800 mb-2">3. Quantity Estimate (Optional)</Text>
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900"
          placeholder="e.g. Small bag / Medium / Large"
          value={quantityEstimate}
          onChangeText={setQuantityEstimate}
        />
      </View>

      <AppButton
        title={submitWasteLogMutation.isPending ? 'Logging...' : 'Submit Waste Log'}
        onPress={handleSubmit}
        disabled={submitWasteLogMutation.isPending || selectedCategories.length === 0 || !segregationStatus}
      />
      <View className="h-10" />
    </ScrollView>
  );
};
