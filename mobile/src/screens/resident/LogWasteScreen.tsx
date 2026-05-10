import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '../../components/common/AppButton';
import { CategoryChip } from '../../components/resident/CategoryChip';
import { useSubmitWasteLog } from '../../hooks/useWasteLog';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const WASTE_CATEGORIES = ['WET', 'DRY', 'RECYCLABLE', 'SANITARY', 'EWASTE', 'HAZARDOUS'];

const SEGREGATION_OPTIONS = [
  { value: 'CORRECT', label: '✅ Correctly Segregated', description: 'All waste types are separated properly.' },
  { value: 'PARTIAL', label: '⚠️ Partially Segregated', description: 'Some waste types are mixed.' },
  { value: 'NOT_SEGREGATED', label: '❌ Not Segregated', description: 'All waste is mixed together.' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  WET: '🟢', DRY: '🟡', RECYCLABLE: '♻️', SANITARY: '🩺', EWASTE: '💻', HAZARDOUS: '☣️',
};

export const LogWasteScreen = () => {
  const navigation = useNavigation();
  const submitWasteLogMutation = useSubmitWasteLog();
  const { showError, showSuccess: showSuccessToast } = useErrorHandler();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [segregationStatus, setSegregationStatus] = useState<string | null>(null);
  const [quantityEstimate, setQuantityEstimate] = useState<string>('');
  const [errors, setErrors] = useState<{ categories?: string; status?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

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
          setShowSuccess(true);
          showSuccessToast("Waste logged successfully!");
        },
        onError: (error: any) => {
          showError(error);
        },
      }
    );
  };

  const handleDone = () => {
    setShowSuccess(false);
    (navigation as any).goBack();
  };

  const segregationLabel = SEGREGATION_OPTIONS.find(o => o.value === segregationStatus)?.label || '';

  return (
    <>
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
          title={submitWasteLogMutation.isPending ? 'Submitting...' : 'Submit Waste Log'}
          onPress={handleSubmit}
          disabled={submitWasteLogMutation.isPending || selectedCategories.length === 0 || !segregationStatus}
        />
        <View className="h-10" />
      </ScrollView>

      {/* ✅ Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
          <View className="bg-white rounded-3xl p-8 w-full items-center">
            <View className="bg-emerald-100 rounded-full p-5 mb-4">
              <Text className="text-5xl">♻️</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">Waste Logged!</Text>
            <Text className="text-gray-500 text-center mb-6">
              Your waste report has been submitted successfully. The collection team will be notified.
            </Text>

            {/* Summary */}
            <View className="bg-gray-50 rounded-2xl p-4 w-full mb-6">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-3">Your Report Summary</Text>
              
              <View className="flex-row flex-wrap mb-3">
                {selectedCategories.map(cat => (
                  <View key={cat} className="bg-emerald-100 px-3 py-1 rounded-full mr-2 mb-1 flex-row items-center">
                    <Text className="text-xs font-bold text-emerald-700">{CATEGORY_EMOJI[cat]} {cat}</Text>
                  </View>
                ))}
              </View>

              <View className="border-t border-gray-200 pt-3">
                <Text className="text-sm text-gray-500">Segregation</Text>
                <Text className="text-sm font-semibold text-gray-800">{segregationLabel}</Text>
              </View>

              {quantityEstimate ? (
                <View className="border-t border-gray-200 pt-3 mt-2">
                  <Text className="text-sm text-gray-500">Quantity</Text>
                  <Text className="text-sm font-semibold text-gray-800">{quantityEstimate}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleDone}
              className="bg-emerald-600 w-full py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-base">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
