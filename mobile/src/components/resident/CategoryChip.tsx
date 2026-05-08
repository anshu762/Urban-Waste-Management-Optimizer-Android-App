import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface CategoryChipProps {
  category: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ category, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full m-1 border ${
        selected ? 'bg-green-500 border-green-500' : 'bg-transparent border-gray-400'
      }`}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-gray-700'}`}>
        {category}
      </Text>
    </TouchableOpacity>
  );
};
