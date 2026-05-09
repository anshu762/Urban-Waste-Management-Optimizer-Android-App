import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export const ErrorState = ({ message = 'Something went wrong', onRetry }: Props) => (
  <View className="m-4 p-6 rounded-2xl bg-white border border-red-100 items-center">
    <Text className="text-4xl mb-3">❌</Text>
    <Text className="text-base font-bold text-gray-900 text-center">{message}</Text>
    {onRetry ? (
      <TouchableOpacity onPress={onRetry} className="mt-4 bg-emerald-600 px-5 py-3 rounded-xl">
        <Text className="text-white font-bold">Try Again</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);
