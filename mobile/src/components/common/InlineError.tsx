import React from 'react';
import { View, Text } from 'react-native';

interface InlineErrorProps {
  message: string;
  emoji?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ 
  message, 
  emoji = '⚠️' 
}) => {
  return (
    <View className="flex-row items-center bg-red-50 border border-red-200 rounded-lg p-3 my-2">
      <Text className="text-base mr-2">{emoji}</Text>
      <Text className="text-xs text-red-600 flex-1">{message}</Text>
    </View>
  );
};
