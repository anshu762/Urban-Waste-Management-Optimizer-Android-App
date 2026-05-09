import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ emoji, title, subtitle, actionLabel, onAction }: Props) => (
  <View className="items-center justify-center px-6 py-12">
    <Text className="text-5xl mb-4">{emoji}</Text>
    <Text className="text-lg font-bold text-gray-900 text-center">{title}</Text>
    <Text className="text-sm text-gray-500 text-center mt-2 leading-5">{subtitle}</Text>
    {actionLabel && onAction ? (
      <TouchableOpacity onPress={onAction} className="mt-5 bg-emerald-600 px-5 py-3 rounded-xl">
        <Text className="text-white font-bold">{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);
