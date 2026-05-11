import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ErrorCard } from './ErrorCard';
import { ParsedError } from '../../lib/error-parser';

interface FullScreenErrorProps {
  error: ParsedError;
  onRetry?: () => void;
  onAction?: () => void;
}

export const FullScreenError: React.FC<FullScreenErrorProps> = (props) => {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <ErrorCard {...props} />
      
      <TouchableOpacity className="mt-8">
        <Text className="text-green-600 text-sm font-medium">
          Need help? Contact support
        </Text>
      </TouchableOpacity>
    </View>
  );
};
